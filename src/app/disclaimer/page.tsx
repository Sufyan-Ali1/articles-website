import Link from "next/link";
import { EditorialPage } from "@/components/shared/editorial-page";
import { metadata } from "@/lib/seo/metadata";
export const generateMetadata = () =>
  metadata(
    "Editorial & Affiliate Disclosures",
    "Understand recommendations, review labels, sponsored links, and the limits of information at Ask & Explore.",
    "/disclaimer",
  );
export default function Disclaimer() {
  return (
    <EditorialPage
      legal
      summary="Read recommendations in context. Review labels do not by themselves claim hands-on testing, commercial links should be disclosed, and information can change."
      eyebrow="Context matters"
      title="Editorial & affiliate disclosures"
      description="A clearer picture of what you’re reading and the links you may encounter."
    >
      <div className="disclosure-overview">
        <div>
          <span>01 / Evidence</span>
          <strong>Look at the method.</strong>
          <p>A review label alone does not establish hands-on testing.</p>
        </div>
        <div>
          <span>02 / Relationships</span>
          <strong>Know the context.</strong>
          <p>Relevant commercial links should be disclosed in the article.</p>
        </div>
        <div>
          <span>03 / Timing</span>
          <strong>Check what changed.</strong>
          <p>Prices, products, and information can change after publication.</p>
        </div>
      </div>
      <h2>Recommendations need context</h2>
      <p>
        Product reviews, comparisons, and buying guides reflect the information
        and scope described in each article. A review label does not, by itself,
        claim hands-on testing. Check an article’s explanation of its evidence
        and methods before relying on a recommendation.
      </p>
      <h2>Commercial and affiliate links</h2>
      <p>
        Articles may include sponsored or affiliate links. If a link is an
        affiliate link, the publication may receive compensation when a reader
        follows it or makes a purchase. An applicable article should identify
        the commercial relationship near the relevant content. A sponsored-link
        notice links back to this page for additional context.
      </p>
      <p>
        Not every external link is an affiliate link. The presence of a
        commercial link does not establish that a product is suitable for you.
        Review the seller’s current price, terms, and product information before
        purchasing.
      </p>
      <h2>Information can change</h2>
      <p>
        Specifications, prices, availability, software, and recommendations can
        change. Publication and update dates help you place an article in
        context, but they do not guarantee that every detail is current.
      </p>
      <h2>General information, individual decisions</h2>
      <p>
        Content is intended for general reading and learning. For decisions
        involving health, legal obligations, finances, vehicle safety, or other
        significant consequences, seek advice appropriate to your circumstances
        and follow applicable manufacturer instructions.
      </p>
      <h2>Questions or corrections</h2>
      <p>
        For available editorial contact methods, see{" "}
        <Link href="/contact">Contact</Link>. For information about suggestions
        and personal data, see the <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </EditorialPage>
  );
}
