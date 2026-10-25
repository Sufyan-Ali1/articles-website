import { Suspense } from "react";
import { getClassification } from "@/lib/api/client";
import { orNotFound } from "@/lib/api/not-found";
import { ClassificationArchive } from "@/components/articles/archive/classification-archive";
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
  const tag = await orNotFound(getClassification("tags", slug));
  const filters = { ...parseFilters(await searchParams), tag: undefined };
  const copy = classificationCopy(tag, "tag");
  return metadata(
    copy.title,
    copy.description,
    filterUrl(`/tag/${slug}`, filters),
    {
      noindex: Boolean(
        filters.search ||
        filters.article_type ||
        filters.category ||
        filters.sort !== "-published_at",
      ),
    },
  );
}
export default function Tag(props: Props) {
  return (
    <div className={styles.page} data-tag-page>
      <Suspense
        fallback={
          <div className={`${styles.shell} ${styles.content}`}>
            <ArchiveSkeleton showCategories={false} />
          </div>
        }
      >
        <ClassificationArchive {...props} kind="tag" />
      </Suspense>
    </div>
  );
}
