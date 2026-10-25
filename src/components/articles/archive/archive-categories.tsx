import Link from "next/link";
import { ChevronDown, LayoutDashboard, ListFilter } from "lucide-react";
import { getArticles } from "@/lib/api/client";
import type { ArticleFilters, CategoryResponse } from "@/types/api";
import { filterUrl } from "@/lib/utils/filters";
import {
  categoryPresentation,
  compareCategories,
} from "@/components/categories/category-presentation";
import styles from "./archive.module.css";

type Props = {
  categories: CategoryResponse[];
  filters: ArticleFilters;
  view?: "grid" | "list";
  counts?: Record<string, number>;
  total?: number;
};

function categoryRows(categories: CategoryResponse[]) {
  const active = categories.filter((category) => category.is_active);
  const ids = new Set(active.map((category) => category.id));
  const visited = new Set<string>();
  const rows: { category: CategoryResponse; depth: number }[] = [];
  const visit = (category: CategoryResponse, depth: number) => {
    if (visited.has(category.id)) return;
    visited.add(category.id);
    rows.push({ category, depth });
    active
      .filter((child) => child.parent_id === category.id)
      .sort(compareCategories)
      .forEach((child) => visit(child, depth + 1));
  };
  active
    .filter((category) => !category.parent_id || !ids.has(category.parent_id))
    .sort(compareCategories)
    .forEach((category) => visit(category, 0));
  active.forEach((category) => visit(category, 0));
  return rows;
}

function CategoryLinks({
  categories,
  filters,
  view,
  counts = {},
  total,
}: Props) {
  return (
    <nav
      className={styles.categoryLinks}
      aria-label="Filter articles by category"
    >
      <Link
        href={filterUrl(
          "/articles",
          { ...filters, category: undefined },
          1,
          view,
        )}
        aria-current={!filters.category ? "page" : undefined}
        prefetch={false}
      >
        <LayoutDashboard size={17} strokeWidth={1.7} aria-hidden="true" />
        <span className={styles.categoryName}>All Articles</span>
        {total !== undefined && (
          <span className={styles.categoryCount}>
            {total.toLocaleString("en")}
          </span>
        )}
      </Link>
      {categoryRows(categories).map(({ category, depth }) => {
        const Icon = categoryPresentation(category).icon;
        return (
          <Link
            key={category.id}
            href={filterUrl(
              "/articles",
              { ...filters, category: category.slug },
              1,
              view,
            )}
            aria-current={
              filters.category === category.slug ? "page" : undefined
            }
            prefetch={false}
            style={{ paddingLeft: 14 + Math.min(depth, 3) * 12 }}
          >
            <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
            <span className={styles.categoryName}>{category.name}</span>
            {counts[category.id] !== undefined && (
              <span className={styles.categoryCount}>
                {counts[category.id].toLocaleString("en")}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function ArchiveCategories(props: Props) {
  return (
    <div className={styles.sidebarColumn}>
      <aside
        className={styles.sidebar}
        aria-label="Article categories"
        data-archive-sidebar
      >
        <h2>Categories</h2>
        <CategoryLinks {...props} />
      </aside>
      <details className={styles.mobileCategories}>
        <summary>
          <ListFilter size={17} aria-hidden="true" /> Categories{" "}
          <ChevronDown size={17} aria-hidden="true" />
        </summary>
        <CategoryLinks {...props} />
      </details>
    </div>
  );
}

export async function CountedArchiveCategories(props: Props) {
  const targets = props.categories
    .filter((category) => category.is_active)
    .slice(0, 24);
  const [all, ...results] = await Promise.allSettled([
    getArticles({ page_size: 1 }),
    ...targets.map((category) =>
      getArticles({ category: category.slug, page_size: 1 }),
    ),
  ]);
  const counts: Record<string, number> = {};
  results.forEach((result, index) => {
    if (result.status === "fulfilled")
      counts[targets[index].id] = result.value.meta.total;
  });
  return (
    <ArchiveCategories
      {...props}
      counts={counts}
      total={all.status === "fulfilled" ? all.value.meta.total : undefined}
    />
  );
}
