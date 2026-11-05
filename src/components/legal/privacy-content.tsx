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
          are stored for review; sending a message does not guarantee a reply.
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
          We use cookies and similar browser storage for site features, traffic
          measurement, and, where advertising is enabled, advertising. We use
          our own traffic measurement to understand which shared links and
          referring websites bring readers to articles. A signed, HttpOnly
          cookie remembers a random session identifier and referral information
          for 30 minutes of inactivity. Opening a different tracking link starts
          a new attributed session. Article-view records include the article,
          time, campaign or link placement, and referring domain when available;
          they do not include your name, email, full referring URL, or IP
          address. Our own traffic measurement honors browser Do Not Track and
          Global Privacy Control signals; this does not automatically change
          your settings with Google or other advertising providers. These
          measurements are estimates, not a record of individual identities. The
          publication operator manages analytics retention. The article Save
          feature stores bookmarks in your browser’s local storage; it does not
          create an account or sync bookmarks across devices. External image
          providers receive the technical information needed to deliver their
          images. Links to other websites lead to services with their own
          privacy practices.
        </p>
        <p>
          We also use Google Analytics to understand how visitors find and use
          the website, including which pages they view and how they interact
          with the site. Google Analytics uses cookies and processes information
          such as browser and device details, page addresses, referral
          information, and online identifiers. Your browser sends technical
          information, including your IP address, to Google when the Google tag
          loads. This is separate from our own traffic measurement described
          above. Learn more about{" "}
          <a href="https://policies.google.com/technologies/partner-sites">
            how Google uses information from sites that use its services
          </a>
          . You can block or delete cookies in your browser and learn about
          Google’s{" "}
          <a href="https://tools.google.com/dlpage/gaoptout">
            Analytics opt-out browser add-on
          </a>
          . Advertising opt-out settings do not by themselves turn off Google
          Analytics.
        </p>
        <p>
          When you subscribe, we store your normalized email address and signup
          date to send article updates by email. Repeated signup does not create
          a second subscription. Subscribing is optional and is separate from
          sending a contact message or suggesting a topic. You can ask us to
          remove your subscription through the Contact page.
        </p>
      </>
    ),
  },
  {
    id: "google-adsense-and-advertising",
    title: "Google AdSense and advertising",
    icon: "document",
    tone: "blue",
    content: (
      <>
        <p>
          Ask &amp; Explore may display advertisements through Google AdSense
          and other advertising partners. Where these services are enabled,
          third-party vendors, including Google, use cookies to serve ads based
          on your previous visits to this website or other websites. Google’s
          advertising cookies enable Google and its partners to show ads based
          on your visits to this site and other sites on the internet, subject
          to applicable consent requirements and your settings.
        </p>
        <p>
          Advertising services may receive your IP address, the page URL,
          browser and device information, cookie identifiers, and information
          about ad views or interactions. This information can be used to
          deliver and measure ads, limit repeated ads, prevent fraud, and, where
          permitted, personalize advertising. Turning off personalization does
          not necessarily stop all advertising-related data processing. Read{" "}
          <a href="https://policies.google.com/technologies/partner-sites">
            how Google uses information from sites that use its services
          </a>{" "}
          and the{" "}
          <a href="https://policies.google.com/privacy">
            Google Privacy Policy
          </a>
          .
        </p>
        <p>
          Other third-party vendors or ad networks participating in Google’s
          advertising services may also use cookies or similar technologies to
          serve and measure ads. Google provides information and links for its{" "}
          <a href="https://support.google.com/adsense/answer/9012903?hl=en">
            advertising technology providers
          </a>
          . Where an advertising consent message is shown, review its vendor
          information for the partners and purposes applicable to that message.
          Contact-form messages, topic submissions, and newsletter email
          addresses are not supplied by our website forms to Google for ad
          personalization.
        </p>
      </>
    ),
  },
  {
    id: "advertising-and-cookie-choices",
    title: "Advertising and cookie choices",
    icon: "settings",
    tone: "green",
    content: (
      <>
        <p>
          You can manage or opt out of Google’s personalized advertising through{" "}
          <a href="https://adssettings.google.com/">Google Ads Settings</a>. You
          can also explore opt-out choices for participating third-party vendors
          at <a href="https://optout.aboutads.info/">YourAdChoices</a>. These
          choices may apply only to a particular browser, device, or account;
          clearing cookies or changing devices may require setting your
          preferences again. Opting out of personalized ads does not necessarily
          remove ads or prevent cookies used for other purposes.
        </p>
        <p>
          Your browser settings let you block or delete cookies and clear local
          storage. This may affect saved articles and other site features.
          Browser settings and Google Ads Settings are separate from any consent
          choices requested on this website.
        </p>
        <p>
          Where applicable law requires consent for cookies or personal data
          used in advertising, that consent must be obtained before the relevant
          processing begins. Simply reading this policy or continuing to browse
          does not provide that consent. If an advertising consent message is
          presented, use its available controls to make, revisit, or withdraw
          your choices. Personalized Google ads for readers in the European
          Economic Area, the United Kingdom, and Switzerland require a
          Google-certified consent management platform. This policy itself does
          not set your advertising preferences.
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
          for article updates by email. The publication’s operator manages
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
          method to request access, correction, deletion, or removal of your
          subscription, or to raise a privacy concern. Depending on your
          location, you may also have rights to restrict or object to
          processing, receive a copy of your data, withdraw consent, or complain
          to a data protection authority. We may need information to verify a
          request before acting on it. Some records may need to be retained to
          meet legal obligations or protect against abuse. Rights and any
          exceptions depend on applicable law. For data held independently by an
          advertising provider, use that provider’s privacy controls as well.
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
    "Learn how Ask & Explore handles your information, cookies, Google advertising, and privacy choices when you browse or contact us.",
  image: {
    src: "/images/privacy/hero.webp",
    alt: "A reader using a laptop beside a blue shield and padlock, surrounded by green plants.",
  },
  sections: privacySections,
  note: {
    icon: "shield",
    updatedAt: "2026-11-06",
    title: "Questions about your privacy?",
    description: "Use our Contact page for a question about your information.",
    link: { href: "/contact", label: "Contact us" },
  },
};
