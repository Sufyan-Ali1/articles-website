import Link from "next/link";
import {
  ChevronRight,
  FileText,
  House,
  LayoutGrid,
  Search,
} from "lucide-react";
import styles from "./not-found.module.css";

const destinations = [
  {
    title: "Go to Homepage",
    description: "Return to the homepage and choose where to start.",
    href: "/",
    icon: House,
    tone: "blue",
  },
  {
    title: "Browse Articles",
    description: "Browse published guides, reviews, and comparisons.",
    href: "/articles",
    icon: FileText,
    tone: "green",
  },
  {
    title: "Explore Categories",
    description: "Explore technology, cars, and everyday-life topics.",
    href: "/categories",
    icon: LayoutGrid,
    tone: "purple",
  },
  {
    title: "Search Content",
    description: "Search article titles for a product or topic.",
    href: "/search",
    icon: Search,
    tone: "pink",
  },
];

export function RecoveryLinks() {
  return (
    <section
      className={`${styles.shell} ${styles.recovery}`}
      aria-labelledby="recovery-title"
    >
      <h2 id="recovery-title">What would you like to do?</h2>
      <div className={styles.cards}>
        {destinations.map(({ title, description, href, icon: Icon, tone }) => (
          <Link key={href} href={href} className={styles.card}>
            <span className={styles.cardIcon} data-tone={tone}>
              <Icon size={28} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className={styles.cardCopy}>
              <span className={styles.cardTitle}>{title}</span>
              <span className={styles.cardDescription}>{description}</span>
            </span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
