import Image from "next/image";
import styles from "./contact.module.css";

export function ContactHero() {
  return (
    <section className={styles.hero} aria-labelledby="contact-title">
      <div className={`${styles.shell} ${styles.heroInner}`}>
        <div>
          <p className={styles.eyebrow}>Get in touch</p>
          <h1 id="contact-title">Contact Us</h1>
          <p className={styles.heroDescription}>
            Have a question about Ask &amp; Explore, spotted a detail we should
            check, or want to share an idea? Send us a message with the context
            we need to understand your enquiry.
          </p>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="/images/contact/hero.webp"
            alt="An Ask & Explore laptop, coffee, and a notebook in a bright workspace with green plants."
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
