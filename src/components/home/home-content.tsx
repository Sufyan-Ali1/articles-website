import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CarFront,
  Compass,
  Cpu,
  GitCompareArrows,
  Heart,
  HouseWifi,
  LaptopMinimal,
  Leaf,
  Lightbulb,
  Mail,
  MessageSquareText,
  Plane,
  Send,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { getArticles, getClassifications } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import { isGuideType, selectHomeStories } from "@/lib/utils/home-stories";
import { ArticleImage } from "@/components/articles/article-image";
import { optimizedImage } from "@/components/articles/article-card";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { Unavailable } from "@/components/shared/states";
import type {
  ArticleSummary,
  CategoryResponse,
  ClassificationResponse,
} from "@/types/api";
import styles from "./home.module.css";

type Topic = {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: string;
};
function topicDetails(name: string, slug: string) {
  const text = `${name} ${slug}`;
  if (/smart.?home|automation/i.test(text))
    return {
      icon: HouseWifi,
      tone: "violet",
      description: "Smart home setup, device compatibility, and everyday use.",
    };
  if (/electronic|gadget|hardware/i.test(text))
    return {
      icon: Cpu,
      tone: "violet",
      description:
        "Device features, electronics comparisons, and setup advice.",
    };
  if (/tech|software|digital/i.test(text))
    return {
      icon: LaptopMinimal,
      tone: "blue",
      description:
        "Device comparisons, software tips, and practical tech guides.",
    };
  if (/auto|car|motor/i.test(text))
    return {
      icon: CarFront,
      tone: "orange",
      description:
        "Car buying advice, ownership costs, and maintenance guides.",
    };
  if (/travel|destination/i.test(text))
    return {
      icon: Plane,
      tone: "teal",
      description:
        "Trip planning, destination ideas, and practical travel tips.",
    };
  if (/buying/i.test(text))
    return {
      icon: ShoppingCart,
      tone: "green",
      description: "Compare features and costs before your next purchase.",
    };
  if (/review/i.test(text))
    return {
      icon: Star,
      tone: "amber",
      description: "Product features, useful context, and everyday tradeoffs.",
    };
  if (/tutorial|how.to/i.test(text))
    return {
      icon: Lightbulb,
      tone: "violet",
      description: "Clear steps for everyday tasks and common tech problems.",
    };
  if (/guide/i.test(text))
    return {
      icon: BookOpen,
      tone: "blue",
      description: "Practical guides to help you understand your options.",
    };
  if (/comparison/i.test(text))
    return {
      icon: GitCompareArrows,
      tone: "teal",
      description: "Compare the details that matter for your needs and budget.",
    };
  if (/health/i.test(text))
    return {
      icon: Heart,
      tone: "rose",
      description:
        "Clear explainers and practical ideas for everyday wellbeing.",
    };
  if (/lifestyle|life|home/i.test(text))
    return {
      icon: Leaf,
      tone: "green",
      description:
        "Ideas for your home, daily routines, and personal productivity.",
    };
  return {
    icon: Compass,
    tone: "blue",
    description: "Explore practical guides and clear explanations by topic.",
  };
}
function topicsFrom(
  categories: CategoryResponse[],
  types: ClassificationResponse[],
): Topic[] {
  const active = categories.filter((category) => category.is_active);
  const ids = new Set(active.map((category) => category.id));
  const roots = active.filter(
    (category) => !category.parent_id || !ids.has(category.parent_id),
  );
  return [
    ...roots.map((category) => ({
      ...topicDetails(category.name, category.slug),
      name: category.name,
      description:
        category.description ||
        topicDetails(category.name, category.slug).description,
      href: `/category/${category.slug}`,
    })),
    ...types
      .filter(
        (type) =>
          type.is_active &&
          /guide|review|tutorial|how.to|comparison/i.test(
            `${type.name} ${type.slug}`,
          ),
      )
      .map((type) => ({
        ...topicDetails(type.name, type.slug),
        name: type.name,
        description: topicDetails(type.name, type.slug).description,
        href: `/articles?article_type=${type.slug}`,
      })),
  ].slice(0, 6);
}

