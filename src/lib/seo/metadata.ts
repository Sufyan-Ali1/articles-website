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
  const indexable = isIndexable && !options.noindex;
  const image = socialImageUrl(options.image);
  const images = image
    ? [{ url: image }]
    : options.article
      ? []
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
    robots: {
      index: indexable,
      follow: true,
      ...(indexable ? { "max-image-preview": "large" as const } : {}),
    },
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
      card: images.length ? "summary_large_image" : "summary",
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

// Resolve site-relative assets; reject HTTP/private URLs rather than invent an
// HTTPS endpoint or emit a social image crawlers cannot fetch.
export function socialImageUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const candidate =
    value.startsWith("/") && !value.startsWith("//")
      ? new URL(value, site.url).href
      : value;
  const safe = safeHttpUrl(candidate);
  if (!safe) return null;
  const url = new URL(safe);
  if (
    /\.svg$/i.test(url.pathname) ||
    url.protocol !== "https:" ||
    url.port ||
    url.hostname === "localhost" ||
    url.hostname.endsWith(".localhost") ||
    url.hostname.endsWith(".local") ||
    url.hostname.includes(":") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)
  )
    return null;
  return url.href;
}
