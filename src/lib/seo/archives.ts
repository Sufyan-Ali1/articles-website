import { cache } from "react";
import { notFound } from "next/navigation";
import { collectPages, getArticles, searchArticles } from "@/lib/api/client";
import { matchesSearchTopics } from "@/lib/utils/search-topics";
import type { ArticleFilters, ArticleSummary, Page } from "@/types/api";

// A primitive cache key shares the same result across metadata and body reads.
const readArchive = cache(async (key: string) => {
  const filters: ArticleFilters = JSON.parse(key);
  if (filters.topics?.length && !filters.topics.includes("all")) {
    const candidates = await collectPages((page) =>
      searchArticles({ ...filters, page, page_size: 100 }),
    );
    const matches = candidates.filter((article) =>
      matchesSearchTopics(article, filters.topics!),
    );
    const page = filters.page || 1;
    const size = filters.page_size || 12;
    return {
      data: matches.slice((page - 1) * size, page * size),
      meta: {
        page,
        page_size: size,
        total: matches.length,
        pages: Math.ceil(matches.length / size),
      },
    };
  }
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