function StoryImage({
  article,
  preload = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw",
}: {
  article: ArticleSummary;
  preload?: boolean;
  sizes?: string;
}) {
  return (
    <ArticleImage
      src={article.featured_image}
      alt={article.featured_image_alt || ""}
      optimized={optimizedImage(article.featured_image)}
      preload={preload}
      sizes={sizes}
    />
  );
}
function StoryMeta({ article }: { article: ArticleSummary }) {
  return (
    <div className={styles.storyMeta}>
      {article.published_at && (
        <span>
          <CalendarDays size={13} />
          <time dateTime={article.published_at}>
            {formatDate(article.published_at)}
          </time>
        </span>
      )}
      {article.author && <span>{article.author.name}</span>}
    </div>
  );
}
function StoryCategory({ article }: { article: ArticleSummary }) {
  return (
    <span className={styles.storyCategory}>
      {article.categories.find((category) => category.is_active)?.name ||
        (article.article_type?.is_active
          ? article.article_type.name
          : "Explore")}
    </span>
  );
}
function StoryCard({
  article,
  compact = false,
}: {
  article: ArticleSummary;
  compact?: boolean;
}) {
  return (
    <article
      className={compact ? styles.reviewCard : styles.storyCard}
      data-home-story={article.slug}
    >
      <Link
        className={styles.storyImage}
        href={`/articles/${article.slug}`}
        prefetch={false}
        aria-label={article.title}
        tabIndex={-1}
      >
        <StoryImage article={article} />
      </Link>
      <div className={styles.storyCopy}>
        <StoryCategory article={article} />
        <h3>
          <Link href={`/articles/${article.slug}`} prefetch={false}>
            {article.title}
          </Link>
        </h3>
        {!compact && article.excerpt && <p>{article.excerpt}</p>}
        <StoryMeta article={article} />
      </div>
    </article>
  );
}

