import assert from "node:assert/strict";
import { setCacheControlHeaders } from "../node_modules/@netlify/plugin-nextjs/dist/run/headers.js";

// Exercise the installed adapter, rather than assuming it forwards Next's TTLs.
function adapt(cacheControl, method = "GET", cacheStatus) {
  const headers = new Headers({ "cache-control": cacheControl });
  if (cacheStatus) headers.set("x-nextjs-cache", cacheStatus);
  setCacheControlHeaders(
    { headers, status: 200 },
    new Request("https://site.test/", { method }),
    {},
  );
  return headers;
}
const cached = adapt("s-maxage=60, stale-while-revalidate=240", "GET", "HIT");
assert.equal(
  cached.get("netlify-cdn-cache-control"),
  "s-maxage=60, stale-while-revalidate=240, durable",
);
assert.equal(cached.get("cache-control"), "public, max-age=0, must-revalidate");
for (const method of ["GET", "HEAD", "POST"]) {
  const privateResponse = adapt("private, no-store", method);
  assert(
    !privateResponse.get("netlify-cdn-cache-control")?.includes("s-maxage"),
  );
  assert.equal(privateResponse.get("cache-control"), "private, no-store");
}
const stale = adapt("s-maxage=60, stale-while-revalidate=240", "GET", "STALE");
assert.equal(
  stale.get("netlify-cdn-cache-control"),
  "public, max-age=0, must-revalidate, durable",
);
console.log(
  "Installed Netlify adapter preserves ISR TTLs, avoids caching stale responses, and keeps private responses uncacheable.",
);
