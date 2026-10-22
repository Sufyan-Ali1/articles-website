import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { sorts, filterUrl } from "@/lib/utils/filters";
import type { ArticleFilters, ClassificationResponse } from "@/types/api";
export function Filters({
  filters,
  categories,
  types,
  path = "/articles",
  hideCategory = false,
  searchPage = false,
  view,
}: {
  filters: ArticleFilters;
  categories: ClassificationResponse[];
  types: ClassificationResponse[];
  path?: string;
  hideCategory?: boolean;
  searchPage?: boolean;
  view?: "grid" | "list";
}) {
  return (
    <form
      action={path}
      className={`filters ${searchPage ? "search-page-form" : ""}`}
      role="search"
    >
      {view && <input type="hidden" name="view" value={view} />}
      <div className="search-input-wrap">
        <Search size={19} aria-hidden="true" />
        <label htmlFor="article-search" className="sr-only">
          Search article titles
        </label>
        <input
          id="article-search"
          name="search"
          type="search"
          placeholder="What are you curious about?"
          defaultValue={filters.search}
          maxLength={200}
        />
        <button
          type="submit"
          className="search-submit"
          aria-label="Search articles"
        >
          <span>Search</span>
          <Search size={17} />
        </button>
      </div>
      <div className="filter-row">
        <span className="filter-caption">
          <SlidersHorizontal size={15} />
          Refine your reading
        </span>
        {!hideCategory && (
          <>
            <label htmlFor="category-filter" className="sr-only">
              Category
            </label>
            <select
              id="category-filter"
              name="category"
              defaultValue={filters.category || ""}
            >
              <option value="">All categories</option>
              {categories
                .filter((c) => c.is_active)
                .map((c) => (
                  <option value={c.slug} key={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </>
        )}
        {filters.tag && <input type="hidden" name="tag" value={filters.tag} />}
        <label htmlFor="type-filter" className="sr-only">
          Article type
        </label>
        <select
          id="type-filter"
          name="article_type"
          defaultValue={filters.article_type || ""}
        >
          <option value="">All formats</option>
          {types
            .filter((t) => t.is_active)
            .map((t) => (
              <option value={t.slug} key={t.id}>
                {t.name}
              </option>
            ))}
        </select>
        <label htmlFor="sort-filter" className="sr-only">
          Sort articles
        </label>
        <select
          id="sort-filter"
          name="sort"
          defaultValue={filters.sort || "-published_at"}
        >
          {sorts.map((s) => (
            <option value={s.value} key={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="submit" className="filter-apply">
          Apply
        </button>
        {(filters.search ||
          filters.category ||
          filters.article_type ||
          filters.sort !== "-published_at") && (
          <Link href={filterUrl(path, {}, 1, view)} className="clear-filters">
            Reset
          </Link>
        )}
      </div>
    </form>
  );
}
