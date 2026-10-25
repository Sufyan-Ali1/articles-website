import { connection } from "next/server";
import Link from "next/link";
import { ArrowRight, BookOpen, WifiOff } from "lucide-react";
import { getArticles, getClassifications } from "@/lib/api/client";
import { optimizedImage } from "@/components/articles/article-card";
import { CategoryDirectory } from "./category-directory";
import { compareCategories } from "./category-presentation";
import type { CategoryPreview } from "./category-types";
import styles from "./categories.module.css";

export function CategoriesState({
  unavailable = false,
}: {
  unavailable?: boolean;
}) {
  const Icon = unavailable ? WifiOff : BookOpen;
  return (
    <div className={styles.state} role="status">
      <span className={styles.stateIcon}>
        <Icon size={30} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h2>
        {unavailable
          ? "Our topics are taking a moment to load."
          : "New topics are on their way."}
      </h2>
      <p>
        {unavailable
          ? "Please try again shortly, or explore the articles already published."
          : "Our category directory will grow with the publication. Tell us what you’d like to explore next."}
      </p>
      <Link href={unavailable ? "/articles" : "/request-article"}>
        {unavailable ? "Explore articles" : "Suggest a topic"}{" "}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

export async function CategoriesContent() {
  await connection();
  const categories = await getClassifications("categories")
    .then((items) => items.filter((category) => category.is_active))
    .catch(() => null);
  if (!categories) return <CategoriesState unavailable />;
  if (!categories.length) return <CategoriesState />;
  const ids = new Set(categories.map((category) => category.id));
  const roots = categories
    .filter((category) => !category.parent_id || !ids.has(category.parent_id))
    .sort(compareCategories);
  const children = categories.filter(
    (category) => category.parent_id && ids.has(category.parent_id),
  );
  // Bound preview requests as the catalog grows. Missing totals remain unknown rather than becoming zero.
  const previewCategories = [...roots, ...children].slice(0, 24);
  const results = await Promise.allSettled(
    previewCategories.map((category) =>
      getArticles({ category: category.slug, page_size: 1 }),
    ),
  );
  const previews: Record<string, CategoryPreview> = {};
  const counts: Record<string, number> = {};
  results.forEach((result, index) => {
    if (result.status !== "fulfilled") return;
    const category = previewCategories[index];
    counts[category.id] = result.value.meta.total;
    const article = result.value.data[0];
    if (article?.featured_image)
      previews[category.id] = {
        src: article.featured_image,
        alt: article.featured_image_alt || "",
        optimized: optimizedImage(article.featured_image),
      };
  });
  return (
    <CategoryDirectory
      categories={categories}
      previews={previews}
      counts={counts}
    />
  );
}

export function CategoriesSkeleton() {
  return (
    <div
      className={styles.loading}
      role="status"
      aria-label="Loading categories"
    >
      <div className={styles.loadingToolbar} aria-hidden="true">
        <span />
      </div>
      <div className={styles.grid} aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className={styles.loadingCard} key={index}>
            <div />
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading categories…</span>
    </div>
  );
}
