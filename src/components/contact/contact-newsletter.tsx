import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import styles from "./contact.module.css";

export function ContactNewsletter() {
  return (
    <section
      className={styles.newsletter}
      aria-labelledby="contact-newsletter-title"
    >
      <span className={styles.newsletterIcon} aria-hidden="true">
        <Mail size={36} strokeWidth={1.7} />
      </span>
      <div className={styles.newsletterCopy}>
        <p className={styles.eyebrow}>Stay connected</p>
        <h2 id="contact-newsletter-title">Stay connected with new reads.</h2>
        <p>
          Leave your email for future practical guides and new article updates.
        </p>
      </div>
      <NewsletterForm label="Contact page newsletter signup" />
    </section>
  );
}
