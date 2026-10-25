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
        <h2 id="archive-newsletter-title">
          Useful guides, coming to your inbox.
        </h2>
        <p>
          Our newsletter is coming soon. Find your next guide in the article
          library while we get it ready.
        </p>
      </div>
      <NewsletterForm label="Articles newsletter signup" />
    </section>
  );
}
