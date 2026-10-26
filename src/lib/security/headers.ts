import { configuredApiUrl, safeHttpUrl } from "./urls";

export function securityHeaders({
  production,
  apiUrl,
  siteUrl,
}: {
  production: boolean;
  apiUrl?: string;
  siteUrl?: string;
}) {
  const api = configuredApiUrl(apiUrl);
  const apiOrigin = api ? new URL(api).origin : "";
  const secureSite = safeHttpUrl(siteUrl)?.startsWith("https://");
  const directives = [
    "default-src 'self'",
    // Next's cached/PPR shell contains inline bootstrapping scripts. Nonces
    // require disabling PPR; never pretend a static nonce protects cached HTML.
    `script-src 'self' 'unsafe-inline'${production ? "" : " 'unsafe-eval'"}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https:${apiOrigin.startsWith("http:") ? ` ${apiOrigin}` : ""}`,
    "font-src 'self'",
    `connect-src 'self'${production ? "" : " ws: wss:"}`,
    "object-src 'none'",
    "base-uri 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    ...(production && secureSite && !apiOrigin.startsWith("http:")
      ? ["upgrade-insecure-requests"]
      : []),
  ];
  return [
    { key: "Content-Security-Policy", value: directives.join("; ") },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "X-XSS-Protection", value: "0" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    },
    ...(production && secureSite
      ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]
      : []),
  ];
}
