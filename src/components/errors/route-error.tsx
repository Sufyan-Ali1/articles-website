"use client";

import Link from "next/link";
import { ArrowUpRight, House, RefreshCw, WifiOff } from "lucide-react";
import styles from "./system-state.module.css";

export function RouteError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.errorPage} data-system-error>
      <div className={styles.shell}>
        <section
          className={styles.errorCard}
          aria-labelledby="route-error-title"
        >
          <div className={styles.errorArt} aria-hidden="true">
            <span className={styles.errorRing}>
              <WifiOff size={47} strokeWidth={1.4} />
            </span>
            <span className={styles.artDot} />
          </div>
          <p className={styles.eyebrow}>A brief interruption</p>
          <h1 id="route-error-title">This page couldn’t load.</h1>
          <p className={styles.description}>
            We couldn’t load this page right now. Try again, browse the article
            library, or return to the homepage.
          </p>
          <div className={styles.actions}>
            <button type="button" onClick={onRetry} className={styles.primary}>
              <RefreshCw size={17} aria-hidden="true" />
              Try again
            </button>
            <Link href="/articles" className={styles.secondary}>
              Explore articles
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <Link href="/" className={styles.homeLink}>
            <House size={15} aria-hidden="true" />
            Back to homepage
          </Link>
          <p className={styles.help}>
            Still having trouble? <Link href="/contact">Get in touch</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
