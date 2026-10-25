import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { ArticleSummary } from "@/types/api";
import { formatDate } from "@/lib/utils";
import { ArticleImage } from "../article-image";
import { optimizedImage } from "../article-card";
import styles from "./archive.module.css";

function Title({ text, query }: { text: string; query?: string }) {
  const needle = query?.trim();
  if (!needle) return <>{text}</>;
  const start = text.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase());
  return start < 0 ? (
    <>{text}</>
  ) : (
    <>
      {text.slice(0, start)}
      <mark>{text.slice(start, start + needle.length)}</mark>
      {text.slice(start + needle.length)}
    </>
  );
}

export function ArchiveCard({
  article,
  query,
  variant = "archive",
}: {
  article: ArticleSummary;
  query?: string;
  variant?: "archive" | "search";
}) {
  const category = article.categories.find((category) => category.is_active);
  const label =
    category?.name ||
    (article.article_type?.is_active ? article.article_type.name : undefined);
  const initials = article.author?.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
  return (
    <article
      className={`${styles.card} ${variant === "search" ? styles.searchCard : ""}`}
      data-archive-story={article.slug}
    >
      <Link
        className={styles.imageLink}
        href={`/articles/${article.slug}`}
        aria-label={article.title}
        tabIndex={-1}
        prefetch={false}
      >
        <ArticleImage
          src={article.featured_image}
          alt={article.featured_image_alt || ""}
          optimized={optimizedImage(article.featured_image)}
          sizes="(max-width: 640px) 100vw, (max-width: 1199px) 45vw, 28vw"
        />
        {label && variant !== "search" && (
          <span className={styles.badge}>{label}</span>
        )}
      </Link>
      <div className={styles.cardCopy}>
        {variant === "search" && label && (
          <span className={styles.categoryLabel}>{label}</span>
        )}
        <h2>
          <Link href={`/articles/${article.slug}`} prefetch={false}>
            <Title text={article.title} query={query} />
          </Link>
        </h2>
        {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
        <div className={styles.cardMeta}>
          {article.author && (
            <span className={styles.author}>
              <span className={styles.avatar} aria-hidden="true">
                {initials}
              </span>
              <span>{article.author.name}</span>
            </span>
          )}
          {article.published_at && (
            <span className={styles.date}>
              {!article.author && <CalendarDays size={13} aria-hidden="true" />}
              <time dateTime={article.published_at}>
                {formatDate(article.published_at)}
              </time>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
