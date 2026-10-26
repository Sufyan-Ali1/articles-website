import type { MetadataRoute } from "next";
import { isIndexable, site } from "@/lib/config";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(isIndexable
        ? { allow: "/", disallow: ["/api/", "/search"] }
        : { disallow: "/" }),
    },
    ...(isIndexable ? { sitemap: new URL("/sitemap.xml", site.url).href } : {}),
  };
}
