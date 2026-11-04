import { test, expect } from "@playwright/test";

test("missing content and out-of-range archives return real 404 responses", async ({
  request,
}) => {
  for (const agent of ["Mozilla/5.0", "Googlebot", "bingbot"]) {
    for (const path of [
      "/articles/not-a-published-story",
      "/category/not-a-topic",
      "/articles?page=999",
      "/category/technology?page=999",
    ]) {
      const response = await request.get(path, {
        headers: { "User-Agent": agent },
      });
      expect(response.status(), `${agent} ${path}`).toBe(404);
      expect(await response.text()).toContain("noindex");
    }
  }
  const valid = await request.get("/articles?page=2");
  expect(valid.status()).toBe(200);
  expect(await valid.text()).toContain(
    'href="https://ask-explore.test/articles?page=2"',
  );
});

test("sitemap excludes tag and empty-category archives; search noindex is crawlable", async ({
  request,
}) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).not.toMatch(/\/tags?\//);
  expect(xml).not.toContain("/category/empty-topic");
  expect(xml).toContain("/category/technology");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).not.toContain("Disallow: /search");
  expect(await (await request.get("/search?search=electric")).text()).toContain(
    'name="robots" content="noindex, follow"',
  );
  const empty = await (await request.get("/category/empty-topic")).text();
  expect(empty).toContain('name="robots" content="noindex, follow"');
});

test("article schema is preserved from the backend and homepage identifies the website", async ({
  page,
  request,
}) => {
  const backend = await (
    await request.get(
      "http://127.0.0.1:4100/api/v1/articles/electric-car-question",
    )
  ).json();
  await page.goto("/articles/electric-car-question");
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(schemas).toHaveLength(2);
  const article = schemas
    .map((s) => JSON.parse(s))
    .find((s) => s["@type"] === "Article");
  expect(article).toEqual(backend.data.schema);
  await page.goto("/");
  const website = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(JSON.parse(website!)).toMatchObject({
    "@type": "WebSite",
    name: "Ask & Explore",
    url: "https://ask-explore.test",
  });
});
