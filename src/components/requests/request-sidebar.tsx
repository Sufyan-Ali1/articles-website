import Link from "next/link";
import { ArrowUpRight, Check, Lightbulb } from "lucide-react";
import { HowItWorks } from "./how-it-works";
import styles from "./request.module.css";

export function RequestSidebar() {
  return (
    <div className={styles.sidebar} data-request-sidebar>
      <HowItWorks />
      <section
        id="submission-guidance"
        className={styles.ideaTip}
        aria-labelledby="request-tip-title"
      >
        <div className={styles.ideaTipHeading}>
          <span className={styles.ideaTipIcon} aria-hidden="true">
            <Lightbulb size={23} strokeWidth={1.7} />
          </span>
          <h2 id="request-tip-title">Make Your Idea Count</h2>
        </div>
        <div className={styles.ideaTipBody}>
          <p>
            A focused question is easier to explore. Share the details that
            would make the answer useful to you.
          </p>
          <ul className={styles.ideaTipList}>
            <li>
              <Check size={16} aria-hidden="true" />
              <div>
                <h3>Name the topic</h3>
                <p>
                  Tell us the product, task, or question. Include a model or
                  version if it matters.
                </p>
              </div>
            </li>
            <li>
              <Check size={16} aria-hidden="true" />
              <div>
                <h3>Add your context</h3>
                <p>
                  Explain what you&apos;re trying to do, what you&apos;ve
                  already tried, or where you need help.
                </p>
              </div>
            </li>
            <li>
              <Check size={16} aria-hidden="true" />
              <div>
                <h3>Share what would help</h3>
                <p>
                  Tell us if you&apos;d prefer a step-by-step guide, practical
                  example, or side-by-side comparison.
                </p>
              </div>
            </li>
          </ul>
        </div>
        <Link href="/articles">
          Explore existing articles
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
