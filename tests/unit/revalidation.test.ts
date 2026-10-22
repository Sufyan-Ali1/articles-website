import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  articleSlugTag,
  revalidationSchema,
  validBearer,
} from "@/lib/api/revalidation";
const invalidators = vi.hoisted(() => ({ path: vi.fn(), tag: vi.fn() }));
vi.mock("next/cache", () => ({
  revalidatePath: invalidators.path,
  revalidateTag: invalidators.tag,
}));
import { POST } from "@/app/api/revalidate/route";
const secret = "unit-test-independent-secret-over-32-characters";
const entity_id = "00000000-0000-4000-8000-000000000001";
const payload = {
  event: "article.update",
  entity_id,
  article_id: entity_id,
  slugs: ["new-slug", "old-slug"],
  tags: [
    "articles",
    `article:${entity_id}`,
    "article:new-slug",
    "article:old-slug",
  ],
};
function request(value: unknown, token = secret) {
  return new Request("https://site.test/api/revalidate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
}
beforeEach(() => {
  process.env.NEXTJS_REVALIDATION_SECRET = secret;
  vi.clearAllMocks();
});
describe("revalidation security", () => {
  it("rejects missing, incorrect, and unconfigured secrets", async () => {
    expect(validBearer(null, secret)).toBe(false);
    expect(validBearer(`Bearer ${secret}`, undefined)).toBe(false);
    expect((await POST(request(payload, "wrong"))).status).toBe(401);
    expect(invalidators.path).not.toHaveBeenCalled();
  });
  it("validates identities and restricts tags to the backend event", () => {
    expect(
      revalidationSchema.safeParse({ ...payload, tags: ["arbitrary:private"] })
        .success,
    ).toBe(false);
    expect(
      revalidationSchema.safeParse({ ...payload, article_id: null }).success,
    ).toBe(false);
    expect(
      revalidationSchema.safeParse({ ...payload, slugs: ["../admin"] }).success,
    ).toBe(false);
  });
  it("immediately expires tags and invalidates both slugs and affected listings", async () => {
    expect((await POST(request(payload))).status).toBe(200);
    expect(invalidators.tag).toHaveBeenCalledWith("articles", { expire: 0 });
    expect(invalidators.path).toHaveBeenCalledWith("/articles/old-slug");
    expect(invalidators.path).toHaveBeenCalledWith("/articles/new-slug");
    expect(invalidators.path).toHaveBeenCalledWith("/category/[slug]", "page");
    expect(invalidators.path).toHaveBeenCalledWith("/sitemap.xml");
  });
  it("handles classification events broadly and SHA-256 long-slug tags", async () => {
    const longSlug = "a".repeat(350);
    expect(articleSlugTag(longSlug)).toMatch(
      /^article-slug-sha256:[a-f0-9]{64}$/,
    );
    expect(
      revalidationSchema.safeParse({
        ...payload,
        slugs: [longSlug],
        tags: [articleSlugTag(longSlug)],
      }).success,
    ).toBe(true);
    await POST(
      request({
        ...payload,
        event: "classification.update",
        article_id: null,
        slugs: [],
        tags: ["categories"],
      }),
    );
    expect(invalidators.path).toHaveBeenCalledWith("/articles/[slug]", "page");
  });
  it("rejects malformed and oversized bodies without invalidation", async () => {
    const malformed = new Request("https://site.test/api/revalidate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: "{",
    });
    expect((await POST(malformed)).status).toBe(400);
    expect((await POST(request({ text: "x".repeat(17000) }))).status).toBe(413);
    expect(invalidators.tag).not.toHaveBeenCalled();
  });
});
