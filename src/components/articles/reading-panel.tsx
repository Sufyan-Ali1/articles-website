"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
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
  const panel = useRef<HTMLElement>(null);
  const contentId = useId();
  const title = side === "contents" ? "In this article" : "Related articles";
  const Icon = side === "contents" ? List : BookOpen;

  useEffect(() => {
    const node = panel.current;
    if (!node || side === "contents") return;
    const measure = () => {
      const top = parseFloat(getComputedStyle(node).top) || 0;
      node.dataset.tall = String(
        node.offsetHeight > window.innerHeight - top - 24,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [side]);

  return (
    <aside
      ref={panel}
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
