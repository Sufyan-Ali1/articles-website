"use client";
import type { ArticleFilters } from "@/types/api";
import { sorts } from "@/lib/utils/filters";
import styles from "./search.module.css";

export function SearchSort({
  filters,
  view,
}: {
  filters: ArticleFilters;
  view?: "grid" | "list";
}) {
  return (
    <form
      action="/search"
      method="get"
      className={styles.sortForm}
      aria-label="Search result order"
    >
      {(["search", "category", "tag", "article_type"] as const).map(
        (key) =>
          filters[key] && (
            <input key={key} type="hidden" name={key} value={filters[key]} />
          ),
      )}
      {view && <input type="hidden" name="view" value={view} />}
      <label className="sr-only" htmlFor="search-result-sort">
        Sort articles
      </label>
      <select
        id="search-result-sort"
        name="sort"
        defaultValue={filters.sort}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {sorts.map((sort) => (
          <option key={sort.value} value={sort.value}>
            {sort.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit">Apply sort</button>
      </noscript>
    </form>
  );
}
