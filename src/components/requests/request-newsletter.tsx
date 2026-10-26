import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import styles from "./request.module.css";

export function RequestNewsletter() {
  return (
    <section
      className={styles.newsletter}
      aria-labelledby="request-newsletter-title"
    >
      <span className={styles.newsletterIcon} aria-hidden="true">
        <Mail size={29} strokeWidth={1.7} />
      </span>
      <div className={styles.newsletterCopy}>
        <p className={styles.eyebrow}>Stay curious</p>
        <h2 id="request-newsletter-title">Useful guides. Stay in the loop.</h2>
      </div>
      <NewsletterForm label="Article request newsletter signup" />
    </section>
  );
}
