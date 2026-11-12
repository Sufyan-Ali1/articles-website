import Link from "next/link";
import { FileText, MessageCircle, UsersRound } from "lucide-react";
import styles from "./contact.module.css";

const faqs = [
  {
    icon: MessageCircle,
    title: "Can I suggest a topic?",
    text: (
      <>
        Yes. Use our <Link href="/request-article">Request an Article</Link>{" "}
        page to suggest a question, how-to guide, or product comparison
        you&apos;d like us to cover.
      </>
    ),
  },
  {
    icon: FileText,
    title: "How do I suggest a correction?",
    text: (
      <>
        Select “Suggest a correction” in the contact form. Include the article
        link, the information you&apos;d like us to check, and a supporting
        source if you have one.
      </>
    ),
  },
  {
    icon: UsersRound,
    title: "Can we work together?",
    text: (
      <>
        You can send a collaboration, guest article, or press proposal through
        the form. Choose “General question” and briefly explain your idea and
        its relevance to Ask &amp; Explore readers. Sending a proposal
        doesn&apos;t guarantee collaboration.
      </>
    ),
  },
];

export function ContactFaqs() {
  return (
    <section
      id="frequently-asked-questions"
      className={styles.faqs}
      aria-labelledby="contact-faq-title"
    >
      <div className={styles.faqHeading}>
        <p className={styles.eyebrow}>Frequently asked questions</p>
        <h2 id="contact-faq-title">Common Contact Questions</h2>
        <p className={styles.sectionDescription}>
          Find out how to suggest an article topic, report a correction, or send
          a collaboration proposal.
        </p>
      </div>
      <div className={styles.faqGrid}>
        {faqs.map(({ icon: Icon, title, text }, index) => (
          <article
            id={`faq-question-${index + 1}`}
            className={styles.faqCard}
            key={title}
          >
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
