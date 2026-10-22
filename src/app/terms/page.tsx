import Link from "next/link";
import { EditorialPage } from "@/components/shared/editorial-page";
import { metadata } from "@/lib/seo/metadata";
export const generateMetadata = () =>
  metadata(
    "Terms of Use",
    "Terms for reading Ask & Explore and submitting article suggestions.",
    "/terms",
  );
export default function Terms() {
  return (
    <EditorialPage
      legal
      summary="Read thoughtfully, use the website lawfully, and verify information that matters to your situation. Submissions do not guarantee publication or a reply."
      eyebrow="Using the publication"
      title="Terms of Use"
      description="Please read these terms when using Ask & Explore."
    >
      <h2>General information</h2>
      <p>
        Articles provide general information and perspectives. They may become
        out of date, contain errors, or omit details relevant to your situation.
        Verify material facts before relying on a recommendation or making a
        purchase.
      </p>
      <h2>Using the website</h2>
      <p>
        Use the website lawfully. Do not attempt to access private systems or
        other people’s information, disrupt the service, bypass rate limits, or
        submit abusive or malicious material. Availability of any page or
        feature may change.
      </p>
      <h2>Article suggestions</h2>
      <p>
        Submit only content you are entitled to share. Suggestions may be
        reviewed and used as inspiration for future coverage. Sending a
        suggestion does not create a publication, compensation, response, or
        confidentiality agreement. Avoid confidential information and personal
        data that are unnecessary to your question.
      </p>
      <h2>Contact messages</h2>
      <p>
        Use the contact form for genuine enquiries, corrections, and privacy
        questions. Share only information needed to explain your message.
        Submission does not guarantee a reply or establish a confidentiality
        agreement.
      </p>
      <h2>Content and attribution</h2>
      <p>
        Articles, images, names, and other materials may be protected by
        copyright or other rights. Linking to an article is welcome. Permission
        to read the website does not grant permission to reproduce its content
        or imply ownership of third-party materials.
      </p>
      <h2>External websites</h2>
      <p>
        External links are provided for context or convenience. Linked websites
        have their own terms, availability, and privacy practices. Read our{" "}
        <Link href="/disclaimer">disclosures</Link> for information about
        commercial links.
      </p>
      <h2>Questions and updates</h2>
      <p>
        Available contact methods are listed on the{" "}
        <Link href="/contact">Contact page</Link>. These terms may be updated as
        the publication changes. Nothing here is intended to exclude rights that
        cannot lawfully be excluded.
      </p>
    </EditorialPage>
  );
}
