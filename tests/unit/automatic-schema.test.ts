import { describe, it, expect, vi } from "vitest";
vi.mock("@/lib/config", () => ({
  site: { name: "Ask & Explore", url: "https://askandexplore.com" },
  isIndexable: true,
}));
import { articleStructuredData } from "@/lib/seo/article";
import { safeJsonLd } from "@/lib/seo/metadata";
import { editorialProfileSchema } from "@/lib/seo/editorial-team";
import type { ArticleResponse } from "@/types/api";
describe("backend-owned schema", () => {
  it("renders only generated graphs for published articles", () => {
    const graph = {
      "@context": "https://schema.org",
      "@graph": [{ "@type": "BlogPosting" }],
    };
    const article = {
      published_at: "2026-01-01T00:00:00Z",
      schema: graph,
    } as unknown as ArticleResponse;
    expect(articleStructuredData(article)).toBe(graph);
    expect(
      articleStructuredData({ ...article, published_at: null }),
    ).toBeNull();
    expect(
      articleStructuredData({ ...article, schema: { "@type": "Article" } }),
    ).toBeNull();
  });
  it("escapes script injection without corrupting JSON", () => {
    const value = { headline: "</script><script>alert(1)</script>" };
    const output = safeJsonLd(value);
    expect(output).not.toContain("<");
    expect(JSON.parse(output)).toEqual(value);
  });
  it("keeps profile disabled until public verification", () => {
    expect(editorialProfileSchema()).toBeNull();
  });
});

it("includes parseable JSON-LD in server HTML without executing JavaScript", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [{ "@type": "BlogPosting", headline: "A real title" }],
  };
  const html = renderToStaticMarkup(
    createElement("script", {
      type: "application/ld+json",
      dangerouslySetInnerHTML: { __html: safeJsonLd(schema) },
    }),
  );
  expect(
    JSON.parse(html.match(/<script[^>]*>([\s\S]*?)<\/script>/)![1]),
  ).toEqual(schema);
});
