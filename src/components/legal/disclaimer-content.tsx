import Link from "next/link";
import type { LegalPageConfig } from "./legal-types";
import styles from "./legal.module.css";

export const disclaimerPage: LegalPageConfig = {
  id: "disclaimer",
  eyebrow: "Editorial disclosures",
  title: "Editorial & Affiliate Disclosures",
  description:
    "Understand our articles, review labels, display advertising, sponsored content, and affiliate links before making a decision.",
  image: {
    src: "/images/privacy/hero.webp",
    alt: "A reader with a laptop beside a blue shield and lock, framed by green plants.",
  },
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      content: (
        <>
          <p>
            Before acting on a recommendation, check how the article reached its
            conclusions, whether it identifies a commercial relationship, and
            when its information was published or updated.
          </p>
          <div className={styles.overview}>
            <div>
              <span>01 / Evidence</span>
              <strong>Look at the method.</strong>
              <p>A review label alone does not establish hands-on testing.</p>
            </div>
            <div>
              <span>02 / Relationships</span>
              <strong>Know the context.</strong>
              <p>
                Relevant commercial links should be disclosed in the article.
              </p>
            </div>
            <div>
              <span>03 / Timing</span>
              <strong>Check what changed.</strong>
              <p>
                Prices, products, and information can change after publication.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "recommendations-need-context",
      title: "Recommendations need context",
      content: (
        <>
          <p>
            A review, comparison, or buying guide should be read within the
            scope it describes. The word “review” alone does not mean a product
            was tested hands-on. Look for the article’s explanation of its
            evidence, methods, and limitations before relying on a
            recommendation.
          </p>
        </>
      ),
    },
    {
      id: "display-advertising",
      title: "Display advertising",
      content: (
        <>
          <p>
            Ask &amp; Explore may earn revenue from display advertisements,
            including Google AdSense ads. Advertising placements are separate
            from editorial recommendations. Seeing an advertisement here does
            not mean that we or Google have tested, approved, or endorsed the
            advertised product, service, or seller.
          </p>
          <p>
            Advertising providers may select ads automatically using the page
            content, your settings, and other permitted signals. An ad may
            therefore differ from the article’s subject or recommendations. You
            are free to ignore ads; clicking an ad or buying a product is never
            required to access our articles. Check an advertiser’s claims and
            terms before sharing information or making a purchase.
          </p>
          <p>
            See our <Link href="/privacy">Privacy Policy</Link> for information
            about Google advertising cookies, third-party data use, and
            personalized advertising choices. If an ad seems misleading or
            unsafe, use any reporting controls available on the ad or contact us
            with the page address and details of what you saw.
          </p>
        </>
      ),
    },
    {
      id: "commercial-and-affiliate-links",
      title: "Commercial and affiliate links",
      content: (
        <>
          <p>
            Articles may include sponsored or affiliate links. If a link is an
            affiliate link, the publication may receive compensation when a
            reader follows it or makes a purchase. Relevant affiliate
            relationships and paid sponsorships will be identified clearly with
            the relevant content, so readers can understand the relationship
            before acting. This general disclosure does not replace an
            article-specific disclosure. A sponsored-link notice links back to
            this page for additional context.
          </p>
          <p>
            An external link is not necessarily an affiliate link, and a
            commercial relationship does not tell you whether a product fits
            your needs. Check the seller’s current price, terms, and product
            information before buying.
          </p>
          <p>
            Paid promotional content will be identified as advertising or
            sponsored content. A commercial arrangement is not evidence that a
            product has been tested or is right for every reader.
          </p>
        </>
      ),
    },
    {
      id: "information-can-change",
      title: "Information can change",
      content: (
        <>
          <p>
            Product specifications, prices, availability, software, and
            recommendations can change after publication. An article’s dates
            provide context; they do not guarantee that every detail remains
            current.
          </p>
        </>
      ),
    },
    {
      id: "general-information-individual-decisions",
      title: "General information, individual decisions",
      content: (
        <>
          <p>
            Our content is for general information and learning. For decisions
            involving health, legal obligations, finances, vehicle safety, or
            other significant consequences, seek advice suited to your
            circumstances and follow the relevant manufacturer’s instructions.
          </p>
          <p>
            These disclosures do not remove consumer protections or other rights
            that cannot lawfully be excluded. Please report errors or unclear
            commercial disclosures so we can review them.
          </p>
        </>
      ),
    },
    {
      id: "questions-or-corrections",
      title: "Questions or corrections",
      content: (
        <>
          <p>
            For available editorial contact methods, see{" "}
            <Link href="/contact">Contact</Link>. For information about
            suggestions and personal data, see the{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </>
      ),
    },
  ],
  note: {
    updatedAt: "2026-11-05",
    title: "Questions or corrections?",
    description:
      "Use our Contact page to ask about an article or report a correction.",
    link: { href: "/contact", label: "Contact us" },
  },
};
