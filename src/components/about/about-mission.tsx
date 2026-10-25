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
          Make complex choices easier to understand.
        </h2>
        <p>
          Our goal is to make useful information easier to act on. We focus on
          the questions behind a purchase, a new device, or an everyday task,
          with explanations that help you weigh your options and take the next
          step with confidence.
        </p>
      </div>
    </section>
  );
}
