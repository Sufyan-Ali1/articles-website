import type { ArticleSummary } from "@/types/api";

const generic = new Set([
  "with",
  "your",
  "what",
  "which",
  "before",
  "after",
  "about",
  "guide",
  "guides",
  "best",
  "use",
  "more",
  "everyday",
  "things",
  "should",
  "that",
  "this",
  "from",
  "have",
  "does",
  "into",
  "under",
]);
const words = (title: string) =>
  new Set(
    title
      .toLowerCase()
      .match(/[a-z]{4,}/g)
      ?.filter((word) => !generic.has(word)) || [],
  );

export function selectRelatedArticles(
  article: ArticleSummary,
  candidates: ArticleSummary[],
) {
  const tags = new Set(
    article.tags.filter((t) => t.is_active).map((t) => t.id),
  );
  const categories = new Set(
    article.categories.filter((c) => c.is_active).map((c) => c.id),
  );
  const titleWords = words(article.title);
  const unique = new Map(
    candidates
      .filter((item) => item.slug !== article.slug)
      .map((item) => [item.slug, item]),
  );
  return [...unique.values()]
    .map((item) => {
      const sharedTags = item.tags.filter(
        (t) => t.is_active && tags.has(t.id),
      ).length;
      const sameCategory = item.categories.some(
        (c) => c.is_active && categories.has(c.id),
      );
      const sharedWords = [...words(item.title)].filter((word) =>
        titleWords.has(word),
      ).length;
      return { item, score: sharedTags * 4 + (sameCategory ? sharedWords : 0) };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.slug.localeCompare(b.item.slug))
    .slice(0, 5)
    .map(({ item }) => item);
}
