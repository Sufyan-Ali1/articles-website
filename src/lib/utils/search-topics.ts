import type { ArticleFilters, ArticleSummary } from "@/types/api";

export const searchTopics = [
  { key: "technology", label: "Technology" },
  { key: "automotive", label: "Automotive" },
  { key: "buying-guides", label: "Buying Guides" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "digital-safety", label: "Digital Safety" },
  { key: "travel", label: "Travel" },
] as const;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/guides$/, "guide");

export function parseSearchTopics(value: string | string[] | undefined) {
  const values = (Array.isArray(value) ? value : [value || ""]).flatMap(
    (item) => item.split(","),
  );
  if (values.includes("all")) return ["all"];
  const selected = searchTopics
    .filter((topic) => values.includes(topic.key))
    .map((topic) => topic.key);
  return selected.length ? selected : undefined;
}

export function selectedSearchTopics(filters: ArticleFilters): string[] {
  if (filters.topics?.length) return filters.topics;
  return searchTopics
    .filter((topic) =>
      [filters.category, filters.article_type].some(
        (value) => value && normalize(value) === normalize(topic.key),
      ),
    )
    .map((topic) => topic.key);
}

export function matchesSearchTopics(article: ArticleSummary, topics: string[]) {
  if (topics.includes("all")) return true;
  return topics.some((topic) => {
    const names = article.categories
      .filter((category) => category.is_active)
      .flatMap((category) => [category.slug, category.name]);
    if (topic === "buying-guides" && article.article_type?.is_active)
      names.push(article.article_type.slug, article.article_type.name);
    return names.some((name) => normalize(name) === normalize(topic));
  });
}
