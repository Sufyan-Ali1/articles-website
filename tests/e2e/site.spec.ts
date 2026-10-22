import { test, expect } from "@playwright/test";
const secret = "e2e-independent-revalidation-secret-over-32-chars";
test("editorial home renders real API content and links to articles", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /electric car question/i,
  );
  await expect(
    page.getByRole("heading", { name: "The latest perspectives" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /electric car question/i }).first(),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Archived topic");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("heading", { name: /electric car question/i })
    .first()
    .getByRole("link")
    .click();
  await expect(page).toHaveURL(/articles\/electric-car-question/);
});
test("article HTML, TOC, disclosure, sharing, and metadata", async ({
  page,
}) => {
  await page.goto("/articles/electric-car-question");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /electric car question/,
  );
  await expect(page.locator("#article-content h2").first()).toHaveAttribute(
    "id",
    "the-questions-worth-asking",
  );
  await expect(page.locator("#the-questions-worth-asking-2")).toBeAttached();
  await expect(
    page.getByRole("region", { name: "Article table" }),
  ).toBeAttached();
  await expect(
    page.getByText("This article contains links marked as sponsored."),
  ).toBeVisible();
  await expect(page.getByText(/\d+ min read/)).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ask-explore.test/articles/electric-car-question",
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "article",
  );
  expect(await page.locator('script[type="application/ld+json"]').count()).toBe(
    2,
  );
  await expect(
    page.getByRole("button", { name: "Copy link" }).last(),
  ).toBeAttached();
});
test("GET filters synchronize URLs and pagination preserves them", async ({
  page,
}) => {
  await page.goto("/articles?page=2");
  await expect(
    page.getByRole("link", { name: "Page 2", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.getByLabel("Category", { exact: true }).selectOption("technology");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page).toHaveURL(/category=technology/);
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  await expect(page.locator(".results-info")).toContainText("6 articles");
  await page.goto("/articles");
  await page.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
});
test("search returns only matching titles and handles empty and error responses", async ({
  page,
}) => {
  await page.goto("/search");
  await page.getByLabel("Search article titles").fill("electric");
  await page
    .getByRole("button", { name: "Search articles", exact: true })
    .click();
  await expect(page).toHaveURL(/search=electric/);
  await expect(page.locator(".results-info")).toContainText("2 articles");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await page.getByLabel("Search article titles").fill("no-matching-title");
  await page
    .getByRole("button", { name: "Search articles", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /No stories match/ }),
  ).toBeVisible();
  await page.goto("/search?search=simulate-outage");
  await expect(
    page.getByRole("heading", { name: /pick up where we left off/ }),
  ).toBeVisible();
});
test("category hierarchy, direct membership, tags, and not found", async ({
  page,
}) => {
  await page.goto("/categories");
  await expect(
    page.getByRole("link", { name: "Everyday tech", exact: true }).last(),
  ).toBeVisible();
  await page.goto("/category/technology");
  await expect(
    page.getByRole("heading", { name: "Technology", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".results-info")).toContainText("6 articles");
  await page.goto("/tag/practical-choices");
  await expect(page.locator(".results-info")).toContainText("15 articles");
  await expect(
    page.getByRole("link", { name: "Next", exact: true }),
  ).toHaveAttribute("href", "/tag/practical-choices?page=2");
  await page.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ask-explore.test/tag/practical-choices?page=2",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /^index, follow$/,
  );

  await page.goto("/category/archived-topic");
  await expect(
    page.getByRole("heading", { name: /off the beaten path/ }),
  ).toBeVisible();
  await page.goto("/articles/not-a-published-story");
  await expect(
    page.getByRole("heading", { name: /off the beaten path/ }),
  ).toBeVisible();
});
test("topic submission validates and succeeds without admin data", async ({
  page,
}) => {
  await page.goto("/request-article");
  await page.getByRole("button", { name: "Send your suggestion" }).click();
  await expect(page.getByText(/Tell us the topic/)).toBeVisible();
  await page
    .getByLabel(/What should we explore/)
    .fill("How does home charging work?");
  await page.getByRole("button", { name: "Send your suggestion" }).click();
  await expect(
    page.getByRole("heading", { name: "Curiosity, received." }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText("admin_notes");
});
test("topic submission handles backend validation and Retry-After", async ({
  page,
}) => {
  await page.goto("/request-article");
  await page.getByLabel(/What should we explore/).fill("server-invalid");
  await page.getByRole("button", { name: "Send your suggestion" }).click();
  await expect(page.getByText(/check this field/)).toBeVisible();
  await page.getByLabel(/What should we explore/).fill("rate-limit-test");
  await page.getByRole("button", { name: "Send your suggestion" }).click();
  await expect(page.locator(".topic-form [role=alert]")).toContainText(
    "wait before trying",
  );
  await expect(
    page.getByRole("button", { name: "Send your suggestion" }),
  ).toBeDisabled();
});
test("uncached detail visibility, webhook security, and former-slug invalidation", async ({
  page,
  request,
}) => {
  await page.goto("/articles/replace-or-repair");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /replace an everyday device/,
  );
  await request.post("http://127.0.0.1:4100/__control", {
    data: { hide: "replace-or-repair" },
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /off the beaten path/ }),
  ).toBeVisible();
  await request.post("http://127.0.0.1:4100/__control", {
    data: { show: "replace-or-repair" },
  });
  const entity_id = "00000000-0000-4000-8000-000000000014";
  const data = {
    event: "article.update",
    entity_id,
    article_id: entity_id,
    slugs: ["replace-or-repair", "previous-slug"],
    tags: [
      "articles",
      `article:${entity_id}`,
      "article:replace-or-repair",
      "article:previous-slug",
    ],
  };
  expect((await request.post("/api/revalidate", { data })).status()).toBe(401);
  expect(
    (
      await request.post("/api/revalidate", {
        data: { ...data, tags: ["private"] },
        headers: { Authorization: `Bearer ${secret}` },
      })
    ).status(),
  ).toBe(400);
  const good = await request.post("/api/revalidate", {
    data,
    headers: { Authorization: `Bearer ${secret}` },
  });
  expect(good.status()).toBe(200);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /replace an everyday device/,
  );
});
test("sitemap, robots, static pages, and mobile navigation", async ({
  page,
  request,
  isMobile,
}) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain(
    "https://ask-explore.test/articles/electric-car-question",
  );
  expect(xml).not.toContain("archived-topic");
  expect(xml).not.toContain("/search");
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /search",
  );
  for (const path of [
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/disclaimer",
  ]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
  }
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "All articles", exact: true })
      .click();
    await expect(page).toHaveURL(/\/articles$/);
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
});

