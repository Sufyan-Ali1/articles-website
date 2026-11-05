import publication from "@/lib/publication.json";
import { editorialTeam, isEditorialTeam } from "@/lib/content/editorial-team";
import { site } from "@/lib/config";
import type { ArticleResponse } from "@/types/api";

export function editorialOrganization() {
  const url = new URL(editorialTeam.path, site.url).href;
  return {
    "@type": "Organization",
    "@id": `${url}#author`,
    name: editorialTeam.name,
    url,
    logo: new URL(editorialTeam.logo, site.url).href,
    description:
      "The Ask & Explore Editorial Team is the shared author identity for practical guides, comparisons, and explanations published under this byline. Its editorial principles emphasize relevant evidence, clear writing, accuracy, transparency, and useful information for readers.",
    mainEntityOfPage: { "@id": `${url}#webpage` },
    parentOrganization: { "@id": `${site.url}/#organization` },
    publishingPrinciples: new URL("/disclaimer", site.url).href,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Editorial feedback and corrections",
      url: new URL("/contact", site.url).href,
    },
  };
}

export function editorialProfileSchema() {
  if (!publication.profileEnabled) return null;
  const url = new URL(editorialTeam.path, site.url).href;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${url}#webpage`,
        url,
        name: "Ask & Explore Editorial Team | Author Profile & Standards",
        headline: editorialTeam.name,
        description:
          "Meet the Ask & Explore Editorial Team. Learn about our shared author identity, editorial process, research principles, content accuracy, and practical guides covering technology, automotive, buying guides, lifestyle, digital safety, and travel.",
        inLanguage: "en",
        isPartOf: { "@id": `${site.url}/#website` },
        mainEntity: { "@id": `${url}#author` },
        publisher: { "@id": `${site.url}/#organization` },
        about: [
          "Editorial standards",
          "Content research and accuracy",
          "Editorial transparency",
          "Technology guides",
          "Automotive information",
          "Buying guides",
          "Lifestyle advice",
          "Digital safety",
          "Travel planning",
        ].map((name) => ({ "@type": "Thing", name })),
      },
      editorialOrganization(),
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        url: new URL("/", site.url).href,
        logo: {
          "@type": "ImageObject",
          url: new URL(editorialTeam.logo, site.url).href,
        },
        description:
          "Ask & Explore publishes helpful guides, product comparisons, and practical explanations covering automotive, technology, buying guides, lifestyle, digital safety, and travel.",
        publishingPrinciples: new URL("/disclaimer", site.url).href,
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: new URL("/", site.url).href,
        name: site.name,
        inLanguage: "en",
        publisher: { "@id": `${site.url}/#organization` },
      },
    ],
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
