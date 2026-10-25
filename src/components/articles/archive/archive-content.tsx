import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  BookOpen,
  LayoutGrid,
  List,
  WifiOff,
  X,
} from "lucide-react";
import { SearchSort } from "@/components/search/search-sort";
import {
  getArticles,
  getClassifications,
  searchArticles,
} from "@/lib/api/client";
import {
  parseFilters,
  filterUrl,
  type SearchParams,
} from "@/lib/utils/filters";
import { ArchiveFilters } from "./archive-filters";
import { ArchiveBrowser } from "./archive-browser";
import {
  ArchiveCategories,
  CountedArchiveCategories,
} from "./archive-categories";
import { ArchiveCard } from "./archive-card";
import { Pagination } from "../pagination";
import styles from "./archive.module.css";

function ArchiveState({
  unavailable = false,
  path = "/articles",
  searchPage = false,
  initial = false,
  retryHref,
}: {
  unavailable?: boolean;
  path?: string;
  searchPage?: boolean;
  initial?: boolean;
  retryHref?: string;
}) {
  const Icon = unavailable ? WifiOff : BookOpen;
  return (
    <div className={styles.state} role="status">
      <Icon size={32} strokeWidth={1.5} aria-hidden="true" />
      <h2>
        {initial
          ? "What would you like to discover?"
          : unavailable
            ? "Our articles are taking a moment to load."
            : searchPage
              ? "No stories match that question. Yet."
              : "No articles match these filters."}
      </h2>
      <p>
        {initial
          ? "Enter a word or phrase above, or choose a topic to explore. Search matches published article titles."
          : unavailable
            ? "Please try again shortly. Your next read will be here when the publication reconnects."
            : "Try a different phrase or clear your filters to find your next read."}
      </p>
      {!initial && (
        <Link href={unavailable ? retryHref || path : path} prefetch={false}>
          {unavailable
            ? "Try again"
            : path === "/articles"
              ? "Explore all articles"
              : searchPage
                ? "Start a new search"
                : path.startsWith("/tag/")
                  ? "Explore tag articles"
                  : "Explore category articles"}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export async function ArchiveContent({
  searchParams,
  path = "/articles",
  category,
  tag,
  showCategories = true,
  searchPage = false,
}: {
  searchParams: Promise<SearchParams>;
  path?: string;
  category?: string;
  tag?: string;
  showCategories?: boolean;
  searchPage?: boolean;
}) {
  await connection();
  const params = await searchParams;
  const filters = {
    ...parseFilters(params),
    ...(category ? { category } : {}),
    ...(tag ? { tag } : {}),
  };
  const navigationFilters = {
    ...filters,
    ...(category ? { category: undefined } : {}),
    ...(tag ? { tag: undefined } : {}),
  };
  const selectedView =
    params.view === "grid" || params.view === "list" ? params.view : undefined;
  const view = selectedView || "grid";
  const shouldFetch =
    !searchPage ||
    Boolean(
      filters.search || filters.category || filters.tag || filters.article_type,
    );
  const [categories, types, result] = await Promise.all([
    showCategories || searchPage
      ? getClassifications("categories")
          .then((items) => items.filter((category) => category.is_active))
          .catch(() => [])
      : Promise.resolve([]),
    getClassifications("article-types")
      .then((items) => items.filter((type) => type.is_active))
      .catch(() => []),
    (shouldFetch
      ? filters.search
        ? searchArticles(filters)
        : getArticles(filters)
      : Promise.resolve(null)
    ).catch(() => null),
  ]);
  const start = result?.data.length
    ? (result.meta.page - 1) * result.meta.page_size + 1
    : 0;
  const end = result
    ? Math.min(start + result.data.length - 1, result.meta.total)
    : 0;
  const noun = result?.meta.total === 1 ? "article" : "articles";
  const categoryProps = { categories, filters, view: selectedView } as const;
  const floatingControls =
    searchPage || showCategories || Boolean(category) || Boolean(tag);
  const archiveFilters = (
    <ArchiveFilters
      key={JSON.stringify([path, navigationFilters, selectedView])}
      filters={navigationFilters}
      types={types}
      view={selectedView}
      path={path}
      showLayout={floatingControls}
    />
  );
  return (
    <ArchiveBrowser
      enabled={floatingControls}
      path={path}
      triggerSelector={searchPage ? "[data-search-hero-form]" : undefined}
      controls={archiveFilters}
    >
      {searchPage &&
        Boolean(
          filters.search ||
          filters.category ||
          filters.tag ||
          filters.article_type,
        ) && (
          <nav className="active-filters" aria-label="Active filters">
            {(["search", "category", "tag", "article_type"] as const)
              .filter((key) => filters[key])
              .map((key) => (
                <Link
                  key={key}
                  href={filterUrl(
                    path,
                    { ...navigationFilters, [key]: undefined },
                    1,
                    selectedView,
                  )}
                  aria-label={`Remove filter ${filters[key]}`}
                  prefetch={false}
                >
                  {key === "search"
                    ? `“${filters[key]}”`
                    : categories.find((item) => item.slug === filters[key])
                        ?.name ||
                      types.find((item) => item.slug === filters[key])?.name ||
                      filters[key]}
                  <X size={13} aria-hidden="true" />
                </Link>
              ))}
          </nav>
        )}
      <div
        className={styles.layout}
        data-sidebar={showCategories}
        data-empty={!result?.data.length}
      >
        {showCategories && (
          <Suspense fallback={<ArchiveCategories {...categoryProps} />}>
            <CountedArchiveCategories {...categoryProps} />
          </Suspense>
        )}
        <section
          className={styles.results}
          aria-label="Published articles"
          data-search-results={searchPage || undefined}
        >
          <div className={styles.resultsToolbar}>
            <div>
              {searchPage && (
                <h2 className={styles.searchHeading}>
                  {filters.search ? (
                    <>
                      Showing results for <span>“{filters.search}”</span>
                    </>
                  ) : shouldFetch ? (
                    "Explore articles"
                  ) : (
                    "Start with a question"
                  )}
                </h2>
              )}
              <p className={`results-info ${styles.resultsInfo}`} role="status">
                {result
                  ? result.meta.total > 0
                    ? searchPage
                      ? `${result.meta.total.toLocaleString("en")} ${noun} found`
                      : start
                        ? `Showing ${start}–${end} of ${result.meta.total.toLocaleString("en")} ${noun}`
                        : `0 articles on this page · ${result.meta.total.toLocaleString("en")} ${noun} available`
                    : "0 articles found"
                  : shouldFetch
                    ? "Articles are temporarily unavailable"
                    : "Find something worth exploring"}
                {!searchPage && filters.search && (
                  <span> matching “{filters.search}”</span>
                )}
              </p>
            </div>
            {(!floatingControls || searchPage) && (
              <div className={styles.resultControls}>
                {searchPage && (
                  <SearchSort
                    key={JSON.stringify([navigationFilters, selectedView])}
                    filters={navigationFilters}
                    view={selectedView}
                  />
                )}
                <nav className={styles.viewSwitch} aria-label="Article layout">
                  <Link
                    href={filterUrl(path, navigationFilters, undefined, "grid")}
                    aria-label="Grid view"
                    aria-current={view === "grid" ? "true" : undefined}
                    prefetch={false}
                  >
                    <LayoutGrid size={16} />
                  </Link>
                  <Link
                    href={filterUrl(path, navigationFilters, undefined, "list")}
                    aria-label="List view"
                    aria-current={view === "list" ? "true" : undefined}
                    prefetch={false}
                  >
                    <List size={18} />
                  </Link>
                </nav>
              </div>
            )}
          </div>
          {result?.data.length ? (
            <div
              className={`${styles.cards} ${view === "list" ? "article-list" : ""}`}
              data-view={view}
            >
              {result.data.map((article) => (
                <ArchiveCard
                  key={article.id}
                  article={article}
                  query={filters.search}
                  variant={searchPage ? "search" : "archive"}
                />
              ))}
            </div>
          ) : (
            <ArchiveState
              unavailable={shouldFetch && !result}
              path={path}
              searchPage={searchPage}
              initial={!shouldFetch}
              retryHref={filterUrl(
                path,
                navigationFilters,
                undefined,
                selectedView,
              )}
            />
          )}
          {result && (
            <Pagination
              meta={result.meta}
              filters={navigationFilters}
              path={path}
              view={selectedView}
            />
          )}
        </section>
      </div>
    </ArchiveBrowser>
  );
}

export function ArchiveSkeleton({
  showCategories = true,
}: {
  showCategories?: boolean;
}) {
  return (
    <div className={styles.loading} role="status" aria-label="Loading articles">
      <div className={styles.loadingFilters} aria-hidden="true" />
      <div
        className={styles.layout}
        data-sidebar={showCategories}
        aria-hidden="true"
      >
        {showCategories && <div className={styles.loadingSidebar} />}
        <div className={styles.cards}>
          {Array.from({ length: 6 }, (_, index) => (
            <div className={styles.loadingCard} key={index}>
              <div />
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading published articles…</span>
    </div>
  );
}
