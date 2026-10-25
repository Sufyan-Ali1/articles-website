import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText } from "lucide-react";
import type { CategoryResponse } from "@/types/api";
import type { CategoryPreview } from "./category-types";
import { CategoryImage } from "./category-image";
import { categoryPresentation } from "./category-presentation";
import styles from "./categories.module.css";

export type { CategoryPreview } from "./category-types";

export function CategoryCard({
  category,
  index,
  children: subcategories = [],
  preview,
  articleCount,
}: {
  category: CategoryResponse;
  index: number;
  children?: CategoryResponse[];
  preview?: CategoryPreview;
  articleCount?: number;
}) {
  const presentation = categoryPresentation(category);
  const Icon = presentation.icon;
  const href = `/category/${category.slug}`;
  return (
    <article className={styles.card} data-category-card={category.slug}>
      <Link
        href={href}
        tabIndex={-1}
        aria-label={`Explore ${category.name}`}
        className={styles.visual}
      >
        <CategoryImage
          category={category}
          preview={preview}
          preload={index === 0}
        />
      </Link>
      <span
        className={styles.icon}
        data-tone={presentation.tone}
        aria-hidden="true"
      >
        <Icon size={32} strokeWidth={1.8} />
      </span>
      <div className={styles.copy}>
        <h2>
          <Link href={href}>{category.name}</Link>
        </h2>
        <p className={styles.description}>
          {category.description || presentation.description}
        </p>
        {subcategories.length > 0 && (
          <nav
            className={styles.subcategories}
            aria-label={`${category.name} subcategories`}
          >
            {subcategories.map((child) => (
              <Link key={child.id} href={`/category/${child.slug}`}>
                {child.name}
                <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        )}
        <div className={styles.cardFooter}>
          <span className={styles.count}>
            <FileText size={18} strokeWidth={1.7} aria-hidden="true" />
            {articleCount === undefined
              ? "Articles & guides"
              : `${articleCount.toLocaleString("en")} ${articleCount === 1 ? "article" : "articles"}`}
          </span>
          <Link
            className={styles.exploreLink}
            href={href}
            aria-label={`Explore ${category.name} articles`}
          >
            Explore <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
