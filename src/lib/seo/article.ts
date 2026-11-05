import { isPublishedArticle } from "@/lib/utils/article-publication";
import { parseDocument } from "htmlparser2";
import { textContent } from "domutils";
import { sanitizeArticle } from "@/lib/security/article-sanitizer";
import { metadata } from "./metadata";
import type { ArticleResponse } from "@/types/api";

export function cleanExcerpt(value: string | null | undefined) {
  return textContent(parseDocument(sanitizeArticle(value || "")))
    .replace(/\s+/g, " ")
    .trim();
}

export function articleMetadata(article: ArticleResponse) {
  return metadata(
    article.meta_title?.trim() || article.title,
    article.meta_description?.trim() ||
      cleanExcerpt(article.excerpt) ||
      `Read ${article.title} at Ask & Explore.`,
    `/articles/${article.slug}`,
    {
      article: true,
      noindex: !isPublishedArticle(article),
      image: article.featured_image,
      published: article.published_at,
      modified: article.updated_at,
      author: article.author?.name,
    },
  );
}

// Keep the separate backend lists intact; only the rendered schema combines them.
export function articleKeywords(
  article: Pick<ArticleResponse, "primary_keywords" | "secondary_keywords">,
) {
  const seen = new Set<string>();
  return [
    ...(article.primary_keywords || []),
    ...(article.secondary_keywords || []),
  ]
    .map((keyword) => keyword.trim())
    .filter((keyword) => {
      const key = keyword.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

// The backend is the sole article graph authority. Never merge legacy JSON-LD.
export function articleStructuredData(article: ArticleResponse): unknown {
  if (!isPublishedArticle(article)) return null;
  const schema = article.schema;
  return schema && Array.isArray(schema["@graph"]) ? schema : null;
}
