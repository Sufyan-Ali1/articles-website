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
import { metadata } from "@/lib/seo/metadata";
import { pageSeo } from "@/lib/content/site-copy";
import styles from "@/components/about/about.module.css";

export const generateMetadata = () =>
  metadata(pageSeo.about.title, pageSeo.about.description, "/about");

export default function About() {
  return (
    <div className={styles.page} data-about-page>
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
