import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowUpRight } from "lucide-react";
import { getArticle, apiOrigin } from "@/lib/api/client";
import { orNotFound } from "@/lib/api/not-found";
import { metadata, safeJsonLd } from "@/lib/seo/metadata";
import { prepareArticle } from "@/lib/utils/article-html";
import { formatDate } from "@/lib/utils";
import {
  ArticleLabels,
  optimizedImage,
} from "@/components/articles/article-card";
import { ArticleImage } from "@/components/articles/article-image";
import {
  MobileToc,
  ReadingProgress,
  ReadingTools,
  ShareActions,
} from "@/components/articles/reading-tools";
import { Breadcrumbs } from "@/components/shared/states";
import { site } from "@/lib/config";
import { CodeCopy } from "@/components/articles/code-copy";
import { ReaderActions } from "@/components/articles/reader-actions";
import { RelatedArticlesPanel } from "@/components/articles/related-articles";
import { ReaderSkeleton } from "@/components/articles/reader-skeleton";
import styles from "@/components/articles/reading-layout.module.css";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await orNotFound(getArticle(slug));
  return metadata(
    article.meta_title || article.title,
    article.meta_description ||
      article.excerpt ||
      `Read ${article.title} at Ask & Explore.`,
    `/articles/${article.slug}`,
    {
      article: true,
      image: article.featured_image,
      published: article.published_at,
      modified: article.updated_at,
      author: article.author?.name,
    },
  );
}
async function ArticleContent({ params }: Props) {
  await connection();
  const { slug } = await params;
  const article = await orNotFound(getArticle(slug));
  const body = prepareArticle(article.content_html, apiOrigin());
  const category = article.categories.find((c) => c.is_active);
  const tags = article.tags.filter((t) => t.is_active);
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: new URL("/articles", site.url).href,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: new URL(`/articles/${article.slug}`, site.url).href,
      },
    ],
  };
  return (
    <>
      <ReadingProgress key={slug} />
      <div
        className={styles.layout}
        data-has-contents={body.headings.length > 0}
      >
        <ReadingTools key={slug} headings={body.headings} />
        <article className={styles.column}>
          <Breadcrumbs
            homeIcon
            items={[
              { label: "Articles", href: "/articles" },
              ...(category
                ? [{ label: category.name, href: `/category/${category.slug}` }]
                : []),
            ]}
          />
          <header className="article-header">
            <ArticleLabels article={article} />
            <h1>{article.title}</h1>
            {article.excerpt && (
              <p className="article-deck">{article.excerpt}</p>
            )}
            <div className={styles.authorRow}>
              <div className="article-byline">
                {article.author && (
                  <span className="avatar" aria-hidden="true">
                    {article.author.name
                      .split(/\s+/)
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                )}
                <div className={styles.authorDetails}>
                  {article.author && (
                    <span className="article-author">
                      <span className={styles.byLabel}>By</span>{" "}
                      {article.author.name}
                    </span>
                  )}
                  <div className={styles.dateLine}>
                    {article.published_at && (
                      <>
                        <time dateTime={article.published_at}>
                          {formatDate(article.published_at)}
                        </time>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span>{body.readingMinutes} min read</span>
                  </div>
                  {article.updated_at &&
                    article.published_at &&
                    Date.parse(article.updated_at) -
                      Date.parse(article.published_at) >
                      60000 && (
                      <span className={styles.updatedDate}>
                        Updated{" "}
                        <time dateTime={article.updated_at}>
                          {formatDate(article.updated_at)}
                        </time>
                      </span>
                    )}
                </div>
              </div>
              <ReaderActions title={article.title} slug={slug} />
            </div>
          </header>
          {article.featured_image && (
            <figure className="article-hero">
              <ArticleImage
                src={article.featured_image}
                alt={article.featured_image_alt || ""}
                optimized={optimizedImage(article.featured_image)}
                preload
                sizes="(max-width: 899px) 100vw, 720px"
              />
            </figure>
          )}
          <div>
            <MobileToc headings={body.headings} />
            {body.sponsored && (
              <aside className="affiliate-note">
                This article contains links marked as sponsored.{" "}
                <Link href="/disclaimer">
                  Read our editorial and affiliate disclosures.
                </Link>
              </aside>
            )}
            <div
              id="article-content"
              className="article-body"
              dangerouslySetInnerHTML={{ __html: body.html }}
            />
            <CodeCopy />
            <footer className="article-end">
              {tags.length > 0 && (
                <nav className="article-tags" aria-label="Article tags">
                  {tags.map((tag) => (
                    <Link key={tag.id} href={`/tag/${tag.slug}`}>
                      {tag.name}
                    </Link>
                  ))}
                </nav>
              )}
              <div className="article-end-actions">
                <ShareActions title={article.title} />
                <Link
                  className="correction-link"
                  href={`/contact?${new URLSearchParams({ reason: "correction", article: new URL(`/articles/${article.slug}`, site.url).href })}`}
                >
                  Suggest a correction
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </footer>
          </div>
        </article>
        <RelatedArticlesPanel
          key={slug}
          slug={slug}
          category={category?.slug}
          title={article.title}
        />
      </div>
      {article.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(article.schema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }}
      />
    </>
  );
}
export default function Article(props: Props) {
  return (
    <div className={`container ${styles.page}`}>
      <Suspense fallback={<ReaderSkeleton />}>
        <ArticleContent {...props} />
      </Suspense>
    </div>
  );
}
