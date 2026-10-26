import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import styles from "./archive.module.css";

export function ArchiveNewsletter() {
  return (
    <section
      className={styles.newsletter}
      aria-labelledby="archive-newsletter-title"
    >
      <span className={styles.newsletterIcon} aria-hidden="true">
        <Mail size={33} strokeWidth={1.7} />
      </span>
      <div className={styles.newsletterCopy}>
        <p className={styles.eyebrow}>Stay in the loop</p>
        <h2 id="archive-newsletter-title">Keep up with useful guides.</h2>
        <p>
          Save your email for future article updates, and explore the library
          for your next guide today.
        </p>
      </div>
      <NewsletterForm label="Articles newsletter signup" />
    </section>
  );
}
