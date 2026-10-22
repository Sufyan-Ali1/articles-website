import { Suspense } from "react";
import { getClassification } from "@/lib/api/client";
import { orNotFound } from "@/lib/api/not-found";
import { ClassificationPage } from "@/components/categories/classification-page";
import { GridSkeleton } from "@/components/shared/states";
import { metadata } from "@/lib/seo/metadata";
import {
  parseFilters,
  filterUrl,
  type SearchParams,
} from "@/lib/utils/filters";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};
export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await orNotFound(getClassification("categories", slug));
  const filters = parseFilters(await searchParams);
  return metadata(
    category.name,
    category.description ||
      `Explore published articles about ${category.name} at Ask & Explore.`,
    filterUrl(`/category/${slug}`, filters),
    {
      noindex: Boolean(
        filters.search ||
        filters.article_type ||
        filters.category ||
        filters.tag ||
        filters.sort !== "-published_at",
      ),
    },
  );
}
export default function Category(props: Props) {
  return (
    <div className="container listing-page">
      <Suspense fallback={<GridSkeleton />}>
        <ClassificationPage {...props} kind="category" />
      </Suspense>
    </div>
  );
}
