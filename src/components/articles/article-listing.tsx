import Link from "next/link";
import { connection } from "next/server";
import { ArrowUpRight, LayoutGrid, List, X } from "lucide-react";
import {
  getArticles,
  getClassifications,
  searchArticles,
} from "@/lib/api/client";
import { ArticleCard } from "./article-card";
import { Pagination } from "./pagination";
import { Filters } from "@/components/search/filters";
import { EmptyState } from "@/components/shared/states";
import {
  parseFilters,
  filterUrl,
  type SearchParams,
} from "@/lib/utils/filters";
export async function ArticleListing({
  searchParams,
  path = "/articles",
  category,
  tag,
  searchPage = false,
}: {
  searchParams: Promise<SearchParams>;
  path?: string;
  category?: string;
  tag?: string;
  searchPage?: boolean;
}) {
  await connection();
  const params = await searchParams;
  const selectedView =
    params.view === "list" || params.view === "grid" ? params.view : undefined;
  const view = selectedView || (tag || searchPage ? "list" : "grid");
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
  const [categories, types] = await Promise.all([
    getClassifications("categories").catch(() => []),
    getClassifications("article-types").catch(() => []),
  ]);
  const result =
    !searchPage || filters.search
      ? await (filters.search ? searchArticles(filters) : getArticles(filters))
      : null;
  const active = [
    ...(filters.search
      ? [{ key: "search" as const, label: `“${filters.search}”` }]
      : []),
    ...(!category && filters.category
      ? [
          {
            key: "category" as const,
            label:
              categories.find((c) => c.slug === filters.category)?.name ||
              filters.category,
          },
        ]
      : []),
    ...(!tag && filters.tag
      ? [{ key: "tag" as const, label: filters.tag }]
      : []),
    ...(filters.article_type
      ? [
          {
            key: "article_type" as const,
            label:
              types.find((t) => t.slug === filters.article_type)?.name ||
              filters.article_type,
          },
        ]
      : []),
  ];
  const hasLead =
    category &&
    (filters.page || 1) === 1 &&
    !filters.search &&
    !filters.article_type &&
    !filters.tag &&
    filters.sort === "-published_at" &&
    !selectedView &&
    Boolean(result?.data.length);
  const lead = hasLead ? result!.data[0] : null;
  const stories = lead ? result!.data.slice(1) : result?.data || [];
  const representedCategories = tag
    ? [
        ...new Map(
          (result?.data || [])
            .flatMap((a) => a.categories.filter((c) => c.is_active))
            .map((c) => [c.id, c]),
        ).values(),
      ]
    : [];
  return (
    <>
      <Filters
        key={JSON.stringify(navigationFilters)}
        filters={navigationFilters}
        categories={categories}
        types={types}
        path={path}
        hideCategory={Boolean(category)}
        searchPage={searchPage}
        view={selectedView}
      />
      {active.length > 0 && (
        <nav className="active-filters" aria-label="Active filters">
          {active.map(({ key, label }) => (
            <Link
              key={key}
              href={filterUrl(
                path,
                { ...navigationFilters, [key]: undefined, page: 1 },
                1,
                selectedView,
              )}
              aria-label={`Remove filter ${label}`}
            >
              {label}
              <X size={13} />
            </Link>
          ))}
        </nav>
      )}
      {result ? (
        <>
          <div className="listing-toolbar">
            <div className="results-info">
              <span>
                {result.meta.total.toLocaleString()}{" "}
                {result.meta.total === 1 ? "article" : "articles"}
                {filters.search
                  ? ` matching “${filters.search}”`
                  : " to explore"}
              </span>
              {result.meta.total > 0 && (
                <span>
                  Page {result.meta.page} of {result.meta.pages}
                </span>
              )}
            </div>
            <nav className="view-switch" aria-label="Article layout">
              <Link
                href={filterUrl(path, navigationFilters, undefined, "grid")}
                aria-label="Grid view"
                aria-current={view === "grid" ? "true" : undefined}
              >
                <LayoutGrid size={17} />
              </Link>
              <Link
                href={filterUrl(path, navigationFilters, undefined, "list")}
                aria-label="List view"
                aria-current={view === "list" ? "true" : undefined}
              >
                <List size={19} />
              </Link>
            </nav>
          </div>
          {lead && (
            <div className="category-lead">
              <span className="eyebrow">Start with a fresh perspective</span>
              <ArticleCard article={lead} variant="lead" preload />
            </div>
          )}
          {stories.length > 0 ? (
            <div className={view === "list" ? "article-list" : "article-grid"}>
              {stories.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant={view === "list" ? "row" : "standard"}
                  query={filters.search}
                />
              ))}
            </div>
          ) : (
            !lead && (
              <EmptyState
                search
                title={
                  filters.search
                    ? "No stories match that question. Yet."
                    : "No articles on this page."
                }
                description={
                  filters.search
                    ? "Try a shorter phrase, remove a filter, or explore a related topic. Search matches words in article titles."
                    : "Try another filter, return to the first page, or explore the rest of the publication."
                }
              />
            )
          )}
          <Pagination
            meta={result.meta}
            filters={navigationFilters}
            path={path}
            view={selectedView}
          />
          {representedCategories.length > 0 && (
            <div className="collection-topics">
              <span className="eyebrow">Another way in</span>
              <h2>Follow the subject.</h2>
              <div className="category-children">
                {representedCategories.map((c) => (
                  <Link href={`/category/${c.slug}`} key={c.id}>
                    {c.name}
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="search-start">
          <span className="eyebrow">A few places to begin</span>
          <div className="search-start-topics">
            {categories
              .filter((c) => c.is_active && !c.parent_id)
              .slice(0, 6)
              .map((c) => (
                <Link
                  key={c.id}
                  href={filterUrl("/articles", { category: c.slug })}
                >
                  {c.name}
                  <ArrowUpRight size={19} />
                </Link>
              ))}
          </div>
          <EmptyState
            search
            title="Follow a question somewhere new."
            description="Try a subject, a product, or a phrase. We’ll search published article titles to find your next read."
          />
        </div>
      )}
    </>
  );
}
