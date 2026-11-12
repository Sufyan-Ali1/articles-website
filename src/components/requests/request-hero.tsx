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
          <p className={styles.eyebrow}>Suggest a topic</p>
          <h1 id="request-title">
            Request an Article
            <span className={styles.heroAccent} aria-hidden="true" />
          </h1>
          <p className={styles.heroDescription}>
            Have a question you&apos;d like Ask &amp; Explore to cover? Suggest
            a topic for a practical guide, product comparison, or clear
            explanation. Tell us what you&apos;d like to learn using the form
            below.
          </p>
        </div>
      </div>
    </section>
  );
}
