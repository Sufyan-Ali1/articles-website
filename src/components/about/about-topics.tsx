import { connection } from "next/server";
import Link from "next/link";
import {
  ArrowUpRight,
  CarFront,
  Laptop,
  Leaf,
  Lightbulb,
  ShoppingBag,
} from "lucide-react";
import { getClassifications } from "@/lib/api/client";
import { AboutImage } from "./about-image";
import styles from "./about.module.css";

const topics = [
  {
    title: "Technology",
    description:
      "Device comparisons, setup guides, and troubleshooting for the technology you use every day.",
    icon: Laptop,
    image: "workspace",
    alt: "A laptop and coffee on a bright desk beside a window.",
    tone: "blue",
    category: /tech|software|digital/i,
  },
  {
    title: "Automotive",
    description:
      "Car buying advice, vehicle comparisons, and maintenance explainers for everyday ownership.",
    icon: CarFront,
    image: "automotive",
    alt: "A silver SUV on a quiet road with mountains in the distance.",
    tone: "orange",
    category: /auto|car|motor/i,
  },
  {
    title: "Buying Guides",
    description:
      "Features, costs, and practical tradeoffs to consider before your next purchase.",
    icon: ShoppingBag,
    image: "buying-guides",
    alt: "A small shopping cart, paper bags, and a smartphone on a cream surface.",
    tone: "green",
    format: /buying.?guide/i,
  },
  {
    title: "How To",
    description:
      "Clear steps for device setup, everyday tasks, and common problems.",
    icon: Lightbulb,
    image: "how-to",
    alt: "An open notebook with the words Learn, Plan, Do, Grow beside a pen.",
    tone: "violet",
    format: /how.?to|tutorial/i,
  },
  {
    title: "Lifestyle",
    description:
      "Useful ideas for your home, daily routines, and a more manageable working day.",
    icon: Leaf,
    image: "lifestyle",
    alt: "A calm living room with a linen sofa, an oak table, and green plants.",
    tone: "rose",
    category: /lifestyle|everyday.?life|home.?living/i,
  },
];

function TopicSection({ hrefs = [] }: { hrefs?: string[] }) {
  return (
    <section className={styles.topics} aria-labelledby="about-topics-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>What we cover</p>
          <h2 id="about-topics-title">
            Practical knowledge for everyday decisions.
          </h2>
        </div>
        <p>
          Explore the subjects behind the things you buy, use, and do every day.
        </p>
      </div>
      <div className={styles.topicGrid}>
        {topics.map(
          ({ title, description, icon: Icon, image, alt, tone }, index) => (
            <Link
              key={title}
              href={
                hrefs[index] || `/search?search=${encodeURIComponent(title)}`
              }
              className={styles.topicCard}
            >
              <AboutImage
                name={image}
                alt={alt}
                sizes="(max-width: 540px) 100vw, (max-width: 1000px) 33vw, 20vw"
              />
              <div className={styles.topicCopy}>
                <h3>
                  <span
                    className={styles.topicIcon}
                    data-tone={tone}
                    aria-hidden="true"
                  >
                    <Icon size={19} strokeWidth={1.8} />
                  </span>
                  {title}
                </h3>
                <p>{description}</p>
                <span className={styles.topicAction}>
                  Explore <ArrowUpRight size={15} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ),
        )}
      </div>
    </section>
  );
}

export function AboutTopicsFallback() {
  return <TopicSection />;
}

export async function AboutTopics() {
  await connection();
  const [categories, types] = await Promise.all([
    getClassifications("categories").catch(() => []),
    getClassifications("article-types").catch(() => []),
  ]);
  const hrefs = topics.map((topic) => {
    const category =
      topic.category &&
      categories.find(
        (item) =>
          item.is_active && topic.category!.test(`${item.name} ${item.slug}`),
      );
    if (category) return `/category/${category.slug}`;
    const format =
      topic.format &&
      types.find(
        (item) =>
          item.is_active && topic.format!.test(`${item.name} ${item.slug}`),
      );
    return format
      ? `/articles?article_type=${format.slug}`
      : `/search?search=${encodeURIComponent(topic.title)}`;
  });
  return <TopicSection hrefs={hrefs} />;
}
