import publication from "@/lib/publication.json";
import { site } from "@/lib/config";

export function websiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    description: publication.description,
    alternateName: "Ask and Explore",
    url: new URL("/", site.url).href,
    publisher: { "@id": `${site.url}/#organization` },
  };
}

export function organizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    logo: publication.logo,
    description: publication.description,
  };
}

export function pageStructuredData(
  path: string,
  name: string,
  type: "WebPage" | "AboutPage" | "CollectionPage",
) {
  const url = new URL(path, site.url).href;
  const { "@context": context, ...publisher } = organizationStructuredData();
  const { "@context": _context, ...website } = websiteStructuredData();
  void _context;
  return {
    "@context": context,
    "@graph": [
      publisher,
      website,
      {
        "@type": type,
        "@id": `${url}#webpage`,
        url,
        name,
        inLanguage: "en",
        isPartOf: { "@id": `${site.url}/#website` },
        publisher: { "@id": publisher["@id"] },
      },
    ],
  };
}
