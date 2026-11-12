import styles from "./request.module.css";

const steps = [
  {
    title: "Share your idea",
    description:
      "Tell us which question, task, or comparison you'd like us to cover.",
  },
  {
    title: "Your idea may inform future articles",
    description:
      "Suggestions can help us understand what readers want to learn and inform future content planning.",
  },
  {
    title: "It may become an article",
    description:
      "A suitable topic may be covered in a future article. Publication dates and personal replies are not guaranteed.",
  },
];

export function HowItWorks() {
  return (
    <aside
      id="how-it-works"
      className={styles.howItWorks}
      aria-labelledby="request-how-title"
    >
      <p className={styles.eyebrow}>What happens next</p>
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
