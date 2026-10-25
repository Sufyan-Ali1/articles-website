import { Suspense } from "react";
import { SearchHero } from "@/components/search/search-hero";
import {
  ArchiveContent,
  ArchiveSkeleton,
} from "@/components/articles/archive/archive-content";
import archiveStyles from "@/components/articles/archive/archive.module.css";
import styles from "@/components/search/search.module.css";
import { metadata } from "@/lib/seo/metadata";
import { pageSeo } from "@/lib/content/site-copy";
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
    filters.search ? `Search: ${filters.search}` : pageSeo.search.title,
    pageSeo.search.description,
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
    <div className={`${archiveStyles.page} ${styles.page}`} data-search-page>
      <Suspense
        fallback={
          <div className={styles.heroLoading} aria-label="Loading search" />
        }
      >
        <SearchHero searchParams={searchParams} />
      </Suspense>
      <div className={`${archiveStyles.shell} ${styles.content}`}>
        <Suspense fallback={<ArchiveSkeleton showCategories={false} />}>
          <ArchiveContent
            searchParams={searchParams}
            path="/search"
            showCategories={false}
            searchPage
          />
        </Suspense>
      </div>
    </div>
  );
}
