import { site } from "@/lib/config";
import { pageSeo } from "@/lib/content/site-copy";

export function homeStructuredData() {
  const url = new URL("/", site.url).href;
  const organizationId = `${url}#organization`;
  const websiteId = `${url}#website`;
  const categoriesId = `${url}#categories`;
  const logoUrl = new URL("/images/brand/ae-mark.svg", site.url).href;
  const categories = [
    [
      "Automotive",
      "Car buying advice, electric and hybrid vehicle comparisons, ownership costs, and practical vehicle information.",
    ],
    [
      "Technology",
      "Technology guides covering AI tools, laptops, software, digital productivity, and everyday tech.",
    ],
    [
      "Buying Guides",
      "Product comparisons covering features, prices, performance, and important buying decisions.",
    ],
    [
      "Lifestyle",
      "Practical lifestyle tips about reducing screen time, improving focus, managing digital habits, and building everyday routines.",
    ],
    [
      "Digital Safety",
      "Online privacy, account security, phishing scams, and practical information to help readers stay safer online.",
    ],
    [
      "Travel",
      "Travel planning guides, cheap flight tips, fare comparisons, price alerts, and booking advice.",
    ],
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: site.name,
        url,
        description:
          "Ask & Explore publishes technology guides, car buying advice, product comparisons, digital safety tips, travel planning information, and practical lifestyle articles to help readers understand everyday decisions.",
        logo: {
          "@type": "ImageObject",
          "@id": `${url}#logo`,
          url: logoUrl,
          contentUrl: logoUrl,
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url,
        name: site.name,
        alternateName: "askandexplore.com",
        description:
          "Practical guides and everyday advice covering technology, cars, product comparisons, digital safety, travel, and lifestyle.",
        inLanguage: "en",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: pageSeo.home.title,
        headline: "Ask & Explore: Practical Guides & Everyday Advice",
        description: pageSeo.home.description,
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
        publisher: { "@id": organizationId },
        about: [
          "Technology Guides",
          "Automotive Advice",
          "Product Comparisons and Buying Guides",
          "Lifestyle Guides",
          "Digital Safety Tips",
          "Travel Planning Guides",
        ].map((name) => ({ "@type": "Thing", name })),
        mainEntity: { "@id": categoriesId },
        significantLink: ["/about", "/authors/editorial-team"].map(
          (path) => new URL(path, site.url).href,
        ),
      },
      {
        "@type": "ItemList",
        "@id": categoriesId,
        name: "Explore by Category",
        description:
          "Browse six topics to find practical guides, helpful comparisons, and explanations that match your interests.",
        numberOfItems: categories.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: categories.map(([name, description], index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
          description,
        })),
      },
    ],
  };
}
