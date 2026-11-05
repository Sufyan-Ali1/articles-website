import { AboutImage } from "./about-image";
import styles from "./about.module.css";

export function AboutHero() {
  return (
    <section className={styles.hero} aria-labelledby="about-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>About Ask &amp; Explore</p>
        <h1 id="about-title">
          About Ask &amp; Explore: Practical Guides for Everyday Life
        </h1>
        <p className={styles.heroDescription}>
          Ask &amp; Explore is an online publication offering clear
          explanations, practical how-to guides, and useful comparisons for
          everyday decisions. From technology and car buying to digital safety,
          lifestyle, travel, and product research, we help you understand your
          options and find information that matters to you.
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
