import { test, expect } from "@playwright/test";

const secret = "e2e-independent-revalidation-secret-over-32-chars";
const slug = "electric-car-question";
const event = {
  event: "article.update",
  entity_id: "00000000-0000-4000-8000-000000000001",
  article_id: "00000000-0000-4000-8000-000000000001",
  slugs: [slug],
  tags: ["articles", `article:${slug}`],
};

test("public HTML is complete and cacheable, including a slug absent from the build", async ({
  request,
}) => {
  for (const path of [
    "/",
    "/categories",
    "/about",
    "/privacy",
    `/articles/${slug}`,
    "/articles/plain-reader",
  ]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["cache-control"], path).toContain(
        "s-maxage=60",
      );
      expect(response.headers()["cache-control"], path).not.toMatch(
        /private|no-store/,
      );
      expect(response.headers()["x-nextjs-postponed"], path).toBeUndefined();
      expect(response.headers()["set-cookie"], path).toBeUndefined();
      const html = await response.text();
      expect(html).toContain("ca-pub-2063885021384445");
      expect(html).toContain('rel="canonical"');
      if (path.startsWith("/articles/"))
        expect(html).toContain('id="article-content"');
    }
  }
});

test("request-dependent pages and private endpoints stay uncacheable", async ({
  request,
}) => {
  for (const path of [
    "/articles?tag=practical",
    "/category/technology?page=2",
    "/search?search=electric",
    "/contact?reason=correction",
  ]) {
    const response = await request.get(path);
    expect(response.headers()["cache-control"], path).toMatch(/no-store/);
  }
  const response = await request.post("/api/revalidate", { data: event });
  expect(response.status()).toBe(401);
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("a backend webhook removes and republishes cached public content without rebuilding", async ({
  request,
}) => {
  const invalidate = async () => {
    const response = await request.post("/api/revalidate", {
      headers: { Authorization: `Bearer ${secret}` },
      data: event,
    });
    expect(response.status()).toBe(200);
  };
  try {
    await request.post("http://127.0.0.1:4100/__control", {
      data: { hide: slug },
    });
    await invalidate();
    expect((await request.get(`/articles/${slug}`)).status()).toBe(404);
    await expect
      .poll(async () => (await request.get("/")).text())
      .not.toContain(`data-home-story="${slug}"`);
    await expect
      .poll(async () => (await request.get("/sitemap.xml")).text())
      .not.toContain(`/articles/${slug}`);
  } finally {
    await request.post("http://127.0.0.1:4100/__control", {
      data: { show: slug },
    });
    await invalidate();
  }
  await expect
    .poll(async () => (await request.get("/")).text())
    .toContain(`data-home-story="${slug}"`);
  const article = await request.get(`/articles/${slug}`);
  expect(article.status()).toBe(200);
  expect(await article.text()).toContain('id="article-content"');
  await expect
    .poll(async () => (await request.get("/sitemap.xml")).text())
    .toContain(`/articles/${slug}`);
});

test("an edit invalidates article HTML and metadata together", async ({
  request,
}) => {
  const title = "A revised electric car question";
  const control = (value: string | null) =>
    request.post("http://127.0.0.1:4100/__control", {
      data: { title: { slug, value } },
    });
  const invalidate = () =>
    request.post("/api/revalidate", {
      headers: { Authorization: `Bearer ${secret}` },
      data: event,
    });
  try {
    await control(title);
    expect((await invalidate()).status()).toBe(200);
    await expect
      .poll(async () => (await request.get(`/articles/${slug}`)).text())
      .toContain(`<h1>${title}</h1>`);
    const html = await (await request.get(`/articles/${slug}`)).text();
    expect(html).toContain(`${title} — An Ask &amp; Explore perspective`);
    expect(html).toContain(
      'href="https://ask-explore.test/articles/electric-car-question"',
    );
  } finally {
    await control(null);
    await invalidate();
  }
});

test("time-based revalidation discovers backend edits without a webhook", async ({
  request,
}) => {
  test.setTimeout(180000);
  const title = "An edit discovered by timed revalidation";
  const control = (value: string | null) =>
    request.post("http://127.0.0.1:4100/__control", {
      data: { title: { slug, value } },
    });
  const invalidate = () =>
    request.post("/api/revalidate", {
      headers: { Authorization: `Bearer ${secret}` },
      data: event,
    });
  await invalidate();
  const original = await (await request.get(`/articles/${slug}`)).text();
  expect(original).not.toContain(title);
  try {
    await control(title);
    // SWR may serve the previous HTML while the route/data entries refresh.
    await expect
      .poll(async () => (await request.get(`/articles/${slug}`)).text(), {
        timeout: 150000,
        intervals: [5000],
      })
      .toContain(`<h1>${title}</h1>`);
  } finally {
    await control(null);
    await invalidate();
  }
});
