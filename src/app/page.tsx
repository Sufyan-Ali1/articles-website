import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Compass,
  BookOpen,
  GitCompareArrows,
  Sparkles,
} from "lucide-react";
import { getArticles, getClassifications } from "@/lib/api/client";
import { metadata } from "@/lib/seo/metadata";
import { ArticleCard, ArticleLabels } from "@/components/articles/article-card";
import { GridSkeleton, Unavailable } from "@/components/shared/states";
import { CuriosityArt } from "@/components/shared/curiosity-art";
import { Button } from "@/components/ui/button";
export const generateMetadata = () =>
  metadata(
    "Ask & Explore — Good questions. Better discoveries.",
    "Fresh perspectives on technology, cars, and everyday decisions. Explore articles, practical tutorials, reviews, and buying guides.",
    "/",
  );
function SectionHeading({
  number,
  title,
  href,
  label = "Explore all articles",
}: {
  number: string;
  title: string;
  href: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="section-number">{number}</span>
        <h2>{title}</h2>
      </div>
      <Link className="text-link" href={href}>
        {label}
        <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}
function Welcome() {
  return (
    <div className="home-welcome">
      <div className="home-welcome-copy">
        <span className="eyebrow">Room for a fresh perspective</span>
        <h1>
          The next discovery starts with <em>a question.</em>
        </h1>
        <p>
          Ideas, practical answers, and a closer look at the things that matter.
          Tell us what you’re curious about.
        </p>
        <Button asChild>
          <Link href="/request-article">
            Suggest our next topic
            <ArrowUpRight size={18} />
          </Link>
        </Button>
      </div>
      <CuriosityArt />
    </div>
  );
}
function RequestBanner() {
  return (
    <section className="request-banner">
      <div>
        <span className="eyebrow">You ask. We explore.</span>
        <h2>
          Your question could be
          <br />
          our next <em>starting point.</em>
        </h2>
        <p>
          A how-to, a comparison, a mystery worth unpacking. We’re listening.
        </p>
        <Button asChild>
          <Link href="/request-article">
            Suggest a topic
            <ArrowUpRight size={18} />
          </Link>
        </Button>
      </div>
      <CuriosityArt compact />
    </section>
  );
}
async function HomeStories() {
  await connection();
  const [
    featuredResult,
    latestResult,
    popularResult,
    categoryResult,
    typeResult,
  ] = await Promise.allSettled([
    getArticles({ is_featured: true, page_size: 3 }),
    getArticles({ page_size: 12 }),
    getArticles({ sort: "-view_count", page_size: 4 }),
    getClassifications("categories"),
    getClassifications("article-types"),
  ]);
  if (latestResult.status === "rejected")
    return (
      <>
        <Welcome />
        <Unavailable compact />
      </>
    );
  if (!latestResult.value.data.length) return <Welcome />;
  const allLatest = latestResult.value.data;
  const featured =
    featuredResult.status === "fulfilled" && featuredResult.value.data.length
      ? featuredResult.value.data
      : allLatest.slice(0, 3);
  const seen = new Set(featured.map((a) => a.id));
  const latest = allLatest.filter((a) => !seen.has(a.id)).slice(0, 6);
  const popular =
    popularResult.status === "fulfilled"
      ? popularResult.value.data.filter((a) => a.view_count > 0)
      : [];
  const categories =
    categoryResult.status === "fulfilled"
      ? categoryResult.value
          .filter((c) => c.is_active && !c.parent_id)
          .slice(0, 4)
      : [];
  const types =
    typeResult.status === "fulfilled"
      ? typeResult.value.filter((t) => t.is_active)
      : [];
  const directions = [
    {
      title: "Learn something.",
      description: "Make the unfamiliar feel familiar.",
      match: /tutorial|how.?to/i,
      icon: BookOpen,
      color: "sage",
    },
    {
      title: "Compare options.",
      description: "Find the difference that matters.",
      match: /comparison|compare/i,
      icon: GitCompareArrows,
      color: "blue",
    },
    {
      title: "Choose well.",
      description: "A little context for your next decision.",
      match: /buying.?guide|review/i,
      icon: Compass,
      color: "stone",
    },
  ]
    .map((d) => ({
      ...d,
      type: types.find((t) => d.match.test(`${t.name} ${t.slug}`)),
    }))
    .filter((d) => d.type);
  const deepType = types.find((t) =>
    /buying.?guide|tutorial/i.test(`${t.name} ${t.slug}`),
  );
  const deeper = deepType
    ? await getArticles({ article_type: deepType.slug, page_size: 2 })
        .then((r) => r.data)
        .catch(() => [])
    : [];
  return (
    <>
      <section className="lead-feature" aria-label="Featured stories">
        <div className="lead-feature-note">
          <span>
            <span className="blue-dot" />A fresh perspective
          </span>
          <span>
            Selected from the publication <ArrowUpRight size={14} />
          </span>
        </div>
        <div className="home-lead">
          <ArticleCard
            article={featured[0]}
            variant="lead"
            preload
            headingLevel={1}
          />
        </div>
        {featured.length > 1 && (
          <div className="supporting-stories">
            {featured.slice(1, 3).map((article, index) => (
              <div className="supporting-story" key={article.id}>
                <span className="supporting-index">0{index + 2}</span>
                <ArticleCard article={article} variant="compact" />
              </div>
            ))}
          </div>
        )}
      </section>
      {directions.length > 0 && (
        <section
          className="direction-section"
          aria-labelledby="direction-title"
        >
          <div className="direction-intro">
            <Asterisk size={24} />
            <h2 id="direction-title">
              Where will your
              <br />
              <em>curiosity take you?</em>
            </h2>
          </div>
          <div className="direction-grid">
            {directions.map(
              ({ title, description, type, icon: Icon, color }) => (
                <Link
                  href={`/articles?article_type=${type!.slug}`}
                  className={`direction-card tone-${color}`}
                  key={title}
                >
                  <Icon size={23} strokeWidth={1.5} />
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <ArrowUpRight size={19} className="direction-arrow" />
                </Link>
              ),
            )}
          </div>
        </section>
      )}
      {latest.length > 0 && (
        <section className="section">
          <SectionHeading
            number="01"
            title="The latest perspectives"
            href="/articles"
          />
          <div className="article-grid">
            {latest.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                headingLevel={3}
              />
            ))}
          </div>
        </section>
      )}
      {categories.length > 0 && (
        <section className="topic-explorer section">
          <SectionHeading
            number="02"
            title="A world beyond your usual."
            href="/categories"
            label="All topics"
          />
          <div className="topic-explorer-grid">
            {categories.map((category, index) => (
              <Link
                className="topic-explorer-card"
                href={`/category/${category.slug}`}
                key={category.id}
              >
                <span className="topic-index">0{index + 1}</span>
                <h3>{category.name}</h3>
                {category.description && <p>{category.description}</p>}
                <span className="text-link">
                  Take a closer look
                  <ArrowUpRight size={17} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {popular.length > 0 && (
        <section className="section most-viewed">
          <div className="most-viewed-intro">
            <span className="eyebrow">
              <Sparkles size={15} />
              Worth another look
            </span>
            <h2>
              Questions that
              <br />
              keep us <em>curious.</em>
            </h2>
            <p>Most viewed articles, gathered in one place.</p>
            <Link className="text-link" href="/articles?sort=-view_count">
              Explore most viewed
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="popular-list">
            {popular.map((article, index) => (
              <article key={article.id} className="popular-card">
                <span className="popular-number">0{index + 1}</span>
                <div>
                  <ArticleLabels article={article} />
                  <h3>
                    <Link href={`/articles/${article.slug}`} prefetch={false}>
                      {article.title}
                    </Link>
                  </h3>
                </div>
                <ArrowUpRight size={21} />
              </article>
            ))}
          </div>
        </section>
      )}
      {deepType && deeper.length > 0 && (
        <section className="section format-feature">
          <SectionHeading
            number="03"
            title="Go a little deeper."
            href={`/articles?article_type=${deepType.slug}`}
            label={`Explore ${deepType.name.toLowerCase()}`}
          />
          <div className="deep-stories">
            {deeper.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                headingLevel={3}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
export default function Home() {
  return (
    <div className="container home-page">
      <div className="home-masthead">
        <p>
          Good questions. <em>Better discoveries.</em>
        </p>
        <span>
          For the endlessly curious <span aria-hidden="true">✳</span>
        </span>
      </div>
      <Suspense fallback={<GridSkeleton />}>
        <HomeStories />
      </Suspense>
      <RequestBanner />
    </div>
  );
}
