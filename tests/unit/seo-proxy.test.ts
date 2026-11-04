import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

beforeEach(() => vi.stubEnv("API_BASE_URL", "https://api.test"));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("pre-stream HTTP status checks", () => {
  it("returns 404 only when the backend confirms missing content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("missing", { status: 404 })),
    );
    const result = await proxy(
      new NextRequest("https://site.test/articles/missing-story"),
    );
    expect(result.status).toBe(404);
    expect(result.headers.get("x-robots-tag")).toBe("noindex");
    expect(result.headers.get("x-middleware-rewrite")).toBe(
      "https://site.test/__missing-content",
    );
  });

  it("never turns an outage or failed preflight into a false missing-page response", async () => {
    for (const timeout of [false, true]) {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          timeout
            ? Promise.reject(new Error("timeout"))
            : Promise.resolve(new Response("unavailable", { status: 503 })),
        ),
      );
      const result = await proxy(
        new NextRequest("https://site.test/articles/existing-story"),
      );
      expect(result.headers.get("x-middleware-next")).toBe("1");
      expect(result.headers.has("x-middleware-rewrite")).toBe(false);
    }
  });

  it("uses result totals to distinguish valid and empty pagination", async () => {
    const fetch = vi.fn<(input: string) => Promise<Response>>(() =>
      Promise.resolve(
        Response.json({
          meta: { page: 1, page_size: 1, total: 15, pages: 15 },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetch);
    expect(
      (
        await proxy(new NextRequest("https://site.test/articles?page=2"))
      ).headers.get("x-middleware-next"),
    ).toBe("1");
    expect(
      (await proxy(new NextRequest("https://site.test/articles?page=3")))
        .status,
    ).toBe(404);
    const upstream = new URL(fetch.mock.calls[0][0]);
    expect(upstream.searchParams.get("page_size")).toBe("1");
    expect(upstream.searchParams.get("page")).toBe("1");
  });
});
