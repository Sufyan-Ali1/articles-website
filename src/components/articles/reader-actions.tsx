"use client";

import { useState, useSyncExternalStore } from "react";
import { Bookmark, Printer } from "lucide-react";
import { ShareActions } from "./reading-tools";
import styles from "./reading-layout.module.css";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("reader-saved", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("reader-saved", onChange);
  };
}

export function ReaderActions({
  title,
  slug,
  placement = "header",
}: {
  title: string;
  slug: string;
  placement?: "header" | "sidebar";
}) {
  const key = `ask-explore:saved:${slug}`;
  const [message, setMessage] = useState("");
  const saved = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key) === "true";
      } catch {
        return false;
      }
    },
    () => false,
  );
  function toggleSaved() {
    try {
      if (saved) localStorage.removeItem(key);
      else localStorage.setItem(key, "true");
      setMessage(
        saved
          ? "Removed from saved articles."
          : "Article saved in this browser.",
      );
      window.dispatchEvent(new Event("reader-saved"));
    } catch {
      setMessage("Saving is unavailable in this browser.");
    }
  }
  return (
    <div
      className={
        placement === "header" ? styles.headerActions : styles.sidebarActions
      }
    >
      <div className={styles.actionRow}>
        <button
          type="button"
          onClick={toggleSaved}
          aria-pressed={saved}
          aria-label={saved ? "Unsave article" : "Save article"}
          title={saved ? "Unsave article" : "Save article"}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
          <span>{saved ? "Saved" : "Save"}</span>
        </button>
        <ShareActions title={title} />
        {placement === "sidebar" && (
          <button type="button" onClick={() => window.print()}>
            <Printer size={17} />
            <span>Print</span>
          </button>
        )}
      </div>
      <span className="sr-only" role="status">
        {message}
      </span>
    </div>
  );
}

export function NewsletterSignup() {
  return (
    <section className={styles.newsletter} aria-labelledby="newsletter-heading">
      <div className={styles.newsletterCopy}>
        <div className={styles.newsletterIntro}>
          <span className={styles.mailIcon} aria-hidden="true">
            <svg
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="m3 5 9 8 9-8" />
            </svg>
          </span>
          <div>
            <p className={styles.newsletterEyebrow}>Stay in the loop</p>
            <h2 id="newsletter-heading">Useful reads in your inbox</h2>
          </div>
        </div>
        <p>A newsletter for practical guides is on the way.</p>
        <form className={styles.newsletterForm} aria-label="Newsletter signup">
          <div className={styles.newsletterFields}>
            <input
              type="email"
              aria-label="Your email address"
              placeholder="Your email address"
              disabled
            />
            <button type="submit" disabled>
              Subscribe
            </button>
          </div>
        </form>
        <p className={styles.newsletterNotice}>
          Coming soon. This form is not accepting subscriptions yet.
        </p>
      </div>
    </section>
  );
}
