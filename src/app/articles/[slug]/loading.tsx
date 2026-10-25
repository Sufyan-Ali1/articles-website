import { ReaderSkeleton } from "@/components/articles/reader-skeleton";
import styles from "@/components/articles/reading-layout.module.css";

export default function Loading() {
  return (
    <div className={`container ${styles.page}`}>
      <ReaderSkeleton />
    </div>
  );
}
