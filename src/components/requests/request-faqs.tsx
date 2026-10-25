import Link from "next/link";
import styles from "./request.module.css";

const faqs = [
  {
    question: "What can I request?",
    answer: (
      <>
        Request a guide, comparison, or explanation related to the{" "}
        <Link href="/categories">topics we cover</Link>. A specific question
        helps us understand the answer you are looking for.
      </>
    ),
  },
  {
    question: "Will my idea be published?",
    answer: (
      <>
        We consider suggestions as part of editorial planning. Sending a topic
        does not guarantee an article, a publication date, or a personal reply.
      </>
    ),
  },
  {
    question: "Do I need to add my email?",
    answer: (
      <>
        No. You can submit a topic without a name or email. Add contact details
        only if you want us to have a way to follow up.
      </>
    ),
  },
];

export function RequestFaqs() {
  return (
    <section className={styles.faqs} aria-labelledby="request-faq-title">
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
