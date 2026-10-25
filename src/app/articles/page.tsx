import { Suspense } from "react";
import { ArchiveHero } from "@/components/articles/archive/archive-hero";
import {
  ArchiveContent,
  ArchiveSkeleton,
} from "@/components/articles/archive/archive-content";
import { ArchiveNewsletter } from "@/components/articles/archive/archive-newsletter";
import styles from "@/components/articles/archive/archive.module.css";
import { metadata } from "@/lib/seo/metadata";
import { pageSeo } from "@/lib/content/site-copy";
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
    pageSeo.articles.title,
    pageSeo.articles.description,
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
    <div className={styles.page} data-articles-page>
      <ArchiveHero />
      <div className={`${styles.shell} ${styles.content}`}>
        <Suspense fallback={<ArchiveSkeleton />}>
          <ArchiveContent searchParams={searchParams} />
        </Suspense>
        <ArchiveNewsletter />
      </div>
    </div>
  );
}
