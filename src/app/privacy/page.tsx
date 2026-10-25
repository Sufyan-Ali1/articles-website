import { LegalPage } from "@/components/legal/legal-page";
import { privacyPage } from "@/components/legal/privacy-content";
import { metadata } from "@/lib/seo/metadata";
import { pageSeo } from "@/lib/content/site-copy";

export const generateMetadata = () =>
  metadata(pageSeo.privacy.title, pageSeo.privacy.description, "/privacy");

export default function Privacy() {
  return <LegalPage config={privacyPage} />;
}
