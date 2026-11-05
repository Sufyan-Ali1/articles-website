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

const title = "Ask & Explore Editorial Team: Our Authors & Standards";
export const metadata = {
  ...buildMetadata(
    title,
    "Meet the Ask & Explore Editorial Team. Explore our topics, editorial standards, approach to accuracy and transparency, contact details, and latest articles.",
    editorialTeam.path,
  ),
  title: { absolute: title },
};

const topics = [
  [
    "Technology",
    "Device features, software, and everyday technology explained.",
  ],
  [
    "Automotive",
    "Vehicle comparisons, ownership questions, and buying considerations.",
  ],
  [
    "Buying Guides",
    "Product features, costs, and tradeoffs to consider before buying.",
  ],
  ["Lifestyle", "Practical ideas for everyday routines and decisions."],
  ["Digital Safety", "Understanding online risks and safer digital habits."],
  ["Travel", "Planning questions, travel options, and practical preparation."],
];

async function Topics() {
  await connection();
  const [categories, types] = await Promise.all([
    getClassifications("categories").catch(() => []),
    getClassifications("article-types").catch(() => []),
  ]);
  return (
    <ul className={styles.topics}>
      {topics.map(([name, description]) => {
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
            : null;
        return (
          <li key={name} data-tone={name}>
            <TopicIcon index={topics.findIndex((topic) => topic[0] === name)} />
            <h3>{href ? <Link href={href}>{name}</Link> : name}</h3>
            <p>{description}</p>
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
      articles={
        <Suspense fallback={<p role="status">Loading team articles…</p>}>
          <LatestArticles />
        </Suspense>
      }
    />
  );
}
