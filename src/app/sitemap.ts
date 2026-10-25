import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { headers } from "next/headers";
import { getClassifications, getSitemapArticles } from "@/lib/api/client";
import { isIndexable, site } from "@/lib/config";

const staticPaths = [
  "/",
  "/articles",
  "/categories",
  "/about",
  "/contact",
  "/request-article",
  "/privacy",
  "/terms",
  "/disclaimer",
];

function validSlug(slug: string, maxLength: number) {
  return slug.length <= maxLength && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function lastModified(value: string, fallback?: string | null) {
  const date = [value, fallback].find(
    (candidate) => candidate && Number.isFinite(Date.parse(candidate)),
  );
  return date ? new Date(date).toISOString() : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const localDevelopment =
    process.env.NODE_ENV === "development" && !process.env.CONTEXT;
  // Developers can inspect the XML locally; robots.txt still blocks indexing.
  // Non-production deployment previews continue to return an empty sitemap.
  if (!isIndexable && !localDevelopment) return [];

  let origin = site.url;
  const localHosts = ["localhost", "127.0.0.1", "[::1]"];
  if (localDevelopment && localHosts.includes(new URL(origin).hostname)) {
    const host = (await headers()).get("host");
    if (host) {
      const requested = new URL(`http://${host}`);
      if (localHosts.includes(requested.hostname)) origin = requested.origin;
    }
  }

  // These helpers follow every API page and share the webhook-invalidated cache.
  // Let API failures propagate rather than publish an incomplete successful XML.
  const [articles, categories, tags] = await Promise.all([
    getSitemapArticles(),
    getClassifications("categories"),
    getClassifications("tags"),
  ]);
  const items: MetadataRoute.Sitemap = [
    ...staticPaths.map((path) => ({ url: new URL(path, origin).href })),
    ...articles
      .filter((article) => validSlug(article.slug, 350))
      .map((article) => ({
        url: new URL(`/articles/${article.slug}`, origin).href,
        lastModified: lastModified(article.updated_at, article.published_at),
      })),
    ...categories
      .filter((c) => c.is_active && validSlug(c.slug, 180))
      .map((c) => ({
        url: new URL(`/category/${c.slug}`, origin).href,
        lastModified: lastModified(c.updated_at, c.created_at),
      })),
    ...tags
      .filter((t) => t.is_active && validSlug(t.slug, 180))
      .map((t) => ({
        url: new URL(`/tag/${t.slug}`, origin).href,
        lastModified: lastModified(t.updated_at, t.created_at),
      })),
  ];
  const unique = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const item of items) {
    const existing = unique.get(item.url);
    if (
      !existing ||
      (item.lastModified &&
        (!existing.lastModified ||
          Date.parse(String(item.lastModified)) >
            Date.parse(String(existing.lastModified))))
    )
      unique.set(item.url, item);
  }
  if (unique.size > 50000)
    throw new Error(
      "Sitemap exceeds 50,000 URLs; sitemap partitioning is required.",
    );
  return [...unique.values()];
}
