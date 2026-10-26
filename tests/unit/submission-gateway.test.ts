import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/v1/[...path]/route";
const key = "test-only-api-key-over-32-characters-long";
const send = vi.fn();
beforeEach(() => {
  vi.stubEnv("API_BASE_URL", "https://api.test");
  vi.stubEnv("API_USER", "test-website");
  vi.stubEnv("API_KEY", key);
  vi.stubGlobal("fetch", send);
  send.mockReset();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
function request(
  origin = "https://site.test",
  body: object = { email: "reader@example.com" },
) {
  return new NextRequest("https://site.test/api/v1/subscriptions", {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      "X-API-Key": "browser-forgery",
      Cookie: "private-cookie=1",
      Authorization: "Bearer browser-token",
      "X-Visitor-IP": "203.0.113.99",
    },
    body: JSON.stringify(body),
  });
}
const context = { params: Promise.resolve({ path: ["subscriptions"] }) };
it("adds server credentials and never forwards browser cookies or credentials", async () => {
  send.mockResolvedValue(
    Response.json({ data: { message: "Thank you" } }, { status: 202 }),
  );
  const response = await POST(request(), context);
  expect(response.status).toBe(202);
  const [url, options] = send.mock.calls[0];
  expect(url).toBe("https://api.test/api/v1/subscriptions");
  expect(options.headers["X-API-User"]).toBe("test-website");
  expect(options.headers["X-API-Key"]).toBe(key);
  expect(options.headers).not.toHaveProperty("Cookie");
  expect(options.headers).not.toHaveProperty("Authorization");
  expect(options.headers).not.toHaveProperty("X-Visitor-IP");
  expect(await response.text()).not.toContain(key);
});
it("blocks unknown targets and cross-origin callers", async () => {
  expect(
    (
      await POST(request(), {
        params: Promise.resolve({ path: ["admin", "users"] }),
      })
    ).status,
  ).toBe(404);
  expect((await POST(request("https://evil.test"), context)).status).toBe(403);
  expect(send).not.toHaveBeenCalled();
});
it("fails closed when credentials are absent", async () => {
  vi.stubEnv("API_KEY", "");
  expect((await POST(request(), context)).status).toBe(503);
  expect(send).not.toHaveBeenCalled();
});
it("preserves validation fields but strips raw backend diagnostics", async () => {
  send.mockResolvedValue(
    Response.json(
      {
        error: {
          message: key,
          details: [
            { location: ["body", "email"], type: "value_error", input: key },
          ],
        },
      },
      { status: 422 },
    ),
  );
  const response = await POST(request(), context);
  expect(response.status).toBe(422);
  const body = await response.text();
  expect(body).toContain('"email"');
  expect(body).not.toContain(key);
});
it("preserves rate limit delays", async () => {
  send.mockResolvedValue(
    new Response(null, { status: 429, headers: { "Retry-After": "120" } }),
  );
  const response = await POST(request(), context);
  expect(response.status).toBe(429);
  expect(response.headers.get("Retry-After")).toBe("120");
});
it("only forwards the platform's verified IP header", async () => {
  vi.stubEnv("VERCEL", "1");
  send.mockResolvedValue(
    Response.json({ data: { message: "ok" } }, { status: 202 }),
  );
  const req = request();
  req.headers.set("x-vercel-forwarded-for", "203.0.113.8");
  await POST(req, context);
  expect(send.mock.calls[0][1].headers["X-Visitor-IP"]).toBe("203.0.113.8");
});
