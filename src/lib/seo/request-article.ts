import { site } from "@/lib/config";
import { pageSeo } from "@/lib/content/site-copy";

export function requestArticleStructuredData() {
  const pageUrl = new URL("/request-article", site.url).href;
  const organizationId = `${site.url}/#organization`;
  const websiteId = `${site.url}/#website`;
  const pageId = `${pageUrl}#webpage`;
  const element = (id: string, name: string, description: string) => ({
    "@type": "WebPageElement",
    "@id": `${pageUrl}#${id}`,
    name,
    description,
    isPartOf: { "@id": pageId },
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: site.name,
        url: site.url,
        description:
          "Ask & Explore publishes technology guides, car buying advice, product comparisons, digital safety tips, travel planning information, and practical lifestyle articles to help readers understand everyday decisions.",
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: site.url,
        name: site.name,
        description: "Discover More. Learn Every Day.",
        inLanguage: "en",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "WebPage",
        "@id": pageId,
        url: pageUrl,
        name: `${pageSeo.request.title} | ${site.name}`,
        headline: "Request an Article",
        description: pageSeo.request.description,
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
        publisher: { "@id": organizationId },
        about: {
          "@type": "Thing",
          name: "Article topic requests and suggestions",
          description:
            "Reader suggestions for future informational articles, how-to guides, product comparisons, and practical explanations.",
        },
        audience: {
          "@type": "Audience",
          audienceType:
            "Readers who want to suggest topics for future Ask & Explore articles",
        },
        keywords: [
          "request an article",
          "suggest an article topic",
          "submit an article idea",
          "request a guide",
          "suggest a topic",
        ],
        mainContentOfPage: { "@id": `${pageUrl}#request-form` },
        hasPart: [
          "request-form",
          "how-it-works",
          "submission-guidance",
          "quick-answers",
          "newsletter",
        ].map((id) => ({ "@id": `${pageUrl}#${id}` })),
        significantLink: ["/articles", "/categories", "/privacy"].map(
          (path) => new URL(path, site.url).href,
        ),
      },
      {
        ...element(
          "request-form",
          "Suggest an Article Topic",
          "Readers can request an article by sharing a focused question, topic, task, or product comparison. Additional context, name, and email address are optional.",
        ),
        text: "Tell us what you'd like to learn. A focused question is enough, and extra details are optional. The main topic field allows up to 300 characters.",
      },
      {
        ...element(
          "how-it-works",
          "How It Works",
          "An explanation of how visitors can suggest an article topic and how suggestions may inform future content.",
        ),
        hasPart: [
          {
            "@type": "WebPageElement",
            name: "Share your idea",
            text: "Tell us which question, task, or comparison you'd like us to cover.",
          },
          {
            "@type": "WebPageElement",
            name: "Your idea may inform future articles",
            text: "Suggestions can help us understand what readers want to learn and inform future content planning.",
          },
          {
            "@type": "WebPageElement",
            name: "It may become an article",
            text: "A suitable topic may be covered in a future article. Publication dates and personal replies are not guaranteed.",
          },
        ],
      },
      {
        ...element(
          "submission-guidance",
          "Make Your Idea Count",
          "Guidance for submitting clear and useful article suggestions.",
        ),
        text: "A focused question is easier to explore. Share the details that would make the answer useful to you.",
        hasPart: [
          {
            "@type": "WebPageElement",
            name: "Name the topic",
            text: "Tell us the product, task, or question. Include a model or version if it matters.",
          },
          {
            "@type": "WebPageElement",
            name: "Add your context",
            text: "Explain what you're trying to do, what you've already tried, or where you need help.",
          },
          {
            "@type": "WebPageElement",
            name: "Share what would help",
            text: "Tell us if you'd prefer a step-by-step guide, practical example, or side-by-side comparison.",
          },
        ],
      },
      {
        ...element(
          "quick-answers",
          "Quick Answers",
          "Common questions about requesting an article, publication expectations, and optional contact information.",
        ),
        hasPart: [
          {
            "@type": "Question",
            name: "What can I request?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can suggest a practical guide, explanation, buying guide, or comparison related to the topics we cover. If we've already published something similar, you can tell us what you'd like explained in more detail.",
            },
          },
          {
            "@type": "Question",
            name: "Will my idea be published?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Not necessarily. Suggestions may inform future article planning, but submitting an idea doesn't guarantee publication, a specific publication date, or a personal reply.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need to add my email?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Your name and email address are optional. If you provide an email address, we may use it to follow up about your idea, but a reply isn't guaranteed.",
            },
          },
        ],
      },
      element(
        "newsletter",
        "Get Useful Guides in Your Inbox",
        "Subscribe to receive new articles and practical guides by email. Newsletter signup is separate from submitting an article request.",
      ),
    ],
  };
}
