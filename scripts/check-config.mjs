const required = ["API_BASE_URL", "NEXT_PUBLIC_API_BASE_URL", "SITE_URL"];
let invalid = false;
for (const key of required) {
  try {
    const url = new URL(process.env[key] || "");
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      ["localhost", "127.0.0.1"].includes(url.hostname) ||
      url.pathname.endsWith("/api/v1")
    )
      throw new Error();
  } catch {
    console.error(
      `${key}: configure an absolute HTTPS production URL without credentials, query parameters, or /api/v1.`,
    );
    invalid = true;
  }
}
if ((process.env.NEXTJS_REVALIDATION_SECRET || "").length < 32) {
  console.error(
    "NEXTJS_REVALIDATION_SECRET: configure an independent secret of at least 32 characters.",
  );
  invalid = true;
}
if (
  process.env.CONTACT_EMAIL &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.CONTACT_EMAIL)
) {
  console.error(
    "CONTACT_EMAIL: use an approved valid address, or omit the setting.",
  );
  invalid = true;
}
if (!invalid)
  console.log(
    "Required production settings are present. Verify connectivity, CORS, webhook delivery, and image hosts on the deployed services.",
  );
process.exitCode = invalid ? 1 : 0;
