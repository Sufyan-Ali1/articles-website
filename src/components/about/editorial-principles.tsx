import Link from "next/link";
import { FileText, Heart, ShieldCheck, ArrowUpRight } from "lucide-react";
import styles from "./about.module.css";

const principles = [
  {
    icon: ShieldCheck,
    title: "Accuracy First",
    text: "Our aim is to use credible sources, check important details, and make the limits of an article clear.",
    tone: "blue",
  },
  {
    icon: FileText,
    title: "Clear & Practical",
    text: "Useful explanations begin with the question, define unfamiliar terms, and make the next step clear.",
    tone: "violet",
  },
  {
    icon: Heart,
    title: "Honest & Helpful",
    text: "A recommendation needs context. We value clear tradeoffs and openness about evidence and commercial links.",
    tone: "rose",
  },
];

export function EditorialPrinciples() {
  return (
    <section
      className={styles.principles}
      aria-labelledby="about-principles-title"
    >
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>Editorial principles</p>
          <h2 id="about-principles-title">
            Useful information starts with clear standards.
          </h2>
          <p>
            These principles describe the editorial approach we aim to follow.
          </p>
        </div>
      </div>
      <div className={styles.principleGrid}>
        {principles.map(({ icon: Icon, title, text, tone }) => (
          <article className={styles.principle} key={title}>
            <span
              className={styles.iconCircle}
              data-tone={tone}
              aria-hidden="true"
            >
              <Icon size={32} strokeWidth={1.7} />
            </span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
      <Link className={styles.disclosureLink} href="/disclaimer">
        Read our editorial disclosures{" "}
        <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
    </section>
  );
}
