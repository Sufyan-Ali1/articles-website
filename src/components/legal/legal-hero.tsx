import Image from "next/image";
import type { LegalPageConfig } from "./legal-types";
import styles from "./legal.module.css";

export function LegalHero({
  id,
  eyebrow,
  title,
  heroTitle,
  description,
  image,
}: Pick<
  LegalPageConfig,
  "id" | "eyebrow" | "title" | "heroTitle" | "description" | "image"
>) {
  return (
    <section className={styles.hero} aria-labelledby={`${id}-title`}>
      <div className={`${styles.shell} ${styles.heroInner}`}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id={`${id}-title`}>{heroTitle || title}</h1>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.heroArt}>
          <Image
            src={image.src}
            alt={image.alt}
            width={1920}
            height={1080}
            sizes="(max-width: 760px) 100vw, 48vw"
            preload
          />
        </div>
      </div>
    </section>
  );
}
