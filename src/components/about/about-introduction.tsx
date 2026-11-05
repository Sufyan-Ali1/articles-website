import { Eye, FileText, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import styles from "./about.module.css";

const qualities = [
  {
    icon: ShieldCheck,
    title: "Context First",
    text: "Understand the features, costs, benefits, and limitations that matter before making a decision.",
    tone: "blue",
  },
  {
    icon: FileText,
    title: "Practical Guidance",
    text: "Find clear explanations and useful steps for the everyday questions and problems you want to solve.",
    tone: "violet",
  },
  {
    icon: UsersRound,
    title: "Reader-Focused",
    text: "Explore helpful information written around real questions, with straightforward language and your needs in mind.",
    tone: "cyan",
  },
  {
    icon: Eye,
    title: "Transparent Approach",
    text: "Understand the evidence behind a recommendation, its limitations, and any relevant commercial relationships.",
    tone: "green",
  },
];

export function AboutIntroduction() {
  return (
    <section className={styles.introduction} aria-labelledby="about-who-title">
      <div className={styles.introductionCopy}>
        <p className={styles.eyebrow}>Who we are</p>
        <h2 id="about-who-title">
          Helpful Information for the Questions You Ask Every Day
        </h2>
        <p>
          Choosing a laptop, comparing vehicle costs, planning a trip, or
          protecting an online account can involve a lot of information. Knowing
          where to start is often the hardest part.
        </p>
        <p>
          At Ask &amp; Explore, we bring together guides and explanations that
          focus on the details worth understanding. Our articles explore useful
          steps, important differences, and potential limitations so you can
          make decisions based on your own needs.
        </p>
        <p>
          From technology guides and product comparisons to automotive advice,
          digital safety tips, lifestyle improvements, and travel planning, we
          cover topics that matter in everyday life. Our practical how-to
          guides, buying guides, and informative articles help you explore
          options, understand complex topics, and make more informed decisions.
        </p>
        <p>
          You can also learn about the people and publishing approach behind our
          articles through our{" "}
          <Link href="/authors/editorial-team">
            Ask &amp; Explore Editorial Team profile
          </Link>
          .
        </p>
      </div>
      <div className={styles.qualityGrid}>
        {qualities.map(({ icon: Icon, title, text, tone }) => (
          <article className={styles.qualityCard} key={title}>
            <span
              className={styles.iconCircle}
              data-tone={tone}
              aria-hidden="true"
            >
              <Icon size={30} strokeWidth={1.7} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
