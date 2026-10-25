import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security/headers";
import { exactImageHosts } from "./src/lib/security/urls";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/webp"],
    maximumRedirects: 0,
    dangerouslyAllowLocalIP: false,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'none'; script-src 'none'; sandbox;",
    remotePatterns: exactImageHosts(process.env.IMAGE_REMOTE_HOSTS).map(
      (hostname) => ({
        protocol: "https" as const,
        hostname,
        pathname: "/**",
      }),
    ),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({
          production: process.env.NODE_ENV === "production",
          publicApiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
          siteUrl: process.env.SITE_URL,
        }),
      },
    ];
  },
  cacheComponents: true,
  async redirects() {
    return [
      { source: "/tags/:slug", destination: "/tag/:slug", permanent: true },
    ];
  },
  partialPrefetching: true,
};

export default nextConfig;
