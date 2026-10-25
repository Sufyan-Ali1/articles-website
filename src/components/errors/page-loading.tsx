import { LoaderCircle } from "lucide-react";
import styles from "./system-state.module.css";

export function PageLoading() {
  return (
    <div
      className={styles.loadingPage}
      role="status"
      aria-label="Loading page"
      aria-busy="true"
      data-system-loading
    >
      <span className="sr-only">Loading your next discovery. Please wait.</span>
      <div className={styles.loadingHero} aria-hidden="true">
        <div className={`${styles.shell} ${styles.loadingHeroInner}`}>
          <div className={styles.loadingCopy}>
            <div className={`${styles.placeholder} ${styles.loadingEyebrow}`} />
            <div className={`${styles.placeholder} ${styles.loadingTitle}`} />
            <div
              className={`${styles.placeholder} ${styles.loadingTitleShort}`}
            />
            <div className={`${styles.placeholder} ${styles.loadingText}`} />
            <div
              className={`${styles.placeholder} ${styles.loadingTextShort}`}
            />
          </div>
          <div className={`${styles.placeholder} ${styles.loadingImage}`} />
        </div>
      </div>
      <div
        className={`${styles.shell} ${styles.loadingContent}`}
        aria-hidden="true"
      >
        <div className={styles.loadingStatus}>
          <LoaderCircle size={17} />
          Loading your next discovery…
        </div>
        <div className={styles.loadingCards}>
          {Array.from({ length: 3 }, (_, index) => (
            <div className={styles.loadingCard} key={index}>
              <div className={`${styles.placeholder} ${styles.loadingImage}`} />
              <div className={styles.loadingCardCopy}>
                <div
                  className={`${styles.placeholder} ${styles.loadingEyebrow}`}
                />
                <div
                  className={`${styles.placeholder} ${styles.loadingCardTitle}`}
                />
                <div
                  className={`${styles.placeholder} ${styles.loadingText}`}
                />
                <div
                  className={`${styles.placeholder} ${styles.loadingTextShort}`}
                />
                <div
                  className={`${styles.placeholder} ${styles.loadingMeta}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
