"use client";

import { useId, useState, type ReactNode } from "react";
import { BookOpen, ChevronDown, List } from "lucide-react";
import styles from "./reading-layout.module.css";

export function ReadingPanel({
  side,
  children,
  action,
  extra,
}: {
  side: "contents" | "related";
  children: ReactNode;
  action?: ReactNode;
  extra?: ReactNode;
}) {
  const [compactOpen, setCompactOpen] = useState(false);
  const contentId = useId();
  const title = side === "contents" ? "In this article" : "Related articles";
  const Icon = side === "contents" ? List : BookOpen;

  return (
    <aside
      className={styles.panel}
      data-side={side}
      data-compact-open={compactOpen}
      aria-label={title}
    >
      <div className={styles.panelSurface}>
        <div className={styles.panelHeading}>
          <h2 className={styles.panelTitle}>
            {side === "contents" ? (
              <>
                <List size={16} />
                <span>On this page</span>
              </>
            ) : (
              "Related Articles"
            )}
          </h2>
          {action}
        </div>
        <button
          type="button"
          className={styles.compactToggle}
          aria-expanded={compactOpen}
          aria-controls={contentId}
          onClick={() => setCompactOpen(!compactOpen)}
        >
          <span>
            <Icon size={17} />
            {title}
          </span>
          <ChevronDown size={17} />
        </button>
        <div
          id={contentId}
          className={styles.panelContent}
          data-reader-scroll={side === "contents" ? "" : undefined}
        >
          {children}
        </div>
      </div>
      {extra && <div className={styles.panelExtra}>{extra}</div>}
    </aside>
  );
}
