import type { ArticleFilters } from "@/types/api";
import { parseSearchTopics } from "./search-topics";
export type SearchParams = Record<string, string | string[] | undefined>;
export const sorts = [
  { value: "-published_at", label: "Newest first" },
  { value: "published_at", label: "Oldest first" },
  { value: "-view_count", label: "Most viewed" },
  { value: "title", label: "Title A–Z" },
];
export function parseFilters(params: SearchParams): ArticleFilters {
  const one = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const slug = (key: string) =>
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(one(key)) && one(key).length <= 180
      ? one(key)
      : undefined;
  const page = Number(one("page"));
  const topics = parseSearchTopics(params.topics);
  return {
    page: Number.isInteger(page) && page >= 1 && page <= 8000 ? page : 1,
    page_size: 12,
    sort: sorts.some((s) => s.value === one("sort"))
      ? one("sort")
      : "-published_at",
    search: one("search").trim().slice(0, 200) || undefined,
    category: slug("category"),
    tag: slug("tag"),
    article_type: slug("article_type"),
    ...(topics ? { topics } : {}),
  };
}
export function filterUrl(
  path: string,
  filters: ArticleFilters,
  page?: number,
  view?: "grid" | "list",
) {
  const params = new URLSearchParams();
  for (const key of [
    "search",
    "category",
    "tag",
    "article_type",
    "sort",
  ] as const) {
    const value = filters[key];
    if (value && !(key === "sort" && value === "-published_at"))
      params.set(key, value);
  }
  if (view) params.set("view", view);
  if (filters.topics?.length) params.set("topics", filters.topics.join(","));
  const selectedPage = page ?? filters.page ?? 1;
  if (selectedPage > 1) params.set("page", String(selectedPage));
  return `${path}${params.size ? `?${params}` : ""}`;
}
