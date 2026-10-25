import Link from "next/link";
import type { LegalPageConfig } from "./legal-types";
import styles from "./legal.module.css";

export const disclaimerPage: LegalPageConfig = {
  id: "disclaimer",
  eyebrow: "Editorial disclosures",
  title: "Editorial & Affiliate Disclosures",
  description:
    "Understand the context behind our articles, product recommendations, review labels, and commercial links.",
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
      id: "commercial-and-affiliate-links",
      title: "Commercial and affiliate links",
      content: (
        <>
          <p>
            Articles may include sponsored or affiliate links. If a link is an
            affiliate link, the publication may receive compensation when a
            reader follows it or makes a purchase. An applicable article should
            identify the commercial relationship near the relevant content. A
            sponsored-link notice links back to this page for additional
            context.
          </p>
          <p>
            An external link is not necessarily an affiliate link, and a
            commercial relationship does not tell you whether a product fits
            your needs. Check the seller’s current price, terms, and product
            information before buying.
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
    title: "Questions or corrections?",
    description:
      "Use our Contact page to ask about an article or report a correction.",
    link: { href: "/contact", label: "Contact us" },
  },
};
