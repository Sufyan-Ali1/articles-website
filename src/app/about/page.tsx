import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import {
  ArrowUpRight,
  MoveUpRight,
  Search,
  Compass,
  Asterisk,
} from "lucide-react";
import { CuriosityArt } from "@/components/shared/curiosity-art";
import { ArticleCard } from "@/components/articles/article-card";
import { Button } from "@/components/ui/button";
import { getArticles } from "@/lib/api/client";
import { metadata } from "@/lib/seo/metadata";
export const generateMetadata = () =>
  metadata(
    "About Ask & Explore",
    "A publication built around curiosity, clear explanations, and useful perspectives on everyday decisions.",
    "/about",
  );
async function PublishedExamples() {
  await connection();
  const articles = await getArticles({ page_size: 3 })
    .then((r) => r.data)
    .catch(() => []);
  return articles.length > 0 ? (
    <section className="section about-examples">
      <div className="section-heading">
        <div>
          <span className="section-number">02</span>
          <h2>A few places to begin.</h2>
        </div>
        <Link href="/articles" className="text-link">
          Explore the publication
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="article-grid">
        {articles.map((article) => (
          <ArticleCard article={article} key={article.id} headingLevel={3} />
        ))}
      </div>
    </section>
  ) : null;
}
export default function About() {
  return (
    <div className="container about-page">
      <section className="about-hero">
        <div>
          <span className="eyebrow">
            <span className="blue-dot" />
            For the endlessly curious
          </span>
          <h1>
            A little curiosity
            <br />
            goes <em>a long way.</em>
          </h1>
          <p>
            Ask & Explore is a place to follow a question, understand an idea,
            and find a useful next step.
          </p>
          <Link className="text-link" href="/articles">
            Find your next perspective
            <ArrowUpRight size={19} />
          </Link>
        </div>
        <CuriosityArt />
      </section>
      <section className="about-statement">
        <span className="eyebrow">The idea behind the questions</span>
        <h2>
          The world moves quickly.
          <br />
          <em>Understanding deserves a little space.</em>
        </h2>
        <div>
          <p>
            Technology changes. Products evolve. Everyday decisions get
            complicated. We created Ask & Explore around a simple idea: a
            thoughtful question deserves an explanation you can actually use.
          </p>
          <p>
            Our interests cross categories, from technology and cars to
            practical tutorials, product reviews, comparisons, and buying
            guides. The connecting thread is curiosity about how things work—and
            what they mean for everyday life.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">01</span>
            <h2>What we’re here to do.</h2>
          </div>
          <span className="eyebrow">An editorial intention</span>
        </div>
        <div className="principles-grid">
          {[
            {
              icon: Search,
              title: "Make things clearer.",
              text: "Our aim is to make unfamiliar subjects approachable, with explanations you can follow at your own pace.",
            },
            {
              icon: Compass,
              title: "Put things in context.",
              text: "A useful recommendation needs more than a headline. Scope, sources, dates, and individual circumstances matter.",
            },
            {
              icon: MoveUpRight,
              title: "Find a useful next step.",
              text: "A good explanation should leave you better equipped to ask, explore, or decide what comes next.",
            },
          ].map(({ icon: Icon, title, text }, index) => (
            <article key={title}>
              <div>
                <span>0{index + 1}</span>
                <Icon size={26} strokeWidth={1.5} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <Suspense>
        <PublishedExamples />
      </Suspense>
      <section className="about-context">
        <Asterisk size={34} strokeWidth={1.4} />
        <div>
          <h2>Read with the context in view.</h2>
          <p>
            Coverage varies by article. A review label alone doesn’t mean
            hands-on testing, and information can change. Each article’s
            evidence and disclosures matter.
          </p>
          <Link className="text-link" href="/disclaimer">
            Our editorial disclosures
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <section className="about-invite">
        <span className="eyebrow">Your questions belong here</span>
        <h2>
          What should we
          <br />
          <em>explore next?</em>
        </h2>
        <p>
          Some of the most useful stories begin with “Why?” or “How do I
          choose?” Help shape our next starting point.
        </p>
        <Button asChild>
          <Link href="/request-article">
            Suggest a topic
            <ArrowUpRight size={18} />
          </Link>
        </Button>
      </section>
    </div>
  );
}