function SectionHeading({
  title,
  description,
  href,
  label = "View all articles",
  popular = false,
}: {
  title: string;
  description: string;
  href: string;
  label?: string;
  popular?: boolean;
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        <h2>
          {popular && <TrendingUp size={27} />}
          {title}
          {!popular && <span aria-hidden="true" />}
        </h2>
        <p>{description}</p>
      </div>
      <Link href={href}>
        {label}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function SectionEmpty({ children }: { children: string }) {
  return (
    <div className={styles.sectionEmpty}>
      <BookOpen size={26} strokeWidth={1.5} />
      <p>{children}</p>
      <Link href="/articles">
        Explore published articles
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function Hero({ article }: { article?: ArticleSummary }) {
  return (
    <section
      className={styles.hero}
      aria-label="Featured story"
      data-has-feature={Boolean(article)}
    >
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Technology, cars &amp; everyday life</p>
        <h1>
          Practical Guides.
          <br />
          Clear Answers.
          <br />
          <em>Smarter Everyday Choices.</em>
        </h1>
        <p className={styles.heroDescription}>
          Choosing a laptop, comparing cars, or solving an everyday problem?
          Find practical how-to guides, product comparisons, and clear
          explanations to help you decide what works for you.
        </p>
        <Link href="/articles" className={styles.primaryButton}>
          Explore Latest Articles
          <ArrowRight size={19} />
        </Link>
        <div className={styles.heroNote}>
          <span>
            <BookOpen size={18} />
            <Compass size={18} />
            <Sparkles size={18} />
          </span>
          <p>
            Understand your options.
            <br />
            Find your next useful step.
          </p>
        </div>
      </div>
      {article && (
        <article className={styles.heroFeature} data-home-story={article.slug}>
          <Link
            href={`/articles/${article.slug}`}
            prefetch={false}
            className={styles.heroFeatureLink}
          >
            <StoryImage
              article={article}
              preload
              sizes="(max-width: 899px) 100vw, 55vw"
            />
            <div className={styles.heroOverlay}>
              <StoryCategory article={article} />
              <h2>{article.title}</h2>
              <span className={styles.heroArrow} aria-hidden="true">
                <ArrowRight size={23} />
              </span>
            </div>
          </Link>
        </article>
      )}
    </section>
  );
}

export function HomeCallsToAction() {
  return (
    <section className={styles.callouts} aria-label="Stay curious">
      <div className={styles.requestCard}>
        <MessageSquareText size={31} />
        <div>
          <h2>Request an Article</h2>
          <p>
            Can’t find the answer you need?
            <br />
            Suggest a question for a future guide.
          </p>
          <Link href="/request-article" className={styles.outlineButton}>
            Suggest a Topic
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.requestArt} aria-hidden="true">
          <Send size={43} />
          <div>
            <span />
            <span />
            <span />
            <span />
          </div>
          <i />
        </div>
      </div>
      <div className={styles.newsletterCard}>
        <Mail size={31} />
        <div>
          <p className={styles.eyebrow}>Stay curious</p>
          <h2>Useful Reads for Your Next Decision</h2>
          <p>
            Subscribe for future article updates. Browse the latest guides
            today.
          </p>
          <NewsletterForm label="Homepage newsletter signup" />
        </div>
        <Leaf
          className={styles.newsletterLeaf}
          size={74}
          strokeWidth={0.8}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

export async function HomeContent() {
  await connection();
  const [
    featuredResult,
    latestResult,
    popularResult,
    categoriesResult,
    typesResult,
  ] = await Promise.allSettled([
    getArticles({ is_featured: true, page_size: 8 }),
    getArticles({ page_size: 24 }),
    getArticles({ sort: "-view_count", page_size: 24 }),
    getClassifications("categories"),
    getClassifications("article-types"),
  ]);
  const latest =
    latestResult.status === "fulfilled" ? latestResult.value.data : [];
  const featured =
    featuredResult.status === "fulfilled" ? featuredResult.value.data : [];
  const types =
    typesResult.status === "fulfilled"
      ? typesResult.value.filter((type) => type.is_active)
      : [];
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const guideTypes = types.filter(isGuideType);
  const guideResults = guideTypes.length
    ? await Promise.allSettled(
        guideTypes
          .slice(0, 6)
          .map((type) =>
            getArticles({ article_type: type.slug, page_size: 6 }),
          ),
      )
    : [];
  const guides = [
    ...guideResults.flatMap((result) =>
      result.status === "fulfilled" ? result.value.data : [],
    ),
    ...latest.filter(
      (article) =>
        article.article_type?.is_active && isGuideType(article.article_type),
    ),
  ];
  const stories = selectHomeStories({
    latest,
    featured,
    guides,
    popular:
      popularResult.status === "fulfilled" ? popularResult.value.data : [],
  });
  const topics = topicsFrom(categories, types);
  return (
    <>
      <div
        className={styles.firstScreen}
        data-home-intro
        data-has-feature={Boolean(stories.hero)}
      >
        <div className={`${styles.shell} ${styles.heroShell}`}>
          <Hero article={stories.hero} />
        </div>
        {topics.length > 0 && (
          <nav className={styles.topicBand} aria-label="Discover topics">
            <div className={styles.topicStrip}>
              {topics
                .slice(0, 5)
                .map(({ name, href, icon: Icon, description, tone }) => (
                  <Link key={href} href={href} data-tone={tone}>
                    <span className={styles.stripIcon} aria-hidden="true">
                      <Icon size={23} strokeWidth={1.8} />
                    </span>
                    <span>
                      <strong>{name}</strong>
                      <small>{description}</small>
                    </span>
                  </Link>
                ))}
            </div>
          </nav>
        )}
      </div>
      <div className={styles.shell}>
        {latestResult.status === "rejected" && <Unavailable compact />}
        {latestResult.status === "fulfilled" && !latest.length && (
          <p className={styles.emptyNote}>
            No articles are available right now. Explore our topics or suggest a
            question you would like a future guide to answer.
          </p>
        )}
        {topics.length > 0 && (
          <section className={styles.section} aria-label="Explore by Category">
            <SectionHeading
              title="Explore by Category"
              description="Choose a topic to find practical advice, how-to guides, and useful comparisons."
              href="/categories"
              label="View all categories"
            />
            <div className={styles.categoryGrid}>
              {topics.map(({ name, href, description, icon: Icon, tone }) => (
                <Link
                  key={href}
                  href={href}
                  className={styles.categoryCard}
                  data-tone={tone}
                >
                  <span className={styles.categoryIcon} aria-hidden="true">
                    <Icon size={28} strokeWidth={1.8} />
                  </span>
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <span className={styles.smallArrow} aria-hidden="true">
                    <ArrowRight size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
        {stories.latest.length > 0 && (
          <section className={styles.section} aria-label="Latest Articles">
            <SectionHeading
              title="Latest Articles"
              description="New guides and clear explanations for the questions behind your next decision."
              href="/articles"
            />
            <div className={styles.articleGrid}>
              {stories.latest.map((article) => (
                <StoryCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}
        <section className={styles.section} aria-label="Editor's Picks">
          <SectionHeading
            title="Editor’s Picks"
            description={
              stories.editorsAreFeatured
                ? "Featured guides and perspectives selected for your next read."
                : "Start with these published articles while we prepare our next featured selections."
            }
            href="/articles"
            label="Explore more stories"
          />
          {stories.editors.length ? (
            <div className={styles.editorsGrid}>
              <article
                className={styles.editorLead}
                data-home-story={stories.editors[0].slug}
              >
                <Link
                  className={styles.editorImage}
                  href={`/articles/${stories.editors[0].slug}`}
                  prefetch={false}
                  tabIndex={-1}
                  aria-label={stories.editors[0].title}
                >
                  <StoryImage
                    article={stories.editors[0]}
                    sizes="(max-width: 640px) 100vw, 35vw"
                  />
                  <span className={styles.editorBadge}>
                    {stories.editorsAreFeatured
                      ? "Editor’s pick"
                      : "Explore next"}
                  </span>
                </Link>
                <div className={styles.editorCopy}>
                  <StoryCategory article={stories.editors[0]} />
                  <h3>
                    <Link
                      href={`/articles/${stories.editors[0].slug}`}
                      prefetch={false}
                    >
                      {stories.editors[0].title}
                    </Link>
                  </h3>
                  {stories.editors[0].excerpt && (
                    <p>{stories.editors[0].excerpt}</p>
                  )}
                  <StoryMeta article={stories.editors[0]} />
                </div>
              </article>
              {stories.editors.length > 1 && (
                <div className={styles.editorStack}>
                  {stories.editors.slice(1).map((article) => (
                    <article
                      className={styles.editorSmall}
                      key={article.id}
                      data-home-story={article.slug}
                    >
                      <Link
                        href={`/articles/${article.slug}`}
                        prefetch={false}
                        tabIndex={-1}
                        aria-label={article.title}
                      >
                        <StoryImage
                          article={article}
                          sizes="(max-width: 640px) 35vw, 180px"
                        />
                      </Link>
                      <div>
                        <StoryCategory article={article} />
                        <h3>
                          <Link
                            href={`/articles/${article.slug}`}
                            prefetch={false}
                          >
                            {article.title}
                          </Link>
                        </h3>
                        <StoryMeta article={article} />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <SectionEmpty>
              Our editors are preparing their next selections. Explore the
              publication in the meantime.
            </SectionEmpty>
          )}
        </section>
        <section
          className={`${styles.section} ${styles.popularSection}`}
          aria-label="Popular articles"
        >
          <SectionHeading
            title="Popular with Readers"
            description="See which published articles have received the most views."
            href="/articles?sort=-view_count"
            label="View all popular"
            popular
          />
          {stories.popular.length ? (
            <div className={styles.popularGrid}>
              {stories.popular.map((article, index) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  prefetch={false}
                  className={styles.popularStory}
                  data-home-story={article.slug}
                >
                  <span className={styles.rank}>{index + 1}</span>
                  <StoryImage article={article} sizes="100px" />
                  <div>
                    <h3>{article.title}</h3>
                    {article.published_at && (
                      <time dateTime={article.published_at}>
                        {formatDate(article.published_at)}
                      </time>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <SectionEmpty>
              Reader favorites will appear here as published stories gather
              views.
            </SectionEmpty>
          )}
        </section>
        <section className={styles.section} aria-label="Reviews & Guides">
          <SectionHeading
            title="Reviews & Guides"
            description="Compare features, understand the tradeoffs, and work out what fits your needs."
            href={
              guideTypes[0]
                ? `/articles?article_type=${guideTypes[0].slug}`
                : "/articles"
            }
            label="Explore all guides"
          />
          {stories.guides.length ? (
            <div className={styles.articleGrid}>
              {stories.guides.map((article) => (
                <StoryCard article={article} key={article.id} compact />
              ))}
            </div>
          ) : (
            <SectionEmpty>
              New reviews, comparisons, and guides are on their way. Discover
              more published stories while you wait.
            </SectionEmpty>
          )}
        </section>
        <HomeCallsToAction />
      </div>
    </>
  );
}
