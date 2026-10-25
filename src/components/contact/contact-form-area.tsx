import { connection } from "next/server";
import { ContactForm } from "@/components/shared/contact-form";
import { contactPrefill } from "@/lib/utils/contact-schema";
import type { SearchParams } from "@/lib/utils/filters";
import { site } from "@/lib/config";
import styles from "./contact.module.css";

export async function ContactFormArea({
  searchParams,
  email,
}: {
  searchParams: Promise<SearchParams>;
  email: string;
}) {
  await connection();
  const prefill = contactPrefill(await searchParams, site.url);
  return (
    <ContactForm
      key={JSON.stringify(prefill)}
      enabled={process.env.CONTACT_FORM_ENABLED === "true"}
      initialReason={prefill.reason}
      articleUrl={prefill.articleUrl}
      email={email}
    />
  );
}

export function ContactFormSkeleton() {
  return (
    <div
      className={`${styles.formPanel} ${styles.loading}`}
      role="status"
      aria-label="Loading contact form"
    >
      <div />
      <span />
      <span />
      <span />
      <span />
      <span />
      <p className="sr-only">Loading contact form…</p>
    </div>
  );
}
