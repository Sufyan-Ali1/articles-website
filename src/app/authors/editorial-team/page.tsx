import { TopicIcon } from "@/components/authors/editorial-profile";
import { Suspense } from "react";
import { EditorialProfile } from "@/components/authors/editorial-profile";
import Link from "next/link";
import { connection } from "next/server";
import { getClassifications, getSitemapArticles } from "@/lib/api/client";
import {
  editorialTeam,
  latestTeamArticles,
} from "@/lib/content/editorial-team";
import { metadata as buildMetadata } from "@/lib/seo/metadata";
import { ArticleCard } from "@/components/articles/article-card";
import styles from "./profile.module.css";

const title = "Ask & Explore Editorial Team | Author Profile & Standards";
const baseMetadata = buildMetadata(
  title,
  "Meet the Ask & Explore Editorial Team. Learn about our shared author profile, research principles, editorial standards, and the practical guides we publish.",
  editorialTeam.path,
);
const socialTitle = "Ask & Explore Editorial Team | Author Profile";
const socialDescription =
  "Learn about the Ask & Explore Editorial Team, our editorial principles, research approach, and practical guides.";
export const metadata = {
  ...baseMetadata,
  title: { absolute: title },
  openGraph: {
    ...baseMetadata.openGraph,
    title: socialTitle,
    description: socialDescription,
  },
  twitter: {
    ...baseMetadata.twitter,
    title: socialTitle,
    description: socialDescription,
    card: "summary_large_image" as const,
  },
};

const topics: readonly (readonly [string, string])[] = [
  [
    "Technology",
    "AI tools, software, digital services, laptops, and technology explanations.",
  ],
  [
    "Automotive",
    "Vehicle comparisons, ownership costs, maintenance considerations, and car-buying decisions.",
  ],
  [
    "Buying Guides",
    "Product features, specifications, prices, comparisons, and purchasing tradeoffs.",
  ],
  [
    "Lifestyle",
    "Digital wellbeing, daily routines, productivity, and practical everyday habits.",
  ],
  [
    "Digital Safety",
    "Online privacy, account security, cyber scams, and safer digital practices.",
  ],
  [
    "Travel",
    "Flight booking, travel planning, price comparisons, and practical travel tips.",
  ],
];

const exploreTopics = [
  [
    "Technology",
    "Explore AI tools, software, laptops, digital services, and everyday technology questions.",
  ],
  [
    "Automotive",
    "Understand vehicle comparisons, ownership costs, maintenance considerations, and car-buying choices.",
  ],
  [
    "Buying Guides",
    "Compare features, specifications, prices, and practical considerations before purchasing.",
  ],
  [
    "Lifestyle",
    "Discover ideas for digital wellbeing, focus, daily routines, and everyday productivity.",
  ],
  [
    "Digital Safety",
    "Learn about account protection, online privacy, scams, and safer digital habits.",
  ],
  [
    "Travel",
    "Explore flight booking strategies, travel planning, fare comparisons, and practical trip preparation.",
  ],
] as const;

async function Topics({
  items = topics,
}: {
  items?: readonly (readonly [string, string])[];
}) {
  await connection();
  const [categories, types] = await Promise.all([
    getClassifications("categories").catch(() => []),
    getClassifications("article-types").catch(() => []),
  ]);
  return (
    <ul className={styles.topics}>
      {items.map(([name, description], index) => {
        const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const matches = (item: {
          name: string;
          slug: string;
          is_active: boolean;
        }) =>
          item.is_active &&
          [item.name, item.slug].some(
            (value) =>
              value
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .replace(/guides$/, "guide") ===
              key.replace(/guides$/, "guide"),
          );
        const category = categories.find(matches);
        const type = types.find(matches);
        const href = category
          ? `/category/${category.slug}`
          : type
            ? `/articles?article_type=${type.slug}`
            : `/search?search=${encodeURIComponent(name)}`;
        return (
          <li key={name} data-tone={name}>
            <Link className={styles.topicLink} href={href} aria-label={name}>
              <TopicIcon index={index} />
              <h3>{name}</h3>
              <p>{description}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

async function LatestArticles() {
  await connection();
  const result = await getSitemapArticles()
    .then(latestTeamArticles)
    .catch(() => null);
  if (result === null)
    return (
      <p role="status">
        We couldn’t load the latest articles. Please try again shortly.
      </p>
    );
  return result.length ? (
    <div className={styles.articles}>
      {result.map((article) => (
        <ArticleCard key={article.id} article={article} headingLevel={3} />
      ))}
    </div>
  ) : (
    <p>
      No articles are currently attributed to the Editorial Team.{" "}
      <Link href="/articles">Browse all articles</Link>.
    </p>
  );
}

export default function EditorialTeamPage() {
  return (
    <EditorialProfile
      topics={
        <Suspense
          fallback={
            <p>
              Technology, Automotive, Buying Guides, Lifestyle, Digital Safety,
              and Travel.
            </p>
          }
        >
          <Topics />
        </Suspense>
      }
      exploreTopics={
        <Suspense fallback={<p role="status">Loading topics…</p>}>
          <Topics items={exploreTopics} />
        </Suspense>
      }
      articles={
        <Suspense fallback={<p role="status">Loading team articles…</p>}>
          <LatestArticles />
        </Suspense>
      }
    />
  );
}
