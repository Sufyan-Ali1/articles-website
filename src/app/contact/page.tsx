import { Suspense } from "react";
import { ContactHero } from "@/components/contact/contact-hero";
import {
  ContactFormArea,
  ContactFormSkeleton,
} from "@/components/contact/contact-form-area";
import { ContactDetails } from "@/components/contact/contact-details";
import { ContactFaqs } from "@/components/contact/contact-faqs";
import { ContactNewsletter } from "@/components/contact/contact-newsletter";
import type { SearchParams } from "@/lib/utils/filters";
import { site } from "@/lib/config";
import { metadata } from "@/lib/seo/metadata";
import { pageSeo } from "@/lib/content/site-copy";
import styles from "@/components/contact/contact.module.css";

export const generateMetadata = () =>
  metadata(pageSeo.contact.title, pageSeo.contact.description, "/contact");

export default function Contact({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email) ? site.email : "";
  return (
    <div className={styles.page} data-contact-page>
      <ContactHero />
      <div className={styles.shell}>
        <div className={styles.layout}>
          <Suspense fallback={<ContactFormSkeleton />}>
            <ContactFormArea searchParams={searchParams} email={email} />
          </Suspense>
          <ContactDetails email={email} />
        </div>
        <ContactFaqs />
        <ContactNewsletter />
      </div>
    </div>
  );
}
