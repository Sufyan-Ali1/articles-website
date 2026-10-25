import { LegalPage } from "@/components/legal/legal-page";
import { termsPage } from "@/components/legal/terms-content";
import { metadata } from "@/lib/seo/metadata";
import { pageSeo } from "@/lib/content/site-copy";

export const generateMetadata = () =>
  metadata(pageSeo.terms.title, pageSeo.terms.description, "/terms");

export default function Terms() {
  return <LegalPage config={termsPage} />;
}
