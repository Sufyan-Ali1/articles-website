import { GridSkeleton } from "@/components/shared/states";
import { ReadingPanel } from "./reading-panel";
import { RelatedArticlesPanelSkeleton } from "./related-articles";
import styles from "./reading-layout.module.css";

export function ReaderSkeleton() {
  return (
    <div className={styles.layout} data-has-contents="true" data-reader-loading>
      <ReadingPanel side="contents">
        <div aria-hidden="true" className={styles.contentsPlaceholder}>
          {Array.from({ length: 8 }, (_, index) => (
            <span className={styles.textPlaceholder} key={index} />
          ))}
        </div>
      </ReadingPanel>
      <div className={styles.column} aria-busy="true">
        <GridSkeleton variant="article" />
      </div>
      <RelatedArticlesPanelSkeleton />
    </div>
  );
}
