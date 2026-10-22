import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CategoryResponse } from "@/types/api";
import { ArticleImage } from "@/components/articles/article-image";
export type CategoryPreview = { src: string; alt: string; optimized: boolean };
export function CategoryCard({
  category,
  index,
  children: subcategories = [],
  preview,
}: {
  category: CategoryResponse;
  index: number;
  children?: CategoryResponse[];
  preview?: CategoryPreview;
}) {
  return (
    <article
      className={`category-card ${index < 2 ? "category-featured" : ""}`}
    >
      <div className="category-card-copy">
        <div className="category-card-top">
          <span>EXPLORE / {String(index + 1).padStart(2, "0")}</span>
          <ArrowUpRight size={22} />
        </div>
        <h2>
          <Link href={`/category/${category.slug}`}>{category.name}</Link>
        </h2>
        {category.description && <p>{category.description}</p>}
        {subcategories.length > 0 && (
          <div className="subcategory-links">
            {subcategories.map((child) => (
              <Link key={child.id} href={`/category/${child.slug}`}>
                {child.name}
                <ArrowUpRight size={13} />
              </Link>
            ))}
          </div>
        )}
        <Link className="text-link" href={`/category/${category.slug}`}>
          Explore topic
          <ArrowUpRight size={16} />
        </Link>
      </div>
      {preview && (
        <Link
          href={`/category/${category.slug}`}
          tabIndex={-1}
          aria-label={`Explore ${category.name}`}
          className="category-preview"
        >
          <ArticleImage
            src={preview.src}
            alt={preview.alt}
            optimized={preview.optimized}
            sizes="(max-width: 640px) 100vw, 35vw"
          />
        </Link>
      )}
    </article>
  );
}
