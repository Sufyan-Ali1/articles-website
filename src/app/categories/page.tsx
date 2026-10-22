import { Suspense } from "react";
import { connection } from "next/server";
import { getClassifications, getArticles } from "@/lib/api/client";
import type { CategoryPreview } from "@/components/categories/category-card";
import { CategoryDirectory } from "@/components/categories/category-directory";
import { optimizedImage } from "@/components/articles/article-card";
import {
  PageHeading,
  GridSkeleton,
  EmptyState,
} from "@/components/shared/states";
import { metadata } from "@/lib/seo/metadata";
export const generateMetadata = () =>
  metadata(
    "Explore categories",
    "Follow your curiosity through the topics and categories at Ask & Explore.",
    "/categories",
  );
async function CategoriesDirectory() {
  await connection();
  const categories = (await getClassifications("categories")).filter(
    (c) => c.is_active,
  );
  if (!categories.length)
    return (
      <EmptyState
        title="New paths are taking shape."
        description="Our topic directory will grow as the publication does. In the meantime, suggest a topic you’d like us to explore."
      />
    );
  const ids = new Set(categories.map((c) => c.id));
  const roots = categories.filter((c) => !c.parent_id || !ids.has(c.parent_id));
  const previews: Record<string, CategoryPreview> = {};
  const results = await Promise.allSettled(
    roots
      .slice(0, 2)
      .map((category) =>
        getArticles({ category: category.slug, page_size: 1 }),
      ),
  );
  results.forEach((result, i) => {
    const article =
      result.status === "fulfilled" ? result.value.data[0] : undefined;
    if (article?.featured_image)
      previews[roots[i].id] = {
        src: article.featured_image,
        alt: article.featured_image_alt || "",
        optimized: optimizedImage(article.featured_image),
      };
  });
  return <CategoryDirectory categories={categories} previews={previews} />;
}
export default function Categories() {
  return (
    <div className="container">
      <PageHeading
        eyebrow="Follow your curiosity"
        title="A world beyond your usual."
        description="Find your way into a subject you love, or step outside the familiar. There’s always something new to explore."
      />
      <Suspense fallback={<GridSkeleton variant="directory" />}>
        <CategoriesDirectory />
      </Suspense>
    </div>
  );
}
