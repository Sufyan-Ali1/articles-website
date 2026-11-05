import { describe, expect, it, vi } from "vitest";
import type { ArticleResponse } from "@/types/api";
vi.mock("@/lib/config", () => ({
  site: { name: "Ask & Explore", url: "https://askandexplore.com" },
  isIndexable: true,
}));
import { articleMetadata, articleStructuredData } from "@/lib/seo/article";
import { ArticleResponseSchema, ArticleSummarySchema } from "@/lib/api/schemas";
import { metadata, socialImageUrl } from "@/lib/seo/metadata";
const article = {
  slug: "example",
  title: "Article title",
  meta_title: "SEO title",
  meta_description: "SEO description",
  excerpt: "<p>Clean &amp; useful <b>excerpt</b>.</p>",
  featured_image: "/images/featured.jpg",
  published_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  author: { id: "1", name: "An Editor" },
  schema: null,
} as ArticleResponse;

describe("automatic article SEO", () => {
  it("uses existing SEO fields, canonical, HTTPS images and preview directives", () => {
    const output = articleMetadata(article);
    expect(output).toMatchObject({
      title: "SEO title",
      description: "SEO description",
      robots: { index: true, follow: true, "max-image-preview": "large" },
      openGraph: {
        type: "article",
        title: "SEO title",
        url: "https://askandexplore.com/articles/example",
        images: [{ url: "https://askandexplore.com/images/featured.jpg" }],
      },
      twitter: { card: "summary_large_image" },
    });
  });
  it("falls back to the title and clean excerpt; missing/unsafe images use a summary card", () => {
    for (const image of [
      null,
      "http://example.com/photo.jpg",
      "javascript:alert(1)",
      "https://127.0.0.1/photo.jpg",
    ]) {
      expect(
        articleMetadata({
          ...article,
          meta_title: "  ",
          meta_description: null,
          featured_image: image,
        }),
      ).toMatchObject({
        title: article.title,
        description: "Clean & useful excerpt.",
        twitter: { card: "summary", images: [] },
      });
    }
    expect(
      articleMetadata({ ...article, meta_description: null, excerpt: null })
        .description,
    ).toContain(article.title);
    expect(socialImageUrl("//example.com/image.jpg")).toBeNull();
  });
  it("noindexes undated and future articles and preserves intentional restrictions", () => {
    for (const published_at of [null, "invalid", "2999-01-01"]) {
      expect(articleMetadata({ ...article, published_at }).robots).toEqual({
        index: false,
        follow: true,
      });
    }
    expect(
      metadata("Search", "Description", "/search", { noindex: true }).robots,
    ).toEqual({ index: false, follow: true });
  });
  it("does not invent fallback schema when the backend has no graph", () => {
    expect(articleStructuredData(article)).toBeNull();
    expect(articleStructuredData({ ...article, author: null })).toBeNull();
  });
  it("passes the backend graph through without rewriting entities", () => {
    const source = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          headline: article.title,
          publisher: { name: "Old" },
          author: { name: "An Editor" },
        },
        {
          "@type": "Article",
          url: "https://other.example/story",
          headline: "Other",
        },
      ],
    };
    const result = articleStructuredData({
      ...article,
      schema: source,
    }) as typeof source;
    expect(result).toBe(source);
    expect(result["@graph"][1]).toEqual(source["@graph"][1]);
    expect(source["@graph"][0].publisher).toEqual({ name: "Old" });
  });
});

describe("backend article keyword integration", () => {
  it("retains keyword arrays in both API contracts while accepting older responses", () => {
    for (const schema of [ArticleSummarySchema, ArticleResponseSchema]) {
      const fields = schema.pick({
        primary_keywords: true,
        secondary_keywords: true,
      });
      expect(
        fields.parse({
          primary_keywords: ["laptop repair"],
          secondary_keywords: ["repair guide"],
        }),
      ).toEqual({
        primary_keywords: ["laptop repair"],
        secondary_keywords: ["repair guide"],
      });
      expect(fields.parse({})).toEqual({});
      for (const value of [
        null,
        "keyword",
        [""],
        ["x".repeat(301)],
        Array(101).fill("x"),
      ]) {
        expect(fields.safeParse({ primary_keywords: value }).success).toBe(
          false,
        );
      }
    }
  });
  it("does not generate fallback keywords or alter metadata", () => {
    const source = {
      ...article,
      primary_keywords: [" laptop repair ", "Laptop Repair"],
      secondary_keywords: ["repair guide", "laptop repair", "spare parts"],
    };
    expect(articleStructuredData(source)).toBeNull();
    expect(articleMetadata(source)).toEqual(articleMetadata(article));
    expect(articleMetadata(source)).not.toHaveProperty("keywords");
    expect(source.primary_keywords).toEqual([
      " laptop repair ",
      "Laptop Repair",
    ]);
  });
  it("leaves keyword generation to the backend", () => {
    const schema = {
      "@graph": [
        { "@type": "BlogPosting", headline: article.title, keywords: ["old"] },
        {
          "@type": "BlogPosting",
          url: "https://other.example/story",
          headline: "Other",
          keywords: ["unrelated"],
        },
      ],
    };
    const result = articleStructuredData({
      ...article,
      schema,
      primary_keywords: ["repair"],
      secondary_keywords: ["parts"],
    }) as typeof schema;
    expect(result).toBe(schema);
    expect(result["@graph"][1]).toEqual(schema["@graph"][1]);
    expect(schema["@graph"][0].keywords).toEqual(["old"]);
    const cleared = articleStructuredData({
      ...article,
      schema,
      primary_keywords: [],
      secondary_keywords: [],
    }) as typeof schema;
    expect(cleared).toBe(schema);
    const legacy = articleStructuredData({
      ...article,
      schema,
    }) as typeof schema;
    expect(legacy["@graph"][0].keywords).toEqual(["old"]);
  });
});
