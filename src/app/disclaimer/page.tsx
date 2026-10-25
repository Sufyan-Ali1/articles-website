import { LegalPage } from "@/components/legal/legal-page";
import { disclaimerPage } from "@/components/legal/disclaimer-content";
import { metadata } from "@/lib/seo/metadata";
import { pageSeo } from "@/lib/content/site-copy";

export const generateMetadata = () =>
  metadata(
    pageSeo.disclaimer.title,
    pageSeo.disclaimer.description,
    "/disclaimer",
  );

export default function Disclaimer() {
  return <LegalPage config={disclaimerPage} />;
}
