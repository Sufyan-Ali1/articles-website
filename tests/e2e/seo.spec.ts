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
  expect(schemas).toHaveLength(1);
  const article = schemas
    .flatMap((s) => JSON.parse(s)["@graph"] || [])
    .find((s) => s["@type"] === "BlogPosting");
  expect(article).toEqual(backend.data.schema["@graph"][0]);
  await page.goto("/");
  const website = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(
    JSON.parse(website!)["@graph"].find(
      (node: { "@type": string }) => node["@type"] === "WebSite",
    ),
  ).toMatchObject({
    "@type": "WebSite",
    name: "Ask & Explore",
    url: "https://ask-explore.test/",
  });
});

test("homepage sends branded metadata, content and linked schemas in server HTML", async ({
  page,
  request,
}) => {
  const title = "Ask & Explore | Practical Guides & Everyday Advice";
  const description =
    "Explore practical technology guides, car buying advice, product comparisons, digital safety tips, travel ideas, and lifestyle articles at Ask & Explore.";
  for (const agent of ["Mozilla/5.0", "Googlebot"]) {
    const response = await request.get("/", {
      headers: { "User-Agent": agent },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["x-robots-tag"] || "").not.toContain("noindex");
    const html = await response.text();
    const result = await page.evaluate((source) => {
      const doc = new DOMParser().parseFromString(source, "text/html");
      return {
        titles: [...doc.querySelectorAll("title")].map((n) => n.textContent),
        canonical: [...doc.querySelectorAll('link[rel="canonical"]')].map((n) =>
          n.getAttribute("href"),
        ),
        tags: [...doc.querySelectorAll("meta")].map((n) => ({
          name: n.getAttribute("name") || n.getAttribute("property"),
          content: n.getAttribute("content"),
        })),
        headings: [...doc.querySelectorAll("h1")].map((n) => n.textContent),
        schemas: [
          ...doc.querySelectorAll('script[type="application/ld+json"]'),
        ].map((n) => JSON.parse(n.textContent || "null")),
        links: doc.querySelectorAll('a[href^="/articles/"]').length,
      };
    }, html);
    expect(result.titles).toEqual([title]);
    expect(result.canonical).toEqual(["https://ask-explore.test/"]);
    for (const [name, content] of Object.entries({
      description,
      robots: "index, follow, max-image-preview:large",
      "og:title": title,
      "og:description": description,
      "og:url": "https://ask-explore.test/",
      "og:site_name": "Ask & Explore",
      "og:type": "website",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:card": "summary_large_image",
    })) {
      expect(result.tags.filter((tag) => tag.name === name)).toEqual([
        { name, content },
      ]);
    }
    expect(result.headings).toHaveLength(1);
    expect(result.headings[0]).toContain("Ask & Explore");
    expect(result.links).toBeGreaterThan(0);
    expect(result.schemas).toHaveLength(1);
    const graph = result.schemas[0]["@graph"];
    expect(graph).toHaveLength(4);
    const website = graph.find(
      (s: { "@type": string }) => s["@type"] === "WebSite",
    );
    const organization = graph.find(
      (s: { "@type": string }) => s["@type"] === "Organization",
    );
    expect(website).toMatchObject({
      name: "Ask & Explore",
      alternateName: "askandexplore.com",
      publisher: { "@id": organization["@id"] },
    });
    expect(organization).toMatchObject({
      name: "Ask & Explore",
      url: "https://ask-explore.test/",
      logo: {
        "@type": "ImageObject",
        url: "https://ask-explore.test/images/brand/ae-mark.svg",
      },
    });
    const webpage = graph.find(
      (s: { "@type": string }) => s["@type"] === "WebPage",
    );
    const categories = graph.find(
      (s: { "@type": string }) => s["@type"] === "ItemList",
    );
    expect(webpage.mainEntity).toEqual({ "@id": categories["@id"] });
    expect(categories.numberOfItems).toBe(6);
    expect(
      categories.itemListElement.map((item: { name: string }) => item.name),
    ).toEqual([
      "Automotive",
      "Technology",
      "Buying Guides",
      "Lifestyle",
      "Digital Safety",
      "Travel",
    ]);
  }
  const preview = await request.get("/opengraph-image");
  expect(preview.ok()).toBe(true);
  expect(preview.headers()["content-type"]).toContain("image/png");
  const png = await preview.body();
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});

test("article metadata and publisher are generated for optional-field fallbacks and public pages", async ({
  page,
  request,
}) => {
  for (const slug of ["electric-car-question", "plain-reader"]) {
    const backend = await (
      await request.get(`http://127.0.0.1:4100/api/v1/articles/${slug}`)
    ).json();
    const response = await request.get(`/articles/${slug}`, {
      headers: { "User-Agent": "Googlebot" },
    });
    expect(response.status()).toBe(200);
    await page.setContent(await response.text());
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      backend.data.meta_title || backend.data.title,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "article",
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `https://ask-explore.test/articles/${slug}`,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index, follow, max-image-preview:large",
    );
    // The existing mock images are SVGs; social networks require raster images.
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary",
    );
    const schemas = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const article = schemas
      .flatMap((s) => JSON.parse(s)["@graph"] || [])
      .find((s) => s["@type"] === "BlogPosting");
    await expect(page.locator('meta[name="keywords"]')).toHaveCount(0);
    if (slug === "plain-reader") expect(article).not.toHaveProperty("keywords");
    else
      expect(article.keywords).toEqual([
        "practical guide",
        "everyday decisions",
      ]);
    expect(article.publisher).toEqual({
      "@id": "https://ask-explore.test/#organization",
    });
  }
  for (const path of [
    "/",
    "/categories",
    "/articles",
    "/category/technology",
    "/about",
  ]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index, follow, max-image-preview:large",
    );
    const schemas = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).flatMap((s) => {
      const value = JSON.parse(s);
      return value["@graph"] || [value];
    });
    expect(
      schemas.some(
        (s) =>
          s.publisher?.["@id"] === "https://ask-explore.test/#organization",
      ),
    ).toBe(true);
  }
  for (const slug of ["draft-reader", "scheduled-reader"]) {
    const response = await request.get(`/articles/${slug}`);
    const html = await response.text();
    expect(html).toContain("noindex");
    expect(html).not.toContain('id="article-content"');
    expect(html).not.toContain('"@type":"BlogPosting"');
  }
});
