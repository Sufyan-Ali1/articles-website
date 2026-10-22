import Link from "next/link";
import { EditorialPage } from "@/components/shared/editorial-page";
import { metadata } from "@/lib/seo/metadata";
export const generateMetadata = () =>
  metadata(
    "Privacy Policy",
    "How Ask & Explore handles browsing information and voluntary topic suggestions.",
    "/privacy",
  );
export default function Privacy() {
  return (
    <EditorialPage
      legal
      summary="You can browse without an account. Topic suggestions and contact messages are submitted privately. Share only the information needed for your enquiry."
      eyebrow="Your information"
      title="Privacy Policy"
      description="This notice describes information used by this public website and its topic suggestion form."
    >
      <h2>Information you choose to share</h2>
      <p>
        The topic suggestion form collects your topic, any description you
        include, and an optional name and email address. You can send a
        suggestion without providing contact details. Please do not include
        sensitive personal information.
      </p>
      <h2>How suggestions are used</h2>
      <p>
        Suggestions are used for editorial planning and may be reviewed by
        people who manage the publication. If you include an email address, it
        may be used to respond about your suggestion. Submissions are not
        automatically published and are not a newsletter subscription.
      </p>
      <h2>Contact messages</h2>
      <p>
        The general contact form collects your email address, selected reason,
        message, and any optional name or article link. Contact messages are
        processed and stored through Netlify Forms, a separate service from the
        article suggestion API. They are used to address your enquiry and are
        not published or used for newsletter subscriptions.
      </p>
      <p>
        People authorized to manage the publication’s Netlify account may review
        these submissions. Notification delivery and retention are managed by
        the publication’s operator. Netlify also processes technical information
        for delivery and spam prevention.
      </p>
      <h2>Technical information</h2>
      <p>
        Hosting and API services process technical information needed to deliver
        the website, such as IP addresses, requested pages, timestamps, and
        error information. The suggestion service uses IP-based rate limits and
        short-term duplicate detection to reduce abuse.
      </p>
      <h2>Cookies and external resources</h2>
      <p>
        This website does not include advertising or third-party analytics
        scripts. Its public features do not require an account. Images may be
        delivered by external image providers, which receive the technical
        information needed to serve those requests. Following an external link
        takes you to a service with its own privacy practices.
      </p>
      <h2>Storage and retention</h2>
      <p>
        Suggestions and optional contact information may be retained for
        editorial planning and follow-up. Retention and deletion are managed by
        the publication’s operator; this website does not offer an automatic
        deletion schedule. Infrastructure providers may retain technical logs
        according to their own settings and policies.
      </p>
      <h2>Questions about your information</h2>
      <p>
        Available public contact methods are listed on the{" "}
        <Link href="/contact">Contact page</Link>. Where a contact address is
        provided, use it for privacy enquiries or requests concerning a
        suggestion you submitted. Any applicable rights depend on your location
        and the circumstances of processing.
      </p>
      <h2>Changes to this notice</h2>
      <p>
        This notice may change as website features and data practices change.
        Review the current version before submitting personal information.
      </p>
    </EditorialPage>
  );
}
