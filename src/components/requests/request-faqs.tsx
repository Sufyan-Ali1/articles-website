import Link from "next/link";
import styles from "./request.module.css";

const faqs = [
  {
    question: "What can I request?",
    answer: (
      <>
        You can suggest a practical guide, explanation, buying guide, or
        comparison related to the{" "}
        <Link href="/categories">topics we cover</Link>. If we&apos;ve already
        published something similar, you can tell us what you&apos;d like
        explained in more detail.
      </>
    ),
  },
  {
    question: "Will my idea be published?",
    answer: (
      <>
        Not necessarily. Suggestions may inform future article planning, but
        submitting an idea doesn&apos;t guarantee publication, a specific
        publication date, or a personal reply.
      </>
    ),
  },
  {
    question: "Do I need to add my email?",
    answer: (
      <>
        No. Your name and email address are optional. If you provide an email
        address, we may use it to follow up about your idea, but a reply
        isn&apos;t guaranteed.
      </>
    ),
  },
];

export function RequestFaqs() {
  return (
    <section
      id="quick-answers"
      className={styles.faqs}
      aria-labelledby="request-faq-title"
    >
      <h2 id="request-faq-title">Quick Answers</h2>
      <div className={styles.faqGrid}>
        {faqs.map(({ question, answer }) => (
          <article key={question}>
            <h3>{question}</h3>
            <p>{answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
