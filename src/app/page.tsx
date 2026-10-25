import { Suspense } from "react";
import { metadata } from "@/lib/seo/metadata";
import { pageSeo } from "@/lib/content/site-copy";
import { HomeContent } from "@/components/home/home-content";
import { GridSkeleton } from "@/components/shared/states";
import styles from "@/components/home/home.module.css";

export const generateMetadata = () =>
  metadata(pageSeo.home.title, pageSeo.home.description, "/");

export default function Home() {
  return (
    <div className={styles.home} data-homepage>
      <Suspense
        fallback={
          <div className={`${styles.shell} ${styles.loading}`}>
            <GridSkeleton />
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </div>
  );
}
