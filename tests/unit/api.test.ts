import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
import {
  ApiError,
  collectPages,
  getArticles,
  getArticle,
} from "@/lib/api/client";
import { ArticleSummarySchema, RequestCreateSchema } from "@/lib/api/schemas";
beforeEach(() => {
  vi.stubEnv("API_BASE_URL", "https://api.test");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("public API boundary", () => {
  it("encodes filters without introducing an unsupported status query", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [],
          meta: { page: 1, page_size: 12, total: 0, pages: 0 },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetch);
    await getArticles({ search: "a & b", category: "technology" });
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.pathname).toBe("/api/v1/articles");
    expect(url.searchParams.get("search")).toBe("a & b");
    expect(url.searchParams.has("status")).toBe(false);
    expect(fetch.mock.calls[0][1]).not.toHaveProperty("headers.Authorization");
    expect(fetch.mock.calls[0][1].headers["X-API-User"]).toBe("test-website");
    expect(fetch.mock.calls[0][1].headers["X-API-Key"]).toBe(
      "test-only-api-key-over-32-characters-long",
    );
    expect(fetch.mock.calls[0][1]).toMatchObject({ redirect: "error" });
  });
  it("keeps backend errors distinct from successful empty results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "database_unavailable",
              message: "Private diagnostic",
              request_id: "request-123",
            },
          }),
          { status: 503 },
        ),
      ),
    );
    await expect(getArticles()).rejects.toMatchObject({
      status: 503,
      code: "database_unavailable",
      requestId: "request-123",
    });
  });
  it("rejects malformed success envelopes and unavailable configuration", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response('{"items": []}')),
    );
    await expect(getArticles()).rejects.toMatchObject({
      code: "invalid_response",
    });
    vi.stubEnv("API_BASE_URL", "");
    await expect(getArticles()).rejects.toBeInstanceOf(ApiError);
  });
  it("does not persistently cache article details or accept path traversal", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 404 }));
    vi.stubGlobal("fetch", fetch);
    await expect(getArticle("valid-slug")).rejects.toMatchObject({
      status: 404,
    });
    expect(fetch.mock.calls[0][1]).toMatchObject({ cache: "no-store" });
    fetch.mockClear();
    await expect(getArticle("../admin")).rejects.toMatchObject({ status: 404 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("loads every classification/sitemap source page and rejects a changing collection", async () => {
    const loader = vi.fn(async (page: number) => ({
      data: [page],
      meta: { page, page_size: 1, total: 3, pages: 3 },
    }));
    expect(await collectPages(loader)).toEqual([1, 2, 3]);
    expect(loader).toHaveBeenCalledTimes(3);
    await expect(
      collectPages(async (page) => ({
        data: [page],
        meta: { page, page_size: 1, total: page === 1 ? 3 : 4, pages: 3 },
      })),
    ).rejects.toMatchObject({ code: "collection_changed" });
  });
  it("rejects oversized collection metadata before fetching additional pages", async () => {
    const loader = vi.fn(async () => ({
      data: [],
      meta: { page: 1, page_size: 100, total: 100001, pages: 1001 },
    }));
    await expect(collectPages(loader)).rejects.toMatchObject({
      code: "collection_limit",
    });
    expect(loader).toHaveBeenCalledTimes(1);
  });
  it("rejects an upstream pagination loop instead of collecting duplicate pages", async () => {
    await expect(
      collectPages(async () => ({
        data: [1],
        meta: { page: 1, page_size: 1, total: 2, pages: 2 },
      })),
    ).rejects.toMatchObject({ code: "collection_changed" });
  });
  it("requires the actual published summary shape and topic contract", () => {
    expect(
      ArticleSummarySchema.safeParse({ title: "Incomplete" }).success,
    ).toBe(false);
    expect(RequestCreateSchema.safeParse({ topic: "" }).success).toBe(false);
    expect(RequestCreateSchema.safeParse({ topic: "Question" }).success).toBe(
      true,
    );
  });
});
