import { Suspense } from "react";
import { ArticleListing } from "@/components/articles/article-listing";
import { PageHeading, GridSkeleton } from "@/components/shared/states";
import { metadata } from "@/lib/seo/metadata";
import {
  parseFilters,
  filterUrl,
  type SearchParams,
} from "@/lib/utils/filters";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = parseFilters(await searchParams);
  return metadata(
    filters.search ? `Search: ${filters.search}` : "Search the publication",
    "Find published articles about the things you’re curious about.",
    filterUrl("/search", filters),
    { noindex: true },
  );
}
export default function Search({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="container listing-page">
      <PageHeading
        eyebrow="Seek something new"
        title="What are you curious about?"
        description="What would you like to understand? Search our published stories by title."
      />
      <Suspense fallback={<GridSkeleton />}>
        <ArticleListing searchParams={searchParams} path="/search" searchPage />
      </Suspense>
    </div>
  );
}
