import type { ArticleSummary } from "@/types/api";

export function isGuideType(type: { name: string; slug: string }) {
  return /review|guide|tutorial|how[\s-]?to|comparison/i.test(
    `${type.name} ${type.slug}`,
  );
}

export function selectHomeStories({
  latest,
  featured,
  guides,
  popular,
}: {
  latest: ArticleSummary[];
  featured: ArticleSummary[];
  guides: ArticleSummary[];
  popular: ArticleSummary[];
}) {
  const seen = new Set<string>();
  function take(items: ArticleSummary[], count: number) {
    const selected: ArticleSummary[] = [];
    const selectedSlugs = new Set<string>();
    for (const item of items) {
      if (seen.has(item.slug)) continue;
      seen.add(item.slug);
      selectedSlugs.add(item.slug);
      selected.push(item);
      if (selected.length === count) break;
    }
    // Prefer fresh choices, but keep small catalogs from losing entire sections.
    for (const item of items) {
      if (selected.length === count) break;
      if (selectedSlugs.has(item.slug)) continue;
      seen.add(item.slug);
      selectedSlugs.add(item.slug);
      selected.push(item);
    }
    return selected;
  }
  const hero = take(featured.length ? featured : latest, 1)[0];
  const featuredSlugs = new Set(featured.map((article) => article.slug));
  const latestStories = take(
    [
      ...latest.filter((article) => !featuredSlugs.has(article.slug)),
      ...latest,
    ],
    3,
  );
  const editorsAreFeatured = featured.length > 0;
  const editorPicks = take(editorsAreFeatured ? featured : latest, 3);
  const guideStories = take(guides, 3);
  const popularStories = take(
    popular.filter((article) => article.view_count > 0),
    3,
  );
  return {
    hero,
    latest: latestStories,
    editors: editorPicks,
    editorsAreFeatured,
    guides: guideStories,
    popular: popularStories,
  };
}
