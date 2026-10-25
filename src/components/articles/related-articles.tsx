import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getArticles } from "@/lib/api/client";
import { optimizedImage } from "./article-card";
import { ArticleImage } from "./article-image";
import { NewsletterSignup, ReaderActions } from "./reader-actions";
import { ReadingPanel } from "./reading-panel";
import styles from "./reading-layout.module.css";

function RelatedArticlesShell({
  children,
  slug,
  title,
}: {
  children: ReactNode;
  slug?: string;
  title?: string;
}) {
  return (
    <ReadingPanel
      side="related"
      action={
        <Link href="/articles" className={styles.seeAll}>
          See all <ArrowRight size={13} />
        </Link>
      }
      extra={
        <>
          <NewsletterSignup />
          {slug && title ? (
            <ReaderActions title={title} slug={slug} placement="sidebar" />
          ) : (
            <div className={styles.sidebarActions} aria-hidden="true">
              <span className={styles.actionPlaceholder} />
            </div>
          )}
        </>
      }
    >
      {children}
    </ReadingPanel>
  );
}

export function RelatedArticlesSkeleton() {
  return (
    <div
      className={styles.relatedList}
      role="status"
      aria-label="Loading related articles"
    >
      <span className="sr-only">Finding more articles for you…</span>
      {Array.from({ length: 5 }, (_, index) => (
        <div className={styles.relatedStory} key={index} aria-hidden="true">
          <span className={styles.relatedImagePlaceholder} />
          <div className={styles.relatedCopy}>
            <span className={styles.textPlaceholder} />
            <span className={styles.textPlaceholder} />
            <span className={styles.shortPlaceholder} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RelatedArticlesPanelSkeleton() {
  return (
    <RelatedArticlesShell>
      <RelatedArticlesSkeleton />
    </RelatedArticlesShell>
  );
}

export function RelatedArticlesPanel({
  slug,
  category,
  title,
}: {
  slug: string;
  category?: string;
  title: string;
}) {
  return (
    <RelatedArticlesShell slug={slug} title={title}>
      <Suspense fallback={<RelatedArticlesSkeleton />}>
        <RelatedArticles slug={slug} category={category} />
      </Suspense>
    </RelatedArticlesShell>
  );
}

async function RelatedArticles({
  slug,
  category,
}: {
  slug: string;
  category?: string;
}) {
  let stories = await getArticles({ category, page_size: 6 })
    .then((result) =>
      result.data.filter((article) => article.slug !== slug).slice(0, 5),
    )
    .catch(() => []);
  if (stories.length < 5 && category) {
    const recent = await getArticles({ page_size: 6 })
      .then((result) => result.data)
      .catch(() => []);
    const seen = new Set([slug, ...stories.map((story) => story.slug)]);
    stories = [
      ...stories,
      ...recent.filter((story) => !seen.has(story.slug)),
    ].slice(0, 5);
  }
  if (!stories.length)
    return (
      <p className={styles.relatedEmpty}>
        More stories are on their way.{" "}
        <Link href="/articles">Explore all articles</Link> to find your next
        read.
      </p>
    );
  return (
    <>
      <div className={styles.relatedList}>
        {stories.map((story) => (
          <Link
            key={story.id}
            className={styles.relatedStory}
            href={`/articles/${story.slug}`}
            prefetch={false}
            title={story.title}
          >
            <ArticleImage
              src={story.featured_image}
              alt=""
              optimized={optimizedImage(story.featured_image)}
              sizes="(min-width: 1280px) 88px, (min-width: 1200px) 76px, 96px"
            />
            <div className={styles.relatedCopy}>
              <h3>{story.title}</h3>
              <span className={styles.relatedMeta}>
                <span className={styles.relatedCategory}>
                  {story.categories.find((item) => item.is_active)?.name ||
                    "Explore"}
                </span>
                <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      <Link href="/articles" className={styles.relatedBrowse}>
        View all articles <ArrowRight size={13} />
      </Link>
    </>
  );
}
