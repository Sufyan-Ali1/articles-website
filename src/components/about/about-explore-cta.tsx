import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AboutImage } from "./about-image";
import styles from "./about.module.css";

export function AboutExploreCta() {
  return (
    <section className={styles.explore} aria-labelledby="about-explore-title">
      <div className={styles.exploreCopy}>
        <p className={styles.eyebrow}>Ready to explore?</p>
        <h2 id="about-explore-title">
          Find Practical Guides for Your Next Question
        </h2>
        <p>
          Need help choosing a product, understanding technology, comparing car
          costs, or staying safer online? Browse our published articles and find
          explanations, comparisons, and practical guidance that fit your
          question.
        </p>
        <Link href="/articles" className={styles.primaryButton}>
          Explore All Articles <ArrowRight size={18} aria-hidden="true" />
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
