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
        <h2 id="contact-newsletter-title">More useful reads, coming soon.</h2>
        <p>
          We’re preparing a newsletter for practical guides and new articles.
          Signup is not available yet.
        </p>
      </div>
      <NewsletterForm label="Contact page newsletter signup" />
    </section>
  );
}
