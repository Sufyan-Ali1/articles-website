import { connection } from "next/server";
import Link from "next/link";
import {
  ArrowUpRight,
  CarFront,
  Laptop,
  Leaf,
  Plane,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { getClassifications } from "@/lib/api/client";
import { AboutImage } from "./about-image";
import styles from "./about.module.css";

const topics = [
  {
    title: "Technology",
    description:
      "Understand AI tools, software, laptops, and digital productivity with practical technology guides, clear explanations, and useful comparisons.",
    icon: Laptop,
    image: "workspace",
    alt: "A laptop and coffee on a bright desk beside a window.",
    tone: "blue",
    category: /tech|software/i,
  },
  {
    title: "Automotive",
    description:
      "Explore car buying advice, electric and hybrid vehicle comparisons, ownership costs, and practical information about everyday vehicle decisions.",
    icon: CarFront,
    image: "automotive",
    alt: "A silver SUV on a quiet road with mountains in the distance.",
    tone: "orange",
    category: /auto|car|motor/i,
  },
  {
    title: "Buying Guides",
    description:
      "Compare product features, specifications, prices, and trade-offs to understand what matters before you buy.",
    icon: ShoppingBag,
    image: "buying-guides",
    alt: "A small shopping cart, paper bags, and a smartphone on a cream surface.",
    tone: "green",
    format: /buying.?guide/i,
  },
  {
    title: "Digital Safety",
    description:
      "Learn about account security, online privacy, suspicious messages, and common digital risks through practical online safety guides.",
    icon: ShieldCheck,
    image: "workspace",
    alt: "A laptop and coffee on a bright desk beside a window.",
    tone: "violet",
    category:
      /digital.?safety|online.?safety|cyber.?security|online.?security/i,
  },
  {
    title: "Lifestyle",
    description:
      "Discover practical ideas for reducing screen time, managing digital distractions, improving focus, and building more balanced daily routines.",
    icon: Leaf,
    image: "lifestyle",
    alt: "A calm living room with a linen sofa, an oak table, and green plants.",
    tone: "rose",
    category: /lifestyle|everyday.?life|home.?living/i,
  },
  {
    title: "Travel",
    description:
      "Explore travel planning guides, cheap flight tips, fare comparisons, and price alerts to compare booking options and prepare for your next trip.",
    icon: Plane,
    image: "explore",
    alt: "A traveler overlooking a mountain lake at sunrise.",
    tone: "teal",
    category: /travel|destination/i,
  },
];

function TopicSection({ hrefs = [] }: { hrefs?: string[] }) {
  return (
    <section className={styles.topics} aria-labelledby="about-topics-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>What we cover</p>
          <h2 id="about-topics-title">
            Explore Practical Guides Across Everyday Topics
          </h2>
        </div>
        <p>
          Our articles cover the technology you use, the products you compare,
          the vehicles you consider, and the habits that shape daily life. We
          also publish travel planning guides and digital safety advice. Explore
          our categories to find a subject that interests you.
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
                sizes="(max-width: 540px) 100vw, 33vw"
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
                  Explore {title} <ArrowUpRight size={15} aria-hidden="true" />
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
