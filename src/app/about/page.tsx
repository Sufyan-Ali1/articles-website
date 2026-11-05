import { Suspense } from "react";
import { AboutHero } from "@/components/about/about-hero";
import { AboutIntroduction } from "@/components/about/about-introduction";
import {
  AboutTopics,
  AboutTopicsFallback,
} from "@/components/about/about-topics";
import { AboutMission } from "@/components/about/about-mission";
import { EditorialPrinciples } from "@/components/about/editorial-principles";
import { AboutExploreCta } from "@/components/about/about-explore-cta";
import { AboutNewsletter } from "@/components/about/about-newsletter";
import { pageStructuredData } from "@/lib/seo/structured-data";
import { metadata, safeJsonLd } from "@/lib/seo/metadata";
import { pageSeo } from "@/lib/content/site-copy";
import styles from "@/components/about/about.module.css";

export const generateMetadata = () => ({
  ...metadata(pageSeo.about.title, pageSeo.about.description, "/about"),
  title: { absolute: pageSeo.about.title },
});

export default function About() {
  return (
    <div className={styles.page} data-about-page>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            pageStructuredData("/about", pageSeo.about.title, "AboutPage"),
          ),
        }}
      />
      <div className={styles.shell}>
        <AboutHero />
        <AboutIntroduction />
        <Suspense fallback={<AboutTopicsFallback />}>
          <AboutTopics />
        </Suspense>
        <AboutMission />
        <EditorialPrinciples />
        <AboutExploreCta />
        <AboutNewsletter />
      </div>
    </div>
  );
}
