import { cache } from "react";
import { notFound } from "next/navigation";
import { getArticles, searchArticles } from "@/lib/api/client";
import type { ArticleFilters, ArticleSummary, Page } from "@/types/api";

// A primitive cache key shares the same result across metadata and body reads.
const readArchive = cache(async (key: string) => {
  const filters: ArticleFilters = JSON.parse(key);
  return filters.search ? searchArticles(filters) : getArticles(filters);
});

export async function getArchiveResult(filters: ArticleFilters) {
  return readArchive(JSON.stringify(filters));
}

export function checkArchivePage(
  filters: ArticleFilters,
  result: Page<ArticleSummary>,
) {
  if ((filters.page || 1) > Math.max(1, result.meta.pages)) notFound();
  return result;
}
