import { backendHeaders } from "./backend-auth";
import "server-only";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { configuredApiUrl } from "@/lib/security/urls";
import { readBoundedJson } from "@/lib/security/read-json";
import {
  ArticleResponseSchema,
  ArticleSummarySchema,
  CategoryResponseSchema,
  ClassificationResponseSchema,
  MetaSchema,
  ErrorResponseSchema,
} from "./schemas";
import type {
  ArticleFilters,
  CategoryResponse,
  ClassificationResponse,
  Collection,
  Page,
} from "@/types/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export function apiOrigin() {
  const value = process.env.API_BASE_URL;
  if (!value)
    throw new ApiError(
      503,
      "not_configured",
      "The publication is being connected. Please check back shortly.",
    );
  const url = configuredApiUrl(value);
  if (!url)
    throw new ApiError(
      503,
      "configuration_error",
      "The publication is temporarily unavailable.",
    );
  return url;
}
async function request<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  try {
    const response = await fetch(`${apiOrigin()}/api/v1/${path}`, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
      headers: backendHeaders(),
    });
    if (!response.ok) {
      const parsed = ErrorResponseSchema.safeParse(
        await readBoundedJson(response).catch(() => null),
      );
      throw new ApiError(
        response.status,
        parsed.success ? parsed.data.error.code : "upstream_error",
        response.status === 404
          ? "This page could not be found."
          : "We couldn’t load the latest stories. Please try again.",
        response.headers.get("X-Request-ID") ||
          (parsed.success ? parsed.data.error.request_id : undefined),
      );
    }
    const result = schema.safeParse(await readBoundedJson(response));
    if (!result.success)
      throw new ApiError(
        502,
        "invalid_response",
        "We couldn’t load this content. Please try again.",
      );
    return result.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      503,
      "unavailable",
      "The publication is temporarily unavailable. Please try again shortly.",
    );
  }
}
function query(filters: object) {
  return new URLSearchParams(
    Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  ).toString();
}
const articlePageSchema = z.object({
  data: z.array(ArticleSummarySchema).max(100),
  meta: MetaSchema,
});
async function fetchArticles(filters: ArticleFilters = {}) {
  return request(
    `articles?${query({ page: 1, page_size: 12, sort: "-published_at", ...filters })}`,
    articlePageSchema,
  );
}
export async function getArticles(filters: ArticleFilters = {}) {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 120 });
  cacheTag("articles");
  return fetchArticles(filters);
}
export const searchArticles = fetchArticles;
// React cache shares detail reads between metadata and page only within one render.
export const getArticle = cache(async (slug: string) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 350)
    throw new ApiError(404, "not_found", "Article not found.");
  const result = await request(
    `articles/${encodeURIComponent(slug)}`,
    z.object({ data: ArticleResponseSchema }),
  );
  return result.data;
});
async function getCachedClassification(collection: Collection, slug: string) {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 120 });
  cacheTag(collection);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 180)
    return null;
  const schema =
    collection === "categories"
      ? CategoryResponseSchema
      : ClassificationResponseSchema;
  try {
    const result = await request(
      `${collection}/${encodeURIComponent(slug)}`,
      z.object({ data: schema }),
    );
    return result.data.is_active ? result.data : null;
  } catch (error) {
    // Cache boundaries serialize errors and do not preserve custom Error prototypes.
    // Represent a known 404 as data, then raise the routing error outside the cache.
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
export async function getClassification(collection: Collection, slug: string) {
  const result = await getCachedClassification(collection, slug);
  if (!result) throw new ApiError(404, "not_found", "Page not found.");
  return result;
}
export async function getClassifications(
  collection: "categories",
): Promise<CategoryResponse[]>;
export async function getClassifications(
  collection: "tags" | "article-types",
): Promise<ClassificationResponse[]>;
export async function getClassifications(
  collection: Collection,
): Promise<(CategoryResponse | ClassificationResponse)[]> {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 120 });
  cacheTag(collection);
  const schema =
    collection === "categories"
      ? CategoryResponseSchema
      : ClassificationResponseSchema;
  return collectPages(async (page) =>
    request(
      `${collection}?${query({ page, page_size: 100, sort: "name" })}`,
      z.object({ data: z.array(schema).max(100), meta: MetaSchema }),
    ),
  );
}
export async function collectPages<T>(
  loader: (page: number) => Promise<Page<T>>,
) {
  const first = await loader(1);
  if (
    first.meta.pages > 1000 ||
    first.meta.total > 100000 ||
    first.meta.page !== 1
  )
    throw new ApiError(
      503,
      "collection_limit",
      "This collection is too large to load at once.",
    );
  const items = [...first.data];
  let bytes = Buffer.byteLength(JSON.stringify(first.data), "utf8");
  for (let page = 2; page <= first.meta.pages; page++) {
    const next = await loader(page);
    if (
      next.meta.page !== page ||
      next.meta.page_size !== first.meta.page_size ||
      next.meta.pages !== first.meta.pages ||
      next.meta.total !== first.meta.total
    )
      throw new ApiError(
        503,
        "collection_changed",
        "Content changed while loading. Please try again.",
      );
    bytes += Buffer.byteLength(JSON.stringify(next.data), "utf8");
    if (bytes > 32 * 1024 * 1024)
      throw new ApiError(
        503,
        "collection_limit",
        "This collection is too large to load at once.",
      );
    items.push(...next.data);
  }
  return items;
}
export async function getSitemapArticles() {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 120 });
  cacheTag("articles");
  return collectPages((page) => fetchArticles({ page, page_size: 100 }));
}
