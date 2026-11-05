import Link from "next/link";
import { FileText, Heart, ShieldCheck, ArrowUpRight } from "lucide-react";
import styles from "./about.module.css";

const principles = [
  {
    icon: ShieldCheck,
    title: "Accuracy First",
    text: "We aim to use credible, relevant sources, check important details, and explain uncertainty or limitations when they affect an article's conclusions.",
    tone: "blue",
  },
  {
    icon: FileText,
    title: "Clear & Practical",
    text: "We focus on straightforward explanations, understandable comparisons, and useful steps without unnecessary technical language.",
    tone: "violet",
  },
  {
    icon: Heart,
    title: "Honest & Helpful",
    text: "Recommendations need context. We aim to distinguish research from hands-on experience, explain important trade-offs, and be transparent about relevant commercial relationships.",
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
            How We Approach Accuracy, Clarity, and Transparency
          </h2>
          <p>
            Helpful content should explain more than an answer. It should give
            you enough context to understand where the information comes from,
            what it means, and what may change.
          </p>
          <p>
            The following principles describe the editorial standards we aim to
            follow.
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
        Read Our Editorial &amp; Affiliate Disclosures{" "}
        <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
    </section>
  );
}
