export const site = {
  name: "Ask & Explore",
  description:
    "Fresh perspectives. Practical answers. Explore technology, cars, and the ideas that move everyday life forward.",
  url: process.env.SITE_URL || "http://localhost:3000",
  email: process.env.CONTACT_EMAIL || "",
};
export const isIndexable =
  Boolean(process.env.SITE_URL?.startsWith("https://")) &&
  (process.env.CONTEXT === undefined || process.env.CONTEXT === "production");
export const imageHosts = (process.env.IMAGE_REMOTE_HOSTS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
