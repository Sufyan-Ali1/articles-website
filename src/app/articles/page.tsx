import { Suspense } from "react";
import { ArticleListing } from "@/components/articles/article-listing";
import { PageHeading, GridSkeleton } from "@/components/shared/states";
import { metadata } from "@/lib/seo/metadata";
import {
  filterUrl,
  parseFilters,
  type SearchParams,
} from "@/lib/utils/filters";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = parseFilters(await searchParams);
  const filtered = Boolean(
    filters.search ||
    filters.category ||
    filters.tag ||
    filters.article_type ||
    filters.sort !== "-published_at",
  );
  return metadata(
    "Explore all articles",
    "Fresh ideas and practical answers. Browse the latest articles from Ask & Explore.",
    filterUrl("/articles", filters),
    { noindex: filtered },
  );
}
export default function Articles({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="container listing-page">
      <PageHeading
        eyebrow="The reading room"
        title="Find your next perspective."
        description="Practical answers, useful context, and a few unexpected discoveries. Follow a subject, or find a new one."
      />
      <Suspense fallback={<GridSkeleton />}>
        <ArticleListing searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
