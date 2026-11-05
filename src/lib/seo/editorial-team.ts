import publication from "@/lib/publication.json";
import { editorialTeam, isEditorialTeam } from "@/lib/content/editorial-team";
import { site } from "@/lib/config";
import type { ArticleResponse } from "@/types/api";

export function editorialOrganization() {
  const url = new URL(editorialTeam.path, site.url).href;
  return {
    "@type": "Organization",
    "@id": `${url}#organization`,
    name: editorialTeam.name,
    url,
    logo: new URL(editorialTeam.logo, site.url).href,
    description: editorialTeam.description,
  };
}

export function editorialProfileSchema() {
  if (!publication.profileEnabled) return null;
  const url = new URL(editorialTeam.path, site.url).href;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${url}#profile`,
    url,
    name: editorialTeam.name,
    description: editorialTeam.description,
    mainEntity: editorialOrganization(),
  };
}

export function editorialArticleSchema(article: ArticleResponse) {
  if (!isEditorialTeam(article.author)) return article.schema;
  const url = new URL(`/articles/${article.slug}`, site.url).href;
  let matched = false;
  function normalize(value: unknown, primary = false): unknown {
    if (Array.isArray(value)) return value.map((item) => normalize(item));
    if (!value || typeof value !== "object") return value;
    const node = value as Record<string, unknown>;
    const types = Array.isArray(node["@type"])
      ? node["@type"]
      : [node["@type"]];
    const isArticle = types.some((type) =>
      ["Article", "BlogPosting", "NewsArticle"].includes(String(type)),
    );
    // Only the primary article (or an unqualified backend article node) belongs to this byline.
    const current =
      isArticle &&
      (primary ||
        !node.url ||
        node.url === url ||
        node.headline === article.title);
    if (current) matched = true;
    return {
      ...node,
      ...(current ? { author: editorialOrganization() } : {}),
      ...(Array.isArray(node["@graph"])
        ? { "@graph": node["@graph"].map((item) => normalize(item)) }
        : {}),
    };
  }
  const normalized = normalize(article.schema, true);
  if (matched) return normalized;
  const fallback = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: article.title,
    author: editorialOrganization(),
    ...(article.excerpt ? { description: article.excerpt } : {}),
    ...(article.featured_image ? { image: article.featured_image } : {}),
    ...(article.published_at &&
    Number.isFinite(Date.parse(article.published_at))
      ? { datePublished: article.published_at }
      : {}),
    ...(Number.isFinite(Date.parse(article.updated_at))
      ? { dateModified: article.updated_at }
      : {}),
  };
  return normalized ? [normalized, fallback] : fallback;
}
