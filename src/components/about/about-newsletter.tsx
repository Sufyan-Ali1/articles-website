import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import styles from "./about.module.css";

export function AboutNewsletter() {
  return (
    <section
      className={styles.newsletter}
      aria-labelledby="about-newsletter-title"
    >
      <span
        className={`${styles.iconCircle} ${styles.newsletterIcon}`}
        data-tone="violet"
        aria-hidden="true"
      >
        <Mail size={34} strokeWidth={1.7} />
      </span>
      <div className={styles.newsletterCopy}>
        <p className={styles.eyebrow}>Stay updated</p>
        <h2 id="about-newsletter-title">
          Practical reads, coming to your inbox.
        </h2>
        <p>
          Our newsletter is coming soon. In the meantime, explore the latest
          articles on the site.
        </p>
      </div>
      <NewsletterForm label="About page newsletter signup" />
    </section>
  );
}
