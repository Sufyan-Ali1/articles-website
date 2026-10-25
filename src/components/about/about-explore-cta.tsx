import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AboutImage } from "./about-image";
import styles from "./about.module.css";

export function AboutExploreCta() {
  return (
    <section className={styles.explore} aria-labelledby="about-explore-title">
      <div className={styles.exploreCopy}>
        <p className={styles.eyebrow}>Ready to explore?</p>
        <h2 id="about-explore-title">Explore Our Articles</h2>
        <p>
          Have a decision to make or a problem to solve? Browse our guides,
          comparisons, and how-to articles to find a useful starting point.
        </p>
        <Link href="/articles" className={styles.primaryButton}>
          Browse the Articles <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <div className={styles.exploreVisual}>
        <AboutImage
          name="explore"
          alt="A traveler looking across a mountain lake at sunrise."
          sizes="(max-width: 760px) 100vw, 52vw"
        />
      </div>
    </section>
  );
}
