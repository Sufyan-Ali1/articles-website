import { AboutImage } from "./about-image";
import styles from "./about.module.css";

export function AboutHero() {
  return (
    <section className={styles.hero} aria-labelledby="about-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>About Ask &amp; Explore</p>
        <h1 id="about-title">Clear answers for everyday decisions.</h1>
        <p className={styles.heroDescription}>
          Ask &amp; Explore helps you understand the choices in front of you.
          Explore technology guides, car buying advice, product comparisons, and
          practical answers to everyday questions.
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
