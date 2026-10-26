import { backendCredentialsReady } from "@/lib/api/backend-auth";
import "server-only";
import {
  configuredApiUrl,
  exactImageHosts,
  safeHttpUrl,
} from "@/lib/security/urls";

const configuredSite = safeHttpUrl(
  process.env.SITE_URL || "http://localhost:3000",
);
if (
  !configuredSite ||
  new URL(configuredSite).search ||
  new URL(configuredSite).hash
)
  throw new Error(
    "SITE_URL must be an HTTP(S) URL without credentials, query parameters, or fragments.",
  );

export const site = {
  name: "Ask & Explore",
  description:
    "Practical guides, product comparisons and how-to articles on technology, cars and everyday life. Understand your options and choose with confidence.",
  url: configuredSite.replace(/\/$/, ""),
  email: process.env.CONTACT_EMAIL || "",
};
export const isIndexable =
  Boolean(process.env.SITE_URL?.startsWith("https://")) &&
  (process.env.CONTEXT === undefined || process.env.CONTEXT === "production");
export const imageHosts = exactImageHosts(process.env.IMAGE_REMOTE_HOSTS);
export const formsApiUrl =
  configuredApiUrl(process.env.API_BASE_URL) && backendCredentialsReady()
    ? "/"
    : "";
