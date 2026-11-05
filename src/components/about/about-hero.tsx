import { AboutImage } from "./about-image";
import styles from "./about.module.css";

export function AboutHero() {
  return (
    <section className={styles.hero} aria-labelledby="about-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>About Ask &amp; Explore</p>
        <h1 id="about-title">About Ask &amp; Explore</h1>
        <p className={styles.heroDescription}>
          Learn about Ask &amp; Explore and our editorial approach to clear
          answers for everyday decisions. Explore technology guides, car buying
          advice, product comparisons, and practical answers to everyday
          questions.
        </p>
      </div>
      <AboutImage
        name="workspace"
        alt="A sunlit workspace with a laptop, books, and coffee overlooking the mountains."
        preload
      />
    </section>
  );
}
