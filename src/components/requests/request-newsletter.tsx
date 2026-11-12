import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import styles from "./request.module.css";

export function RequestNewsletter() {
  return (
    <section
      id="newsletter"
      className={styles.newsletter}
      aria-labelledby="request-newsletter-title"
    >
      <span className={styles.newsletterIcon} aria-hidden="true">
        <Mail size={29} strokeWidth={1.7} />
      </span>
      <div className={styles.newsletterCopy}>
        <p className={styles.eyebrow}>Stay curious</p>
        <h2 id="request-newsletter-title">Get Useful Guides in Your Inbox</h2>
      </div>
      <NewsletterForm
        label="Article request newsletter signup"
        helperText="Subscribe to receive new articles and practical guides by email. Newsletter signup is separate from submitting an article request."
      />
    </section>
  );
}
