import type { Metadata } from "next";
import { Suspense } from "react";
import { metadata, safeJsonLd } from "@/lib/seo/metadata";
import {
  organizationStructuredData,
  websiteStructuredData,
} from "@/lib/seo/structured-data";
import { pageSeo } from "@/lib/content/site-copy";
import { HomeContent } from "@/components/home/home-content";
import { GridSkeleton } from "@/components/shared/states";
import styles from "@/components/home/home.module.css";

export const generateMetadata = (): Metadata => ({
  ...metadata(pageSeo.home.title, pageSeo.home.description, "/"),
  // All homepage URLs are absolute. Bypass root-URL slash normalization in
  // Next.js metadata resolution without changing trailing slashes site-wide.
  metadataBase: null,
  title: { absolute: pageSeo.home.title },
});

export default function Home() {
  return (
    <div className={styles.home} data-homepage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(websiteStructuredData()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(organizationStructuredData()),
        }}
      />
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
