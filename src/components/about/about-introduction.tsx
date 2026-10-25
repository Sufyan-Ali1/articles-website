import { FileText, ShieldCheck, UsersRound } from "lucide-react";
import styles from "./about.module.css";

const qualities = [
  {
    icon: ShieldCheck,
    title: "Context First",
    text: "Understand the options, the tradeoffs, and what a recommendation means for your needs.",
    tone: "blue",
  },
  {
    icon: FileText,
    title: "Practical",
    text: "Find explanations and useful next steps for the problems you want to solve.",
    tone: "violet",
  },
  {
    icon: UsersRound,
    title: "Reader-Focused",
    text: "Your questions shape our focus: useful information, clear language, and time well spent.",
    tone: "cyan",
  },
];

export function AboutIntroduction() {
  return (
    <section className={styles.introduction} aria-labelledby="about-who-title">
      <div className={styles.introductionCopy}>
        <p className={styles.eyebrow}>Who we are</p>
        <h2 id="about-who-title">
          A useful place to start your next question.
        </h2>
        <p>
          Buying something new or learning a new task often starts with the same
          question: where do I begin? Ask &amp; Explore brings guides,
          comparisons, and explainers together to help you understand the
          essentials and decide what to do next.
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
