import { Suspense } from "react";
import { getClassification } from "@/lib/api/client";
import { orNotFound } from "@/lib/api/not-found";
import { CategoryArchive } from "@/components/categories/category-archive";
import { ArchiveSkeleton } from "@/components/articles/archive/archive-content";
import styles from "@/components/articles/archive/archive.module.css";
import { metadata } from "@/lib/seo/metadata";
import { classificationCopy } from "@/lib/content/site-copy";
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
  const filters = { ...parseFilters(await searchParams), category: undefined };
  const copy = classificationCopy(category, "category");
  return metadata(
    copy.title,
    copy.description,
    filterUrl(`/category/${slug}`, filters),
    {
      noindex: Boolean(
        filters.search ||
        filters.article_type ||
        filters.tag ||
        filters.sort !== "-published_at",
      ),
    },
  );
}
export default function Category(props: Props) {
  return (
    <div className={styles.page} data-category-page>
      <Suspense
        fallback={
          <div className={`${styles.shell} ${styles.content}`}>
            <ArchiveSkeleton showCategories={false} />
          </div>
        }
      >
        <CategoryArchive {...props} />
      </Suspense>
    </div>
  );
}
