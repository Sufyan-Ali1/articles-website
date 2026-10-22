import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ArticleSummary } from "@/types/api";
import { formatDate } from "@/lib/utils";
import { imageHosts } from "@/lib/config";
import { ArticleImage } from "./article-image";
export type CardVariant = "lead" | "standard" | "compact" | "row";
export function optimizedImage(src: string | null) {
  try {
    return Boolean(src && imageHosts.includes(new URL(src).hostname));
  } catch {
    return false;
  }
}
export function ArticleLabels({ article }: { article: ArticleSummary }) {
  const category = article.categories.find((c) => c.is_active);
  return (
    <div className="article-labels">
      {category && (
        <Link href={`/category/${category.slug}`} className="category-label">
          {category.name}
        </Link>
      )}
      {article.article_type?.is_active && (
        <Link
          className="type-label"
          href={`/articles?article_type=${article.article_type.slug}`}
        >
          {article.article_type.name}
        </Link>
      )}
    </div>
  );
}
function Highlight({ text, query }: { text: string; query?: string }) {
  const needle = query?.trim();
  if (!needle) return <>{text}</>;
  const index = text.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase());
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + needle.length)}</mark>
      {text.slice(index + needle.length)}
    </>
  );
}
export function ArticleCard({
  article,
  variant = "standard",
  preload = false,
  headingLevel = 2,
  query,
}: {
  article: ArticleSummary;
  variant?: CardVariant;
  preload?: boolean;
  headingLevel?: 1 | 2 | 3;
  query?: string;
}) {
  const Heading = headingLevel === 1 ? "h1" : headingLevel === 3 ? "h3" : "h2";
  return (
    <article className={`article-card card-${variant}`}>
      <Link
        className="card-image-link"
        href={`/articles/${article.slug}`}
        prefetch={false}
        aria-label={article.title}
        tabIndex={-1}
      >
        <ArticleImage
          src={article.featured_image}
          alt={article.featured_image_alt || ""}
          optimized={optimizedImage(article.featured_image)}
          preload={preload}
          sizes={
            variant === "lead"
              ? "(max-width: 760px) 100vw, 60vw"
              : variant === "row"
                ? "(max-width: 640px) 30vw, 240px"
                : undefined
          }
        />
      </Link>
      <div className="card-copy">
        <ArticleLabels article={article} />
        <Heading className="card-title">
          <Link href={`/articles/${article.slug}`} prefetch={false}>
            <Highlight text={article.title} query={query} />
          </Link>
        </Heading>
        {article.excerpt && <p className="card-excerpt">{article.excerpt}</p>}
        <div className="card-meta">
          <span>
            <time dateTime={article.published_at || undefined}>
              {formatDate(article.published_at)}
            </time>
            {article.author && (
              <>
                <span className="meta-dot">·</span>
                {article.author.name}
              </>
            )}
          </span>
          <Link
            href={`/articles/${article.slug}`}
            prefetch={false}
            className="card-read"
            aria-label={`Read ${article.title}`}
          >
            <span>Read story</span>
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}
