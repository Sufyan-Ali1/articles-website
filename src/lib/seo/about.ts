import { site } from "@/lib/config";
import { pageSeo } from "@/lib/content/site-copy";

export function aboutStructuredData() {
  const url = (path: string) => new URL(path, site.url).href;
  const organizationId = `${site.url}/#organization`;
  const websiteId = `${site.url}/#website`;
  const pageUrl = url("/about");
  const breadcrumbId = `${pageUrl}#breadcrumb`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: site.name,
        url: site.url,
        logo: {
          "@type": "ImageObject",
          url: url("/images/brand/ae-mark.svg"),
        },
        description:
          "Ask & Explore is an online publication offering practical guides, informative articles, how-to tutorials, and useful comparisons covering technology, automotive, buying guides, lifestyle, digital safety, and travel.",
        publishingPrinciples: url("/disclaimer"),
        knowsAbout: [
          "Technology",
          "Artificial Intelligence",
          "Automotive",
          "Buying Guides",
          "Product Comparisons",
          "Lifestyle",
          "Digital Safety",
          "Online Privacy",
          "Travel Planning",
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: site.url,
        name: site.name,
        publisher: { "@id": organizationId },
        inLanguage: "en",
      },
      {
        "@type": "AboutPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "About Ask & Explore: Practical Guides for Everyday Life",
        description: pageSeo.about.description,
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": organizationId },
        publisher: { "@id": organizationId },
        keywords: [
          "About Ask & Explore",
          "Practical Guides",
          "Informative Articles",
          "Technology Guides",
          "Buying Guides",
          "Automotive Advice",
          "Digital Safety Tips",
          "Lifestyle Guides",
          "Travel Planning Guides",
          "Product Comparisons",
        ],
        relatedLink: [
          "/authors/editorial-team",
          "/disclaimer",
          "/categories",
          "/articles",
          "/contact",
        ].map(url),
        breadcrumb: { "@id": breadcrumbId },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: url("/") },
          { "@type": "ListItem", position: 2, name: "About", item: pageUrl },
        ],
      },
    ],
  };
}
