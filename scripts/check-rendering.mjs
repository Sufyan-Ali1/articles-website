import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const manifest = JSON.parse(
  await readFile(".next/prerender-manifest.json", "utf8"),
);
const paths = [
  "/",
  "/categories",
  "/about",
  "/authors/editorial-team",
  "/request-article",
  "/privacy",
  "/terms",
  "/disclaimer",
];
const articles = Object.entries(manifest.routes).filter(
  ([path, route]) =>
    path.startsWith("/articles/") && route.srcRoute === "/articles/[slug]",
);
assert(
  articles.length > 0,
  "Build must prerender at least one published article",
);
for (const path of [...paths, ...articles.map(([path]) => path)]) {
  const route = manifest.routes[path];
  assert(route, `${path}: missing prerender`);
  assert.equal(
    route.compute,
    "static",
    `${path}: requires request-time compute`,
  );
  assert.equal(
    route.initialRevalidateSeconds,
    60,
    `${path}: unexpected revalidation`,
  );
  assert.equal(route.initialExpireSeconds, 300, `${path}: unexpected expiry`);
}
assert(
  !manifest.routes["/sitemap.xml"],
  "Sitemap must retain the Netlify request-time workaround",
);
for (const path of ["/articles", "/contact", "/search"]) {
  assert.equal(
    manifest.routes[path]?.compute,
    "resuming",
    `${path}: request-dependent output must stay dynamic`,
  );
}
console.log(
  `Verified ${paths.length} public routes and ${articles.length} article prerenders; query-dependent pages remain dynamic.`,
);
