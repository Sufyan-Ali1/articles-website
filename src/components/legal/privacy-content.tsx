import Link from "next/link";
import type { LegalSection, LegalPageConfig } from "./legal-types";

export const privacySections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    icon: "document",
    tone: "blue",
    content: (
      <p>
        You do not need an account to read Ask &amp; Explore. This policy
        explains the information involved in browsing, suggesting an article, or
        contacting us. Suggestions and messages are submitted privately; include
        only the details your enquiry needs.
      </p>
    ),
  },
  {
    id: "information-you-choose-to-share",
    title: "Information you choose to share",
    icon: "database",
    tone: "green",
    content: (
      <>
        <p>
          When you request an article, we collect the topic and any description
          you provide. Your name and email address are optional, so you can
          suggest a topic without contact details. Do not include sensitive
          personal information in your request.
        </p>
      </>
    ),
  },
  {
    id: "how-suggestions-are-used",
    title: "How suggestions are used",
    icon: "settings",
    tone: "orange",
    content: (
      <>
        <p>
          People who manage the publication may review suggestions for editorial
          planning. If you provide an email address, we may use it to follow up
          about your idea. Suggestions are not automatically published and do
          not subscribe you to a newsletter.
        </p>
      </>
    ),
  },
  {
    id: "contact-messages",
    title: "Contact messages",
    icon: "mail",
    tone: "pink",
    content: (
      <>
        <p>
          The contact form collects your email address, message subject, and
          message, plus any optional name or article link. Our backend receives
          and stores these messages privately. We use contact messages to
          address enquiries; they are not published or treated as newsletter
          subscriptions.
        </p>
        <p>
          Authorized administrators can review contact submissions. The
          publication’s operator manages access and retention. Contact messages
          are stored for review; sending a message does not trigger an automated
          email or guarantee a reply.
        </p>
      </>
    ),
  },
  {
    id: "technical-information",
    title: "Technical information",
    icon: "server",
    tone: "blue",
    content: (
      <>
        <p>
          Our hosting and API services process technical information needed to
          deliver the site, including IP addresses, requested pages, timestamps,
          and error details. The article suggestion service uses IP-based rate
          limits and short-term duplicate detection to reduce abuse.
        </p>
      </>
    ),
  },
  {
    id: "cookies-and-external-resources",
    title: "Cookies and external resources",
    icon: "cookies",
    tone: "purple",
    content: (
      <>
        <p>
          The site does not include advertising or third-party analytics
          scripts. We use our own traffic measurement to understand which shared
          links and referring websites bring readers to articles. A signed,
          HttpOnly cookie remembers a random session identifier and referral
          information for 30 minutes of inactivity. Opening a different tracking
          link starts a new attributed session. Article-view records include the
          article, time, campaign or link placement, and referring domain when
          available; they do not include your name, email, full referring URL,
          or IP address. We honor browser Do Not Track and Global Privacy
          Control signals. These measurements are estimates, not a record of
          individual identities. The publication operator manages analytics
          retention. The article Save feature stores bookmarks in your browser’s
          local storage; it does not create an account or sync bookmarks across
          devices. External image providers receive the technical information
          needed to deliver their images. Links to other websites lead to
          services with their own privacy practices. When you subscribe, we
          store your normalized email address and signup date for future article
          updates. Repeated signup does not create a second subscription. Email
          delivery is not active yet. Subscribing is optional and is separate
          from sending a contact message or suggesting a topic.
        </p>
      </>
    ),
  },
  {
    id: "storage-and-retention",
    title: "Storage and retention",
    icon: "storage",
    tone: "blue",
    content: (
      <>
        <p>
          Suggestions, contact messages, and optional contact details may be
          kept for editorial planning and follow-up. Subscriber emails are kept
          for future article updates. The publication’s operator manages
          retention and deletion; the website does not provide an automatic
          deletion schedule. Infrastructure providers may keep technical logs
          under their own settings and policies.
        </p>
      </>
    ),
  },
  {
    id: "questions-about-your-information",
    title: "Questions about your information",
    icon: "person",
    tone: "green",
    content: (
      <>
        <p>
          Available public contact methods are listed on the{" "}
          <Link href="/contact">Contact page</Link>. Use an available contact
          method for a privacy enquiry or a request about a suggestion you
          submitted. Applicable rights depend on your location and how the
          information is processed.
        </p>
      </>
    ),
  },
  {
    id: "changes-to-this-notice",
    title: "Changes to this notice",
    icon: "updates",
    tone: "yellow",
    content: (
      <>
        <p>
          We may update this notice when site features or data practices change.
          Read the current version before sending personal information.
        </p>
      </>
    ),
  },
];

export const privacyPage: LegalPageConfig = {
  id: "privacy",
  eyebrow: "Privacy Policy",
  title: "Privacy Policy",
  heroTitle: (
    <>
      Privacy Policy
      <br />
      Your Information
    </>
  ),
  headingStyle: "sans",
  description:
    "Understand what information is involved when you browse, save an article, suggest a topic, or contact Ask & Explore.",
  image: {
    src: "/images/privacy/hero.webp",
    alt: "A reader using a laptop beside a blue shield and padlock, surrounded by green plants.",
  },
  sections: privacySections,
  note: {
    icon: "shield",
    title: "Questions about your privacy?",
    description: "Use our Contact page for a question about your information.",
    link: { href: "/contact", label: "Contact us" },
  },
};
