import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Clock3, ArrowUpRight } from "lucide-react";
import { getArticle, getArticles, apiOrigin } from "@/lib/api/client";
import { orNotFound } from "@/lib/api/not-found";
import { metadata, safeJsonLd } from "@/lib/seo/metadata";
import { prepareArticle } from "@/lib/utils/article-html";
import { formatDate } from "@/lib/utils";
import {
  ArticleCard,
  ArticleLabels,
  optimizedImage,
} from "@/components/articles/article-card";
import { ArticleImage } from "@/components/articles/article-image";
import {
  MobileToc,
  ReadingTools,
  ShareActions,
} from "@/components/articles/reading-tools";
import { Breadcrumbs, GridSkeleton } from "@/components/shared/states";
import { site } from "@/lib/config";
import { CodeCopy } from "@/components/articles/code-copy";
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
async function RelatedArticles({
  slug,
  category,
}: {
  slug: string;
  category?: string;
}) {
  let stories = await getArticles({ category, page_size: 4 })
    .then((r) => r.data.filter((a) => a.slug !== slug).slice(0, 3))
    .catch(() => []);
  if (stories.length < 3 && category) {
    const recent = await getArticles({ page_size: 4 })
      .then((r) => r.data)
      .catch(() => []);
    const seen = new Set([slug, ...stories.map((a) => a.slug)]);
    stories = [...stories, ...recent.filter((a) => !seen.has(a.slug))].slice(
      0,
      3,
    );
  }
  if (!stories.length) return null;
  return (
    <section className="article-related">
      <div className="section-heading">
        <h2>Keep the curiosity going.</h2>
        <Link href="/articles" className="text-link">
          More to explore
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="article-grid">
        {stories.map((story) => (
          <ArticleCard key={story.id} article={story} headingLevel={3} />
        ))}
      </div>
    </section>
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
      <Breadcrumbs
        items={[
          { label: "Articles", href: "/articles" },
          { label: article.title },
        ]}
      />
      <article>
        <header className="article-header">
          <ArticleLabels article={article} />
          <h1>{article.title}</h1>
          {article.excerpt && <p className="article-deck">{article.excerpt}</p>}
          <div className="article-byline">
            {article.author && (
              <span className="article-author">
                <span className="avatar" aria-hidden="true">
                  {article.author.name
                    .split(/\s+/)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                {article.author.name}
              </span>
            )}
            {article.published_at && (
              <time dateTime={article.published_at}>
                {formatDate(article.published_at)}
              </time>
            )}
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <Clock3 size={12} />
              {body.readingMinutes} min read
            </span>
            {article.updated_at &&
              article.published_at &&
              Date.parse(article.updated_at) -
                Date.parse(article.published_at) >
                60000 && (
                <span>
                  Updated{" "}
                  <time dateTime={article.updated_at}>
                    {formatDate(article.updated_at)}
                  </time>
                </span>
              )}
          </div>
        </header>
        {article.featured_image && (
          <figure className="article-hero">
            <ArticleImage
              src={article.featured_image}
              alt={article.featured_image_alt || ""}
              optimized={optimizedImage(article.featured_image)}
              preload
              sizes="(max-width: 1100px) 100vw, 1100px"
            />
          </figure>
        )}
        <div className="reading-layout">
          <ReadingTools headings={body.headings} title={article.title} />
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
          <div className="reading-spacer" />
        </div>
      </article>
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
      <Suspense>
        <RelatedArticles slug={slug} category={category?.slug} />
      </Suspense>
    </>
  );
}
export default function Article(props: Props) {
  return (
    <div className="container">
      <Suspense
        fallback={
          <div className="loading-page">
            <GridSkeleton variant="article" />
          </div>
        }
      >
        <ArticleContent {...props} />
      </Suspense>
    </div>
  );
}