test("responsive visual review and local performance diagnostics", async ({
  page,
  isMobile,
}, testInfo) => {
  await page.addInitScript(() => {
    const metrics = { lcp: 0, cls: 0, longestInteraction: 0 };
    Object.assign(window, { __publicationMetrics: metrics });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) metrics.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!shift.hadRecentInput) metrics.cls += shift.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        metrics.longestInteraction = Math.max(
          metrics.longestInteraction,
          entry.duration,
        );
    }).observe({
      type: "event",
      buffered: true,
      durationThreshold: 16,
    } as PerformanceObserverInit);
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "The latest perspectives" }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: testInfo.outputPath("home.png"),
    fullPage: false,
  });
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close menu" }).click();
  }
  const metrics = await page.evaluate(
    () =>
      (
        window as unknown as {
          __publicationMetrics: {
            lcp: number;
            cls: number;
            longestInteraction: number;
          };
        }
      ).__publicationMetrics,
  );
  await testInfo.attach("local-performance.json", {
    body: JSON.stringify(
      {
        ...metrics,
        note: "Unthrottled local fixture content; interaction timing is diagnostic, not field INP.",
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  if (!isMobile) {
    await page.setViewportSize({ width: 834, height: 1112 });
    await page.screenshot({ path: testInfo.outputPath("home-tablet.png") });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.setViewportSize({ width: 1280, height: 900 });
  }
  await page.goto("/articles/electric-car-question");
  await expect(page.locator("#article-content")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("article-top.png") });
  await page.locator("#article-content").scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("article-reading.png") });
  for (const route of [
    "contact",
    "about",
    "articles",
    "categories",
    "search",
    "request-article",
    "privacy",
  ]) {
    await page.goto(`/${route}`);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("main .skeleton")).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: testInfo.outputPath(`${route}.png`),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  if (isMobile) {
    await page.setViewportSize({ width: 320, height: 740 });
    for (const route of [
      "",
      "contact",
      "articles",
      "categories",
      "request-article",
    ]) {
      await page.goto(`/${route}`);
      await expect(page.locator("main h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
});

test("view controls preserve browsing state and search highlights titles", async ({
  page,
}) => {
  await page.goto("/articles?category=technology");
  await page.getByRole("link", { name: "List view", exact: true }).click();
  await expect(page).toHaveURL(/view=list/);
  await expect(page.locator(".article-list")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ask-explore.test/articles?category=technology",
  );
  await page.goto("/search?search=electric");
  await expect(page.locator(".card-title mark").first()).toHaveText(
    /electric/i,
  );
  await page.getByRole("link", { name: /Remove filter/ }).click();
  await expect(page).not.toHaveURL(/search=electric/);
});
test("contact receives correction context and submits through the Netlify static endpoint", async ({
  page,
}) => {
  await page.goto("/articles/electric-car-question");
  await page
    .getByRole("link", { name: "Suggest a correction", exact: true })
    .click();
  await expect(page).toHaveURL(/reason=correction/);
  await expect(
    page.getByRole("radio", { name: "Suggest a correction" }),
  ).toBeChecked();
  await expect(page.getByLabel(/Article link/)).toHaveValue(
    "https://ask-explore.test/articles/electric-car-question",
  );
  let submitted = "";
  await page.route("**/__forms.html", async (route) => {
    submitted = route.request().postData() || "";
    await route.fulfill({
      status: 200,
      body: "Accepted by the test submission handler",
    });
  });
  await page.getByLabel(/Email address/).fill("reader@example.com");
  await page
    .getByLabel(/Your message/)
    .fill("Please check the charging specification in this article.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Thanks for/ })).toBeVisible();
  expect(new URLSearchParams(submitted).get("form-name")).toBe("contact");
});
test("contact errors preserve input and the topic starter does not replace a draft", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.route("**/__forms.html", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.getByLabel(/Email address/).fill("reader@example.com");
  await page
    .getByLabel(/Your message/)
    .fill("A general question about the publication.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".contact-form-panel [role=alert]")).toContainText(
    /couldn’t confirm delivery/,
  );
  await expect(page.getByLabel(/Your message/)).toHaveValue(
    "A general question about the publication.",
  );
  await page.goto("/request-article");
  await page.getByLabel(/What should we explore/).fill("My existing question");
  await page
    .getByRole("button", { name: "Compare options", exact: true })
    .click();
  await expect(page.getByLabel(/What should we explore/)).toHaveValue(
    "My existing question",
  );
});
test("topic directory, desktop topics menu, and policy anchors", async ({
  page,
  isMobile,
}) => {
  await page.goto("/categories");
  await page.getByRole("searchbox", { name: "Find a topic" }).fill("everyday");
  await expect(
    page.getByRole("heading", { name: "Everyday tech", exact: true }),
  ).toBeVisible();
  if (!isMobile) {
    await page.getByRole("button", { name: "Topics", exact: true }).click();
    await expect(page.locator("#topics-panel")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#topics-panel")).not.toBeVisible();
  }
  await page.goto("/privacy");
  await page
    .getByRole("navigation", { name: "Document contents" })
    .getByRole("link", { name: /Contact messages/ })
    .click();
  await expect(page).toHaveURL(/#contact-messages/);
  await expect(
    page.getByRole("heading", { name: "Contact messages", exact: true }),
  ).toBeVisible();
});
