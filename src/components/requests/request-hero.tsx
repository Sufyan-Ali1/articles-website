import Image from "next/image";
import styles from "./request.module.css";

export function RequestHero() {
  return (
    <section
      className={styles.hero}
      aria-labelledby="request-title"
      data-request-hero
    >
      <div className={styles.heroBackground} aria-hidden="true">
        <Image
          src="/images/request-article/hero-background.webp"
          alt=""
          width={1920}
          height={1080}
          sizes="100vw"
          preload
        />
      </div>
      <div className={`${styles.shell} ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Request a topic</p>
          <h1 id="request-title">
            Request an Article
            <span className={styles.heroAccent} aria-hidden="true" />
          </h1>
          <p className={styles.heroDescription}>
            What would you like a clear answer to? Suggest a how-to guide,
            product comparison, or everyday question for a future Ask &amp;
            Explore article.
          </p>
        </div>
      </div>
    </section>
  );
}
