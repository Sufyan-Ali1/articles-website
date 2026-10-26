import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, HEAD } from "@/app/r/[code]/route";
import { POST } from "@/app/api/analytics/visit/route";
import {
  COOKIE,
  decodeSession,
  encodeSession,
  externalReferrer,
  newSession,
} from "@/lib/analytics/session";

const secret = "test-only-analytics-ingest-secret-over-32-characters";
const linkId = "00000000-0000-4000-8000-000000000001";
const eventId = "00000000-0000-4000-8000-000000000002";
const upstream = vi.fn();
beforeEach(() => {
  vi.stubEnv("API_BASE_URL", "https://api.example.com");
  vi.stubEnv("ANALYTICS_INGEST_SECRET", secret);
  vi.stubGlobal("fetch", upstream);
  upstream.mockReset();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function visit(
  cookie?: string,
  path = "/articles/example",
  origin = "https://site.test",
) {
  return new NextRequest("https://site.test/api/analytics/visit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      ...(cookie ? { Cookie: `${COOKIE}=${cookie}` } : {}),
    },
    body: JSON.stringify({
      event_id: eventId,
      path,
      referrer: "https://linkedin.com/feed?private=value",
    }),
  });
}

describe("traffic attribution", () => {
  it("rejects tampered and expired cookies", () => {
    const session = newSession(linkId, null);
    const token = encodeSession(session, secret);
    expect(decodeSession(token, secret)?.linkId).toBe(linkId);
    expect(decodeSession(`${token}x`, secret)).toBeNull();
    expect(
      decodeSession(
        encodeSession({ ...session, expires: Date.now() - 1 }, secret),
        secret,
      ),
    ).toBeNull();
    expect(decodeSession(token, "another-secret")).toBeNull();
  });
  it("keeps only external referrer hosts", () => {
    expect(
      externalReferrer(
        "https://linkedin.com/feed?email=secret",
        "https://site.test",
      ),
    ).toBe("linkedin.com");
    expect(
      externalReferrer("https://site.test/articles/other", "https://site.test"),
    ).toBeNull();
    expect(
      externalReferrer("javascript:alert(1)", "https://site.test"),
    ).toBeNull();
  });
  it("redirects to a clean local article and signs an HttpOnly cookie", async () => {
    upstream.mockResolvedValue(
      Response.json({ data: { id: linkId, article_slug: "example" } }),
    );
    const response = await GET(
      new NextRequest("https://site.test/r/linkedin-01?ignored=secret"),
      { params: Promise.resolve({ code: "linkedin-01" }) },
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/articles/example");
    expect(response.headers.get("cache-control")).toContain("no-store");
    const cookie = response.headers.get("set-cookie")!;
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(
      decodeSession(response.cookies.get(COOKIE)?.value, secret)?.linkId,
    ).toBe(linkId);
    expect(JSON.stringify(upstream.mock.calls)).not.toContain(secret);
  });
  it("doesn't set a cookie for HEAD, or permit external redirects", async () => {
    upstream.mockResolvedValue(
      Response.json({ data: { id: linkId, article_slug: "example" } }),
    );
    const response = await HEAD(
      new NextRequest("https://site.test/r/linkedin-01", { method: "HEAD" }),
      { params: Promise.resolve({ code: "linkedin-01" }) },
    );
    expect(response.headers.get("set-cookie")).toBeNull();
    upstream.mockResolvedValue(
      Response.json({ data: { id: linkId, article_slug: "//evil.test" } }),
    );
    expect(
      (
        await GET(new NextRequest("https://site.test/r/linkedin-01"), {
          params: Promise.resolve({ code: "linkedin-01" }),
        })
      ).status,
    ).toBe(503);
  });
  it("sends signed attribution to the backend and retains the session on another article", async () => {
    upstream.mockResolvedValue(new Response(null, { status: 204 }));
    const session = newSession(linkId, null);
    const first = await POST(visit(encodeSession(session, secret)));
    expect(first.status).toBe(204);
    const body = JSON.parse(upstream.mock.calls[0][1].body);
    expect(body).toMatchObject({
      event_id: eventId,
      session_id: session.id,
      article_slug: "example",
      tracking_link_id: linkId,
    });
    expect(upstream.mock.calls[0][1].headers["X-Analytics-Key"]).toBe(secret);
    const second = await POST(
      visit(first.cookies.get(COOKIE)?.value, "/articles/another"),
    );
    expect(decodeSession(second.cookies.get(COOKIE)?.value, secret)?.id).toBe(
      session.id,
    );
    expect(JSON.parse(upstream.mock.calls[1][1].body).tracking_link_id).toBe(
      linkId,
    );
  });
  it("captures homepage referrals without recording an article view", async () => {
    const response = await POST(visit(undefined, "/"));
    expect(response.status).toBe(204);
    expect(upstream).not.toHaveBeenCalled();
    expect(
      decodeSession(response.cookies.get(COOKIE)?.value, secret)?.referrer,
    ).toBe("linkedin.com");
  });
  it("blocks cross-site requests and respects opt-out headers", async () => {
    expect(
      (await POST(visit(undefined, "/", "https://evil.test"))).status,
    ).toBe(403);
    const request = visit();
    request.headers.set("sec-gpc", "1");
    expect((await POST(request)).status).toBe(204);
    expect(upstream).not.toHaveBeenCalled();
  });
  it("does not expose backend errors or interrupt article reading", async () => {
    upstream.mockRejectedValue(new Error("private upstream details"));
    const response = await POST(visit());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private");
  });
});
