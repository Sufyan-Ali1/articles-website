import Link from "next/link";
import type { LegalPageConfig } from "./legal-types";

export const termsPage: LegalPageConfig = {
  id: "terms",
  eyebrow: "Terms & conditions",
  title: "Terms & Conditions",
  description:
    "These terms explain responsible use of Ask & Explore, the limits of general information, and what to expect when you send a message or suggest an article.",
  image: {
    src: "/images/legal/terms-hero.webp",
    alt: "An illustrated guide holding a terms document with a blue checkmark.",
  },
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      content: (
        <p>
          These terms cover reading Ask &amp; Explore, using its public
          features, and sending suggestions or messages. Use the site lawfully
          and check information that matters to your circumstances. A submission
          does not guarantee publication or a reply.
        </p>
      ),
    },
    {
      id: "general-information",
      title: "General information",
      content: (
        <>
          <p>
            Our articles offer general information and perspectives. Details may
            change, contain errors, or leave out something important to your
            situation. Check material facts before relying on a recommendation
            or making a purchase.
          </p>
        </>
      ),
    },
    {
      id: "using-the-website",
      title: "Using the website",
      content: (
        <>
          <p>
            Use the website for lawful purposes. Do not access private systems
            or another person’s information, disrupt the service, bypass rate
            limits, or send abusive or malicious material. Pages and features
            may change or become unavailable.
          </p>
        </>
      ),
    },
    {
      id: "article-suggestions",
      title: "Article suggestions",
      content: (
        <>
          <p>
            Share only material you have the right to submit. We may review
            suggestions and use them as inspiration for future articles. Sending
            an idea does not create an agreement to publish it, pay for it,
            respond, or keep it confidential. Leave out confidential information
            and personal data that your question does not need.
          </p>
        </>
      ),
    },
    {
      id: "contact-messages",
      title: "Contact messages",
      content: (
        <>
          <p>
            Use the contact form for genuine questions, article corrections, and
            privacy enquiries. Include only the information needed to explain
            your message. Sending a message does not guarantee a reply or create
            a confidentiality agreement.
          </p>
        </>
      ),
    },
    {
      id: "content-and-attribution",
      title: "Content and attribution",
      content: (
        <>
          <p>
            Articles, images, names, and other materials may be protected by
            copyright or other rights. You are welcome to link to an article.
            Access to the site does not give permission to reproduce its content
            or imply that we own material belonging to third parties.
          </p>
        </>
      ),
    },
    {
      id: "external-websites",
      title: "Advertising and external websites",
      content: (
        <>
          <p>
            The site may display advertisements, including ads served through
            Google AdSense, and may include sponsored or affiliate links.
            Advertising helps fund the publication. An ad’s appearance does not
            mean we endorse the advertiser or guarantee its claims. You do not
            need to click an ad or make a purchase to read our articles. Do not
            generate automated or artificial ad views or clicks, or click
            repeatedly to increase advertising revenue.
          </p>
          <p>
            External links are provided for context or convenience. Linked
            websites have their own terms, availability, and privacy practices.
            Read our <Link href="/disclaimer">disclosures</Link> for information
            about commercial links.
          </p>
          <p>
            Purchases or other dealings with advertisers and external sellers
            are subject to their own terms. Check the seller, price, return
            policy, and suitability before providing information or paying. Our{" "}
            <Link href="/privacy">Privacy Policy</Link> explains advertising
            cookies and available privacy choices. Using the website does not by
            itself give consent to optional advertising cookies or waive your
            applicable privacy or consumer rights.
          </p>
        </>
      ),
    },
    {
      id: "questions-and-updates",
      title: "Questions and updates",
      content: (
        <>
          <p>
            Available contact methods are listed on the{" "}
            <Link href="/contact">Contact page</Link>. These terms may be
            updated as the publication changes. Nothing here is intended to
            exclude rights that cannot lawfully be excluded.
          </p>
        </>
      ),
    },
  ],
  note: {
    updatedAt: "2026-11-05",
    title: "Questions about these terms?",
    description: "Use our Contact page for a question about these terms.",
    link: { href: "/contact", label: "Contact us" },
  },
};
