"use client";

import Link from "next/link";
import { useContext } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import type { ArticleFilters, ClassificationResponse } from "@/types/api";
import { filterUrl, sorts } from "@/lib/utils/filters";
import { ArchiveFloatingContext } from "./archive-browser";
import styles from "./archive.module.css";

export function ArchiveFilters({
  filters,
  types,
  view,
  path = "/articles",
  showLayout = false,
}: {
  filters: ArticleFilters;
  types: ClassificationResponse[];
  view?: "grid" | "list";
  path?: string;
  showLayout?: boolean;
}) {
  const floating = useContext(ArchiveFloatingContext);
  const useTypeDropdown = showLayout && floating;
  const changed = Boolean(
    filters.search ||
    filters.category ||
    filters.tag ||
    filters.article_type ||
    filters.sort !== "-published_at",
  );
  return (
    <form
      action={path}
      role="search"
      aria-label="Filter published articles"
      className={styles.filters}
    >
      {filters.category && (
        <input type="hidden" name="category" value={filters.category} />
      )}
      {filters.article_type && !useTypeDropdown && (
        <input type="hidden" name="article_type" value={filters.article_type} />
      )}
      {filters.tag && <input type="hidden" name="tag" value={filters.tag} />}
      {view && <input type="hidden" name="view" value={view} />}
      <div className={styles.search}>
        <button type="submit" aria-label="Search articles">
          <Search size={19} aria-hidden="true" />
        </button>
        <label htmlFor="archive-search" className="sr-only">
          Search article titles
        </label>
        <input
          id="archive-search"
          type="search"
          name="search"
          placeholder="Search articles or keywords..."
          defaultValue={filters.search}
          maxLength={200}
        />
      </div>
      <div
        className={styles.filterActions}
        data-archive-actions={showLayout || undefined}
      >
        {useTypeDropdown ? (
          <label className={styles.typeSelect}>
            <span className={styles.filterLabel}>Article Type</span>
            <select
              name="article_type"
              aria-label="Article type"
              defaultValue={filters.article_type || ""}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              <option value="">All article types</option>
              {types
                .filter((type) => type.is_active)
                .map((type) => (
                  <option key={type.id} value={type.slug}>
                    {type.name}
                  </option>
                ))}
            </select>
          </label>
        ) : (
          <div className={styles.typeGroup}>
            <span className={styles.filterLabel}>Article Type</span>
            <nav aria-label="Article types" className={styles.typeLinks}>
              <Link
                href={filterUrl(
                  path,
                  { ...filters, article_type: undefined },
                  1,
                  view,
                )}
                aria-current={!filters.article_type ? "true" : undefined}
                prefetch={false}
              >
                All
              </Link>
              {types
                .filter((type) => type.is_active)
                .map((type) => (
                  <Link
                    key={type.id}
                    href={filterUrl(
                      path,
                      { ...filters, article_type: type.slug },
                      1,
                      view,
                    )}
                    aria-current={
                      filters.article_type === type.slug ? "true" : undefined
                    }
                    prefetch={false}
                  >
                    {type.name}
                  </Link>
                ))}
            </nav>
          </div>
        )}
        <label className={styles.sort}>
          <span className={styles.filterLabel}>Sort by</span>
          <select
            name="sort"
            aria-label="Sort articles"
            defaultValue={filters.sort || "-published_at"}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
          >
            {sorts.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.value === "-published_at" ? "Latest First" : sort.label}
              </option>
            ))}
          </select>
        </label>
        {showLayout && (
          <nav className={styles.viewSwitch} aria-label="Article layout">
            <Link
              href={filterUrl(path, filters, undefined, "grid")}
              aria-label="Grid view"
              aria-current={!view || view === "grid" ? "true" : undefined}
              prefetch={false}
            >
              <LayoutGrid size={16} />
            </Link>
            <Link
              href={filterUrl(path, filters, undefined, "list")}
              aria-label="List view"
              aria-current={view === "list" ? "true" : undefined}
              prefetch={false}
            >
              <List size={18} />
            </Link>
          </nav>
        )}
        <noscript>
          <button type="submit">Apply filters</button>
        </noscript>
        {changed && (
          <Link
            className={styles.reset}
            href={filterUrl(path, {}, 1, view)}
            prefetch={false}
          >
            Reset filters
          </Link>
        )}
      </div>
    </form>
  );
}
