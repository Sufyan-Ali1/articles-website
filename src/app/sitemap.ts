import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getClassifications, getSitemapArticles } from "@/lib/api/client";
import { isIndexable, site } from "@/lib/config";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  if (!isIndexable) return [];
  const [articles, categories, tags] = await Promise.all([
    getSitemapArticles(),
    getClassifications("categories"),
    getClassifications("tags"),
  ]);
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
  const items: MetadataRoute.Sitemap = [
    ...staticPaths.map((path) => ({ url: new URL(path, site.url).href })),
    ...articles.map((a) => ({
      url: new URL(`/articles/${a.slug}`, site.url).href,
      lastModified: a.updated_at,
    })),
    ...categories
      .filter((c) => c.is_active)
      .map((c) => ({
        url: new URL(`/category/${c.slug}`, site.url).href,
        lastModified: c.updated_at,
      })),
    ...tags
      .filter((t) => t.is_active)
      .map((t) => ({
        url: new URL(`/tag/${t.slug}`, site.url).href,
        lastModified: t.updated_at,
      })),
  ];
  if (items.length > 50000)
    throw new Error(
      "Sitemap exceeds 50,000 URLs; sitemap partitioning is required.",
    );
  return items;
}
