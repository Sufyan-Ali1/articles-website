import { AboutImage } from "./about-image";
import styles from "./about.module.css";

export function AboutMission() {
  return (
    <section className={styles.mission} aria-labelledby="about-mission-title">
      <AboutImage
        name="mission"
        alt="An Ask & Explore coffee mug beside a laptop and notebook in a welcoming workspace."
        sizes="(max-width: 760px) 100vw, 35vw"
      />
      <div>
        <p className={styles.eyebrow}>Our mission</p>
        <h2 id="about-mission-title">
          Make Useful Information Easier to Understand
        </h2>
        <p>
          Our mission is to help readers make sense of everyday questions
          without unnecessary complexity. We focus on explaining unfamiliar
          topics in simple language, showing meaningful differences between
          options, and providing guidance that is useful in real situations.
        </p>
        <p>
          Whether you&apos;re researching a purchase, learning about new
          technology, or looking for a practical solution, we want you to leave
          with a clearer understanding of what to consider next.
        </p>
      </div>
    </section>
  );
}
