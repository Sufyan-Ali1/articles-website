import type { Metadata } from "next";
import { isIndexable, site } from "@/lib/config";
import { safeHttpUrl } from "@/lib/security/urls";
export function metadata(
  title: string,
  description: string,
  path: string,
  options: {
    image?: string | null;
    noindex?: boolean;
    article?: boolean;
    published?: string | null;
    modified?: string;
    author?: string;
  } = {},
): Metadata {
  const canonical = new URL(path, site.url).href;
  const image = safeHttpUrl(options.image);
  const images = image
    ? [{ url: image }]
    : [
        {
          url: new URL("/opengraph-image", site.url).href,
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ];
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: isIndexable && !options.noindex, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      locale: "en_US",
      type: options.article ? "article" : "website",
      images,
      ...(options.article
        ? {
            publishedTime: options.published || undefined,
            modifiedTime: options.modified,
            authors: options.author ? [options.author] : undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}
export function safeJsonLd(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
