import { Suspense } from "react";
import { CategoriesHeading } from "@/components/categories/categories-heading";
import {
  CategoriesContent,
  CategoriesSkeleton,
} from "@/components/categories/categories-content";
import { pageStructuredData } from "@/lib/seo/structured-data";
import { metadata, safeJsonLd } from "@/lib/seo/metadata";
import { pageSeo } from "@/lib/content/site-copy";
import styles from "@/components/categories/categories.module.css";

export const generateMetadata = () =>
  metadata(
    pageSeo.categories.title,
    pageSeo.categories.description,
    "/categories",
  );

export default function Categories() {
  return (
    <div className={styles.page} data-categories-page>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            pageStructuredData(
              "/categories",
              pageSeo.categories.title,
              "CollectionPage",
            ),
          ),
        }}
      />
      <div className={styles.shell}>
        <CategoriesHeading />
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesContent />
        </Suspense>
      </div>
    </div>
  );
}
