import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { ArrowUpRight, Lightbulb, Mail, ChevronDown } from "lucide-react";
import { ContactForm } from "@/components/shared/contact-form";
import { CuriosityArt } from "@/components/shared/curiosity-art";
import { PageHeading } from "@/components/shared/states";
import { contactPrefill } from "@/lib/utils/contact-schema";
import type { SearchParams } from "@/lib/utils/filters";
import { site } from "@/lib/config";
import { metadata } from "@/lib/seo/metadata";
export const generateMetadata = () =>
  metadata(
    "Contact",
    "Questions, corrections, or a conversation worth starting. Get in touch with Ask & Explore.",
    "/contact",
  );
async function FormArea({
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
const faqs = [
  {
    question: "Have an idea for an article?",
    answer: (
      <>
        Use our <Link href="/request-article">topic suggestion form</Link>. A
        specific question or a little context helps us understand what you’d
        like to read.
      </>
    ),
  },
  {
    question: "What helps when suggesting a correction?",
    answer: (
      <>
        Choose “Suggest a correction,” include the article link if you have it,
        and identify the passage and the information you believe should change.
      </>
    ),
  },
  {
    question: "What happens after I send a message?",
    answer: (
      <>
        Once accepted, your message is delivered privately to the publication’s
        contact service for review. Providing an email address allows a reply
        when appropriate; submission doesn’t guarantee a response.
      </>
    ),
  },
  {
    question: "How is my information handled?",
    answer: (
      <>
        Contact messages are processed through Netlify Forms. They aren’t
        published on the website or used to sign you up for a newsletter. Read
        our <Link href="/privacy">Privacy Policy</Link> for details.
      </>
    ),
  },
];
export default function Contact({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email) ? site.email : "";
  return (
    <div className="container contact-page">
      <PageHeading
        eyebrow="Keep the conversation going"
        title="A good conversation starts here."
        description="A question, a correction, or something you’d like us to know. There’s a place for it here."
      />
      <div className="contact-layout">
        <aside className="contact-guidance">
          <CuriosityArt compact />
          <div className="contact-route-card">
            <Lightbulb size={24} strokeWidth={1.5} />
            <h2>A story we should explore?</h2>
            <p>Our next perspective could begin with your question.</p>
            <Link className="text-link" href="/request-article">
              Suggest an article
              <ArrowUpRight size={17} />
            </Link>
          </div>
          {email && (
            <div className="contact-direct">
              <Mail size={19} />
              <span>Prefer email?</span>
              <a href={`mailto:${email}`}>
                {email}
                <ArrowUpRight size={16} />
              </a>
            </div>
          )}
          <p className="guidance-note">
            One good question can open a new conversation. Please leave out
            passwords, payment details, and sensitive personal information.
          </p>
        </aside>
        <Suspense
          fallback={
            <div className="contact-form-panel form-loading" role="status">
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-image" />
              <span className="sr-only">Loading contact form…</span>
            </div>
          }
        >
          <FormArea searchParams={searchParams} email={email} />
        </Suspense>
      </div>
      <section className="contact-process" aria-label="Sending a message">
        {[
          [
            "01",
            "Choose a reason",
            "Help your message find the right context.",
          ],
          [
            "02",
            "Share a little detail",
            "A link or a specific question is a useful start.",
          ],
          [
            "03",
            "Get an acknowledgement",
            "We’ll confirm on screen when your message is accepted.",
          ],
        ].map(([number, title, description]) => (
          <div key={number}>
            <span>{number}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        ))}
      </section>
      <section className="faq-section">
        <div>
          <span className="eyebrow">A little more context</span>
          <h2>
            Before you <br />
            <em>press send.</em>
          </h2>
        </div>
        <div>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>
                {faq.question}
                <ChevronDown size={18} />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <div className="quiet-next">
        <span>Still following a question?</span>
        <Link className="text-link" href="/categories">
          Find a new subject to explore
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  );
}
