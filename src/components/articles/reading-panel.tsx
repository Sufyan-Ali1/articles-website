import type { ReactNode } from "react";
import { List } from "lucide-react";
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
  const title = side === "contents" ? "In this article" : "Related articles";

  return (
    <aside className={styles.panel} data-side={side} aria-label={title}>
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
        <div
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
