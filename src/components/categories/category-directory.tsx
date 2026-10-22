"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import type { CategoryResponse } from "@/types/api";
import { CategoryCard, type CategoryPreview } from "./category-card";
export function CategoryDirectory({
  categories,
  previews,
}: {
  categories: CategoryResponse[];
  previews: Record<string, CategoryPreview>;
}) {
  const [query, setQuery] = useState("");
  const ids = new Set(categories.map((c) => c.id));
  const roots = categories.filter((c) => !c.parent_id || !ids.has(c.parent_id));
  const match = (c: CategoryResponse) =>
    `${c.name} ${c.description || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  const visible = query.trim() ? categories.filter(match) : roots;
  return (
    <>
      <div className="directory-toolbar">
        <label className="directory-search">
          <Search size={18} />
          <span className="sr-only">Find a topic</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find your kind of curious…"
          />
        </label>
        <span role="status">
          {visible.length} {visible.length === 1 ? "topic" : "topics"} to
          explore
        </span>
      </div>
      <div className="categories-grid">
        {visible.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={categories.indexOf(category)}
            preview={previews[category.id]}
          >
            {categories.filter((child) => child.parent_id === category.id)}
          </CategoryCard>
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty-state">
          <h2>No topic matches that phrase.</h2>
          <p>Try a broader subject or clear your search.</p>
          <button
            className="button button-outline"
            onClick={() => setQuery("")}
          >
            Show every topic
          </button>
        </div>
      )}
    </>
  );
}
