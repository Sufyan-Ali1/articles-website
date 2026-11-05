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
        <p className={styles.eyebrow}>Stay connected</p>
        <h2 id="about-newsletter-title">
          Stay in Touch With Ask &amp; Explore
        </h2>
        <p>
          Interested in new guides and article updates? Subscribe to receive
          practical reads from Ask &amp; Explore in your inbox.
        </p>
      </div>
      <NewsletterForm label="About page newsletter signup" />
    </section>
  );
}
