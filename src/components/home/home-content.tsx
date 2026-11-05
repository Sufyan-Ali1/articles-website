import { AuthorName } from "@/components/authors/author-name";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CarFront,
  Compass,
  LaptopMinimal,
  Leaf,
  Mail,
  MessageSquareText,
  Plane,
  Send,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
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
  shortDescription: string;
  href: string;
  icon: LucideIcon;
  tone: string;
};
const homeTopics = [
  {
    name: "Automotive",
    shortDescription: "Car buying & ownership tips",
    icon: CarFront,
    tone: "orange",
    pattern: /auto|car|motor/i,
    description:
      "Explore car buying advice, electric and hybrid vehicle comparisons, ownership costs, and practical information to help you understand your next vehicle decision.",
  },
  {
    name: "Technology",
    shortDescription: "AI tools & tech guides",
    icon: LaptopMinimal,
    tone: "blue",
    pattern: /tech|software/i,
    description:
      "Discover technology guides covering AI tools, laptops, software, digital productivity, and practical ways to make better use of everyday tech.",
  },
  {
    name: "Buying Guides",
    shortDescription: "Product features & prices",
    icon: ShoppingCart,
    tone: "green",
    pattern: /buying.?guides?/i,
    description:
      "Compare product features, prices, performance, and important trade-offs before choosing products that fit your budget and needs.",
  },
  {
    name: "Lifestyle",
    shortDescription: "Focus & daily routines",
    icon: Leaf,
    tone: "green",
    pattern: /lifestyle|everyday.?life|home.?living/i,
    description:
      "Find practical lifestyle tips for reducing screen time, improving focus, managing digital habits, and building better everyday routines.",
  },
  {
    name: "Digital Safety",
    shortDescription: "Privacy & account security",
    icon: ShieldCheck,
    tone: "violet",
    pattern: /digital.?safety|online.?safety|cyber.?security/i,
    description:
      "Learn about online privacy, account security, phishing scams, and practical steps to protect your information and stay safer online.",
  },
  {
    name: "Travel",
    shortDescription: "Flight deals & travel tips",
    icon: Plane,
    tone: "teal",
    pattern: /travel|destination/i,
    description:
      "Explore travel planning guides, cheap flight tips, fare comparisons, price alerts, and helpful advice for avoiding unnecessary booking costs.",
  },
];
function topicsFrom(
  categories: CategoryResponse[],
  types: ClassificationResponse[],
): Topic[] {
  return homeTopics.map(({ pattern, ...topic }) => {
    const matches = (item: ClassificationResponse) =>
      item.is_active && pattern.test(`${item.name} ${item.slug}`);
    const category = categories.find(matches);
    const type = types.find(matches);
    return {
      ...topic,
      href: category
        ? `/category/${category.slug}`
        : type
          ? `/articles?article_type=${type.slug}`
          : `/search?search=${encodeURIComponent(topic.name)}`,
    };
  });
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
      {article.author && (
        <span>
          <AuthorName author={article.author} />
        </span>
      )}
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
  label = "View All Articles",
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
        <p className={styles.eyebrow}>
          Guides, Comparisons &amp; Everyday Advice
        </p>
        <h1>
          Ask &amp; Explore: Practical Guides &amp; <em>Everyday Advice</em>
        </h1>
        <p className={styles.heroDescription}>
          Explore practical technology guides, car buying advice, product
          comparisons, digital safety tips, travel planning ideas, and lifestyle
          articles. Ask &amp; Explore helps you understand your options, compare
          important details, and find useful answers to everyday questions.
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
          <div>
            <h2>Understand Your Options. Find Your Next Useful Step.</h2>
            <p>
              Explore clear explanations, how-to guides, and useful comparisons
              across the topics that matter to you.
            </p>
          </div>
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
          <h3>Have a Question We Haven&apos;t Covered?</h3>
          <p>
            Looking for a helpful explanation or comparison? Suggest a topic you
            would like Ask &amp; Explore to cover in a future article.
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
          <p className={styles.eyebrow}>Stay Curious</p>
          <h2>Useful Reads for Your Next Decision</h2>
          <p>
            Join our list to receive new Ask &amp; Explore articles, practical
            guides, and useful comparisons by email.
          </p>
          <NewsletterForm
            label="Homepage newsletter signup"
            buttonText="Sign Up for Updates"
          />
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
                .map(({ name, href, icon: Icon, shortDescription, tone }) => (
                  <Link key={href} href={href} data-tone={tone}>
                    <span className={styles.stripIcon} aria-hidden="true">
                      <Icon size={23} strokeWidth={1.8} />
                    </span>
                    <span>
                      <strong>{name}</strong>
                      <small>{shortDescription}</small>
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
              description="Browse six topics to find practical guides, helpful comparisons, and explanations that match your interests."
              href="/categories"
              label="View All Categories"
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
              description="Discover recently published Ask & Explore guides, comparisons, and clear explanations covering technology, cars, digital safety, travel, and everyday life."
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
            title="Editor's Picks"
            description="Explore selected Ask & Explore articles featuring practical advice, useful explanations, and comparisons worth reading."
            href="/articles"
            label="Explore More Stories"
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
            description="Discover the Ask & Explore articles readers have viewed most."
            href="/articles?sort=-view_count"
            label="View All Popular Articles"
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
        <section
          className={styles.section}
          aria-label="Buying Guides & Comparisons"
        >
          <SectionHeading
            title="Buying Guides & Comparisons"
            description="Explore product comparisons and buying guides that explain features, costs, benefits, and trade-offs to help you make informed choices."
            href={
              guideTypes[0]
                ? `/articles?article_type=${guideTypes[0].slug}`
                : "/articles"
            }
            label="Explore All Guides"
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
