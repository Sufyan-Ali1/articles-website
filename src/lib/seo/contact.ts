import { site } from "@/lib/config";
import { pageSeo } from "@/lib/content/site-copy";

export function contactStructuredData() {
  const pageUrl = new URL("/contact", site.url).href;
  const organizationId = `${site.url}/#organization`;
  const websiteId = `${site.url}/#website`;
  const ref = (id: string) => ({ "@id": `${pageUrl}#${id}` });
  const url = (path: string) => new URL(path, site.url).href;
  const element = (
    id: string,
    name: string,
    description: string,
    text?: string,
    parent = "webpage",
  ) => ({
    "@type": "WebPageElement",
    ...ref(id),
    name,
    description,
    ...(text ? { text } : {}),
    isPartOf: ref(parent),
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: site.name,
        url: site.url,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: site.url,
        name: site.name,
        inLanguage: "en",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "ContactPage",
        ...ref("webpage"),
        url: pageUrl,
        name: `${pageSeo.contact.title} | ${site.name}`,
        headline: "Contact Us",
        description: pageSeo.contact.description,
        inLanguage: "en",
        isAccessibleForFree: true,
        isPartOf: { "@id": websiteId },
        publisher: { "@id": organizationId },
        about: { "@id": organizationId },
        keywords: [
          "Ask & Explore contact",
          "Contact Ask & Explore",
          "Ask & Explore feedback",
          "Article corrections",
          "General enquiries",
          "Privacy enquiries",
          "Collaboration enquiries",
        ],
        significantLink: ["/request-article", "/privacy"].map(url),
        hasPart: [
          "introduction",
          "contact-options",
          "contact-form",
          "frequently-asked-questions",
          "newsletter",
        ].map(ref),
      },
      element(
        "introduction",
        "Contact Us",
        "Introduction to contacting Ask & Explore.",
        "Have a question about Ask & Explore, noticed something we should correct, or want to share feedback? Use the contact form to send us a message. Include a relevant page link if it helps explain your enquiry.",
      ),
      {
        ...element(
          "contact-options",
          "How to Contact Ask & Explore",
          "Guidance for general questions, article feedback, privacy enquiries, and collaboration proposals.",
          "Use the form for general questions, article feedback, privacy enquiries, or collaboration proposals. If your message concerns an article, include its link and the specific detail you want us to review.",
        ),
        hasPart: ["general-enquiries", "after-submission", "collaboration"].map(
          ref,
        ),
      },
      element(
        "general-enquiries",
        "General Enquiries",
        "Contact guidance for reader questions and general website feedback.",
        "For questions about Ask & Explore, feedback on our articles, or other general enquiries.",
        "contact-options",
      ),
      element(
        "after-submission",
        "After You Send",
        "Information about submission confirmation and response expectations.",
        "After submitting, look for an on-screen confirmation. We may use your email address to follow up if needed, but a response isn't guaranteed.",
        "contact-options",
      ),
      element(
        "collaboration",
        "Collaboration & Press",
        "Instructions for sending collaboration and press proposals to Ask & Explore.",
        "Have a collaboration or press proposal? Choose General question in the form and include a short outline, the intended audience, and why your idea is relevant to Ask & Explore readers.",
        "contact-options",
      ),
      {
        ...element(
          "contact-form",
          "Send Us a Message",
          "Online contact form for general questions, article corrections, privacy enquiries, and collaboration proposals.",
          "Choose a subject and describe your message. If it's about an article, include its link and the specific detail you'd like us to review.",
        ),
        hasPart: [
          "name-field",
          "email-field",
          "subject-field",
          "article-field",
          "message-field",
          "verification",
          "privacy-notice",
        ].map(ref),
      },
      element(
        "name-field",
        "Your name",
        "Optional contact form field for the visitor's name.",
        undefined,
        "contact-form",
      ),
      element(
        "email-field",
        "Email address",
        "Required contact form field for the visitor's email address.",
        undefined,
        "contact-form",
      ),
      element(
        "subject-field",
        "Subject",
        "Select the type of enquiry.",
        "Available options: General question, Suggest a correction, Privacy enquiry.",
        "contact-form",
      ),
      element(
        "article-field",
        "Article link",
        "Optional field for including a relevant Ask & Explore article URL.",
        undefined,
        "contact-form",
      ),
      element(
        "message-field",
        "Your message",
        "Required message field for describing a question, correction, or enquiry.",
        "Describe your question or issue clearly. Plain text; up to 5,000 characters.",
        "contact-form",
      ),
      element(
        "verification",
        "Verification",
        "Arithmetic verification challenge used by the contact form.",
        "Enter the sum of the two numbers.",
        "contact-form",
      ),
      {
        ...element(
          "privacy-notice",
          "Contact Form Privacy Information",
          "Privacy information associated with submitting a contact message.",
          "Messages are submitted privately. Learn how Ask & Explore uses the information provided through its contact form.",
          "contact-form",
        ),
        url: url("/privacy"),
      },
      {
        ...element(
          "frequently-asked-questions",
          "Common Contact Questions",
          "Answers to common questions about suggesting article topics, reporting corrections, and collaboration enquiries.",
          "Find out how to suggest an article topic, report a correction, or send a collaboration proposal.",
        ),
        mainEntity: ["faq-question-1", "faq-question-2", "faq-question-3"].map(
          ref,
        ),
      },
      {
        "@type": "Question",
        ...ref("faq-question-1"),
        name: "Can I suggest a topic?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Use our Request an Article page to suggest a question, how-to guide, or product comparison you'd like us to cover.",
          url: url("/request-article"),
        },
        isPartOf: ref("frequently-asked-questions"),
      },
      {
        "@type": "Question",
        ...ref("faq-question-2"),
        name: "How do I suggest a correction?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Select Suggest a correction in the contact form. Include the article link, the information you'd like us to check, and a supporting source if you have one.",
        },
        isPartOf: ref("frequently-asked-questions"),
      },
      {
        "@type": "Question",
        ...ref("faq-question-3"),
        name: "Can we work together?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can send a collaboration, guest article, or press proposal through the form. Choose General question and briefly explain your idea and its relevance to Ask & Explore readers. Sending a proposal doesn't guarantee collaboration.",
        },
        isPartOf: ref("frequently-asked-questions"),
      },
      element(
        "newsletter",
        "Stay connected with new reads.",
        "Newsletter subscription section for new articles and practical guides from Ask & Explore.",
        "Subscribe to receive practical guides and new article updates by email.",
      ),
    ],
  };
}
