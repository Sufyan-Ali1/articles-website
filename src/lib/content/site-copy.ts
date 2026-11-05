// Shared editorial copy for the global English-language publication.
export const pageSeo = {
  home: {
    title: "Ask & Explore | Practical Guides & Everyday Advice",
    description:
      "Explore practical technology guides, car buying advice, product comparisons, digital safety tips, travel ideas, and lifestyle articles at Ask & Explore.",
  },
  articles: {
    title: "Articles, How-To Guides & Product Comparisons",
    description:
      "Browse how-to guides, product comparisons and buying guides on Ask & Explore. Find technology tips, car advice and everyday solutions by topic or article type.",
  },
  categories: {
    title: "Browse Guides by Topic: Technology, Cars & Everyday Life",
    description:
      "Browse Ask & Explore guides by topic: technology, cars, digital safety, lifestyle and travel. Choose a category to find related articles and buying advice.",
  },
  about: {
    title: "About Ask & Explore | Our Mission & Editorial Approach",
    description:
      "Learn about Ask & Explore, our practical guides, the topics we cover, and our approach to accuracy, transparency, and helping readers make informed choices.",
    ogTitle: "About Ask & Explore | Practical Guides & Editorial Values",
    ogDescription:
      "Discover what Ask & Explore publishes, our six main topics, and the editorial principles behind our guides, comparisons, and everyday advice.",
  },
  contact: {
    title: "Contact Us: Questions, Feedback & Corrections",
    description:
      "Contact Ask & Explore with a question, article correction, privacy enquiry or collaboration idea. Include a few details so we can understand your message.",
  },
  request: {
    title: "Request an Article or Suggest a Topic",
    description:
      "Suggest an article topic for Ask & Explore. Ask a question, request a product comparison or share an everyday problem you would like explained.",
  },
  search: {
    title: "Search Articles, Guides & Comparisons",
    description:
      "Search published article titles on Ask & Explore. Find guides, reviews and comparisons about technology, cars, buying decisions and everyday life.",
  },
  privacy: {
    title: "Privacy Policy: Your Information & Choices",
    description:
      "Learn how Ask & Explore handles personal information, cookies and Google AdSense advertising, including privacy choices, retention and contact requests.",
  },
  terms: {
    title: "Website Terms & Conditions",
    description:
      "Read the terms for using Ask & Explore, including responsible use, advertising, external sellers, content rights, article suggestions and your privacy choices.",
  },
  disclaimer: {
    title: "Editorial Standards & Affiliate Disclosures",
    description:
      "Understand Ask & Explore’s display advertising, Google AdSense, sponsored and affiliate links, review labels and the limits of general information.",
  },
} as const;

const topicDescriptions = [
  {
    pattern:
      /digital.?safety|online.?safety|cyber.?security|online.?privacy|account.?security/i,
    description:
      "Explore digital safety guides covering online privacy, account security, phishing scams, and practical steps to protect your information and stay safer online.",
  },
  {
    pattern: /smart.?home|automation/i,
    description:
      "Explore smart home guides covering device compatibility, setup and everyday use. Understand your options before adding connected technology to your home.",
  },
  {
    pattern: /tech|electronic|software|digital|device/i,
    description:
      "Explore technology guides, device comparisons and practical troubleshooting. Understand the features that matter when choosing and using your everyday tech.",
  },
  {
    pattern: /auto|car|motor|driving/i,
    description:
      "Explore car buying guides, vehicle comparisons and maintenance explainers. Understand running costs, features and ownership tradeoffs before your next decision.",
  },
  {
    pattern: /buying|shopping|product/i,
    description:
      "Compare product features, understand everyday use and work out what fits your budget. Our buying guides help you ask the right questions before you buy.",
  },
  {
    pattern: /travel|destination|adventure/i,
    description:
      "Explore travel planning guides, destination ideas and practical packing advice. Find useful starting points for a trip that suits your interests and budget.",
  },
  {
    pattern: /how.?to|tutorial/i,
    description:
      "Find step-by-step guides for everyday tasks, device setup and common problems. Get clear instructions and useful context before you begin.",
  },
  {
    pattern: /lifestyle|living|home|wellness|health|nature|garden/i,
    description:
      "Explore practical ideas for your home, daily routines and personal productivity. Find manageable changes that fit the way you live and work.",
  },
];

export function classificationCopy(
  item: { name: string; slug: string; description: string | null },
  kind: "category" | "tag",
) {
  const name = item.name.trim();
  const fallback =
    kind === "category"
      ? topicDescriptions.find((topic) =>
          topic.pattern.test(`${name} ${item.slug}`),
        )?.description ||
        `Explore ${name} articles and practical guides. Find clear explanations, useful comparisons and ideas to help you understand the topic.`
      : `Explore articles tagged ${name}. Find practical guides, clear explanations and related reads from Ask & Explore in one place.`;
  return {
    title:
      kind === "category"
        ? `${name}: Guides, Tips & Comparisons`
        : `${name}: Articles & Practical Guides`,
    description: item.description?.trim() || fallback,
  };
}
