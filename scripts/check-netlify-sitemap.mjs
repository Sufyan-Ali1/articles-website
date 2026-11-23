// Production-build regression for Netlify's Date.now() cache-handler failure.
// Run with the same backend/SITE_URL settings as the preceding build.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { createServer } from "node:http";

const require = createRequire(import.meta.url);
const tagsPath =
  require.resolve("@netlify/plugin-nextjs/dist/run/handlers/tags-handler.cjs");
// Isolate remote tag storage so this check never writes Netlify cache state.
// The installed cache handler, including its clock access, runs unmodified.
require.cache[tagsPath] = {
  id: tagsPath,
  filename: tagsPath,
  loaded: true,
  exports: {
    getMostRecentTagExpirationTimestamp: async () => 0,
    isAnyTagStaleOrExpired: async () => ({ stale: false, expired: false }),
    markTagsAsStaleAndPurgeEdgeCache: async () => {},
  },
};
const { configureUseCacheHandlers } = await import(
  pathToFileURL(
    require.resolve("@netlify/plugin-nextjs/dist/run/handlers/use-cache-handler.js"),
  )
);
configureUseCacheHandlers();
const next = require("next");
const app = next({ dev: false, dir: process.cwd(), hostname: "127.0.0.1" });
await app.prepare();
const handle = app.getRequestHandler();
const server = createServer((request, response) => handle(request, response));
try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`${origin}/sitemap.xml`);
    const xml = await response.text();
    assert.equal(
      response.status,
      200,
      `Sitemap attempt ${attempt}: ${xml.slice(0, 100)}`,
    );
    assert.match(response.headers.get("content-type"), /application\/xml/);
    assert.match(xml, /<urlset\b/);
    assert.match(
      xml,
      /<loc>https:\/\//,
      "Use an indexable SITE_URL and populated backend for this check",
    );
    assert(
      !/s-maxage=[1-9]/.test(response.headers.get("cache-control") || ""),
      "The sitemap workaround must not force shared caching",
    );
    assert(!xml.includes("DYNAMIC_SERVER_USAGE"));
  }
  console.log(
    "Netlify sitemap regression passed: cold and warm cache-handler reads return complete XML without static-regeneration errors.",
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await new Promise((resolve) => server.close(resolve));
  await app.close();
}
