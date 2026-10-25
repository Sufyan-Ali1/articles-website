import styles from "./request.module.css";

const steps = [
  {
    title: "Share your idea",
    description:
      "Tell us the question, product, or task you want a guide to cover.",
  },
  {
    title: "We consider it",
    description:
      "Suggestions help us understand reader needs and plan relevant coverage.",
  },
  {
    title: "It may become a story",
    description:
      "A suitable idea may become an article. Publication and a reply are not guaranteed.",
  },
];

export function HowItWorks() {
  return (
    <aside className={styles.howItWorks} aria-labelledby="request-how-title">
      <p className={styles.eyebrow}>From question to clarity</p>
      <h2 id="request-how-title">How It Works</h2>
      <ol>
        {steps.map(({ title, description }, index) => (
          <li key={title}>
            <span className={styles.stepNumber} aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
