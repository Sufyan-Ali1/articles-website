"use client";

import { useEffect, useRef, useState } from "react";
import { SearchX } from "lucide-react";
import type { CategoryResponse } from "@/types/api";
import { CategoryCard } from "./category-card";
import { CategoryToolbar } from "./category-toolbar";
import { compareCategories } from "./category-presentation";
import type { CategoryPreview } from "./category-types";
import styles from "./categories.module.css";

export function CategoryDirectory({
  categories,
  previews,
  counts = {},
}: {
  categories: CategoryResponse[];
  previews: Record<string, CategoryPreview>;
  counts?: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [floatingSearch, setFloatingSearch] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const results = resultsRef.current;
    const footer = document.querySelector<HTMLElement>(".site-footer");
    if (!results || !footer) return;
    const measureFooter = () => {
      results.style.setProperty(
        "--category-footer-height",
        `${footer.getBoundingClientRect().height}px`,
      );
    };
    measureFooter();
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measureFooter)
        : null;
    observer?.observe(footer);
    window.addEventListener("resize", measureFooter);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measureFooter);
    };
  }, []);
  const active = categories.filter((category) => category.is_active);
  const byId = new Map(active.map((category) => [category.id, category]));
  const roots = active
    .filter((category) => !category.parent_id || !byId.has(category.parent_id))
    .sort(compareCategories);
  const needle = query.trim().toLocaleLowerCase();
  const candidates = needle ? active : roots;
  const visible = candidates
    .filter((category) =>
      `${category.name} ${category.description || ""}`
        .toLocaleLowerCase()
        .includes(needle),
    )
    .sort(compareCategories);
  const reset = () => {
    setQuery("");
  };

  return (
    <>
      <CategoryToolbar
        query={query}
        onQueryChange={setQuery}
        onFloatingChange={setFloatingSearch}
      />
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {visible.length} {visible.length === 1 ? "category" : "categories"} to
        explore{needle ? ` matching “${query.trim()}”` : ""}.
      </p>
      <div
        ref={resultsRef}
        className={styles.resultsArea}
        id="category-results"
        data-browsing={floatingSearch}
        data-empty={visible.length === 0}
      >
        <div className={styles.grid} aria-label="Categories">
          {visible.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              preview={previews[category.id]}
              articleCount={counts[category.id]}
            >
              {active.filter((child) => child.parent_id === category.id)}
            </CategoryCard>
          ))}
        </div>
        {visible.length === 0 && (
          <div className={styles.state}>
            <span className={styles.stateIcon}>
              <SearchX size={30} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <h2>No categories match your search.</h2>
            <p>
              Try a different phrase or clear your search to explore every
              topic.
            </p>
            <button type="button" onClick={reset}>
              Show all categories
            </button>
          </div>
        )}
      </div>
    </>
  );
}
