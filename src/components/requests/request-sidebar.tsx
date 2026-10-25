import Link from "next/link";
import { ArrowUpRight, Check, Lightbulb } from "lucide-react";
import { HowItWorks } from "./how-it-works";
import styles from "./request.module.css";

export function RequestSidebar() {
  return (
    <div className={styles.sidebar} data-request-sidebar>
      <HowItWorks />
      <section className={styles.ideaTip} aria-labelledby="request-tip-title">
        <div className={styles.ideaTipHeading}>
          <span className={styles.ideaTipIcon} aria-hidden="true">
            <Lightbulb size={23} strokeWidth={1.7} />
          </span>
          <h2 id="request-tip-title">Make your idea count</h2>
        </div>
        <div className={styles.ideaTipBody}>
          <p>
            A specific question is easier to understand. Add the details that
            would make the answer useful to you.
          </p>
          <ul className={styles.ideaTipList}>
            <li>
              <Check size={16} aria-hidden="true" />
              <div>
                <h3>Name the topic</h3>
                <p>
                  Name the product or task, including a model or version when it
                  matters. A focused question gives us a clearer starting point.
                </p>
              </div>
            </li>
            <li>
              <Check size={16} aria-hidden="true" />
              <div>
                <h3>Add your context</h3>
                <p>
                  Explain what you want to achieve, what you have already tried,
                  and the point where you need help.
                </p>
              </div>
            </li>
            <li>
              <Check size={16} aria-hidden="true" />
              <div>
                <h3>Share what would help</h3>
                <p>
                  Would a side-by-side comparison, a worked example, or a
                  step-by-step guide help? Tell us what you want to learn.
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
