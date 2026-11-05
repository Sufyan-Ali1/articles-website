import Image from "next/image";
import styles from "./archive.module.css";

export function ArchiveHero({
  eyebrow = "All articles",
  title = "Explore Our Articles",
  description = "Browse how-to guides, product comparisons, and buying guides from Ask & Explore. Explore technology tips, car advice, and everyday solutions by topic or article type.",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className={styles.hero} aria-labelledby="archive-title">
      <div className={`${styles.shell} ${styles.heroInner}`}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="archive-title">{title}</h1>
          <p className={styles.heroDescription}>{description}</p>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="/images/about/workspace.webp"
            alt="A sunlit workspace with a laptop, coffee, and books overlooking the mountains."
            width={1920}
            height={1080}
            sizes="(max-width: 760px) 100vw, 45vw"
            preload
          />
        </div>
      </div>
    </section>
  );
}
