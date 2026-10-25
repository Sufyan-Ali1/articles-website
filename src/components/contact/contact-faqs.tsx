import Link from "next/link";
import { FileText, MessageCircle, UsersRound } from "lucide-react";
import styles from "./contact.module.css";

const faqs = [
  {
    icon: MessageCircle,
    title: "Can I suggest a topic?",
    text: (
      <>
        Yes. Use the <Link href="/request-article">article request form</Link>{" "}
        to suggest a question, a how-to guide, or a comparison you would find
        useful.
      </>
    ),
  },
  {
    icon: FileText,
    title: "How do I suggest a correction?",
    text: (
      <>
        Choose “Suggest a correction” in the message form, add the article link,
        and tell us which details you believe should change.
      </>
    ),
  },
  {
    icon: UsersRound,
    title: "Can we work together?",
    text: (
      <>
        Use the form above for a collaboration, guest article, or press enquiry.
        Explain the proposal and why it would be useful to our readers.
      </>
    ),
  },
];

export function ContactFaqs() {
  return (
    <section className={styles.faqs} aria-labelledby="contact-faq-title">
      <div className={styles.faqHeading}>
        <p className={styles.eyebrow}>Frequent questions</p>
        <h2 id="contact-faq-title">Need a Quick Answer?</h2>
        <p className={styles.sectionDescription}>
          Find out how to suggest a topic, report an article correction, or send
          a collaboration enquiry.
        </p>
      </div>
      <div className={styles.faqGrid}>
        {faqs.map(({ icon: Icon, title, text }) => (
          <article className={styles.faqCard} key={title}>
            <span className={styles.methodIcon} aria-hidden="true">
              <Icon size={27} strokeWidth={1.7} />
            </span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
