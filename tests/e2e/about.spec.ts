import { test, expect } from "@playwright/test";

test("About presents the new sections with complete images across screen sizes", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  await page.goto("/about");
  await expect(page).toHaveTitle(
    "About Ask & Explore | Our Mission & Editorial Approach",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Learn about Ask & Explore, our practical guides, the topics we cover, and our approach to accuracy, transparency, and helping readers make informed choices.",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "About Ask & Explore | Practical Guides & Editorial Values",
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    "Discover what Ask & Explore publishes, our six main topics, and the editorial principles behind our guides, comparisons, and everyday advice.",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ask-explore.test/about",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://ask-explore.test/about",
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "website",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://ask-explore.test/images/about/workspace.webp",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index, follow, max-image-preview:large",
  );
  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  const graph = JSON.parse((await jsonLd.textContent())!)["@graph"];
  expect(graph.map((node: { "@type": string }) => node["@type"])).toEqual([
    "Organization",
    "WebSite",
    "AboutPage",
    "BreadcrumbList",
  ]);
  expect(graph[2]).toMatchObject({
    "@id": "https://ask-explore.test/about#webpage",
    mainEntity: { "@id": "https://ask-explore.test/#organization" },
    breadcrumb: { "@id": "https://ask-explore.test/about#breadcrumb" },
  });
  expect(graph[3].itemListElement).toEqual([
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://ask-explore.test/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "About",
      item: "https://ask-explore.test/about",
    },
  ]);
  const about = page.locator("[data-about-page]");
  await expect(about.getByRole("heading", { level: 1 })).toHaveText(
    "About Ask & Explore: Practical Guides for Everyday Life",
  );
  await expect(about.getByRole("region")).toHaveCount(7);
  await expect(page.locator(".site-header")).toHaveCount(1);
  await expect(page.locator(".site-footer")).toHaveCount(1);
  const topics = about.getByRole("region", {
    name: "Explore Practical Guides Across Everyday Topics",
  });
  await expect(topics.getByRole("link")).toHaveCount(6);
  // Wait for streamed classification links, rather than capturing the fallback.
  await expect(
    topics.getByRole("link", { name: /Buying Guides/ }),
  ).toHaveAttribute("href", "/articles?article_type=buying-guide");
  const newsletter = about.getByRole("form", {
    name: "About page newsletter signup",
  });
  await expect(newsletter.getByRole("textbox")).toBeEnabled();
  await expect(newsletter.getByRole("button")).toBeEnabled();

  for (const width of [1920, 1440, 1280, 1024, 834, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const nav = (await page.locator(".header-inner").boundingBox())!;
    const shell = (await about.locator(":scope > div").boundingBox())!;
    expect(Math.abs(shell.x - nav.x)).toBeLessThan(1);
    expect(Math.abs(shell.width - nav.width)).toBeLessThan(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const image of await about.getByRole("img").all()) {
      const box = (await image.boundingBox())!;
      expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThan(1);
      await expect(image).toHaveCSS("object-fit", "contain");
    }
    if ([1440, 834, 390].includes(width)) {
      // Load all lazy images before taking a complete page preview.
      for (const image of await about.getByRole("img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
          )
          .toBeGreaterThan(0);
      }
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: testInfo.outputPath(`about-${width}.png`),
        fullPage: true,
      });
      await about
        .getByRole("region", {
          name: "Find Practical Guides for Your Next Question",
          exact: true,
        })
        .screenshot({
          path: testInfo.outputPath(`explore-banner-${width}.png`),
        });
    }
  }
  for (const image of await about.getByRole("img").all()) {
    const size = await image.evaluate((node) => ({
      width: (node as HTMLImageElement).naturalWidth,
      height: (node as HTMLImageElement).naturalHeight,
    }));
    // Responsive image optimization rounds output dimensions to whole pixels.
    expect(Math.abs(size.height - (size.width * 9) / 16)).toBeLessThanOrEqual(
      1,
    );
  }
});

test("About topic cards and the article CTA lead to real browsing routes", async ({
  page,
}) => {
  await page.goto("/about");
  const about = page.locator("[data-about-page]");
  const topics = about.getByRole("region", {
    name: "Explore Practical Guides Across Everyday Topics",
  });
  await expect(
    topics.getByRole("link", { name: /Technology/ }),
  ).toHaveAttribute("href", "/category/technology");
  await expect(
    topics.getByRole("link", { name: /Automotive/ }),
  ).toHaveAttribute("href", "/category/automotive");
  await expect(
    topics.getByRole("link", { name: /Digital Safety/ }),
  ).toHaveAttribute("href", "/search?search=Digital%20Safety");
  // This fixture has no Lifestyle category; the card must stay useful without a broken category URL.
  await expect(topics.getByRole("link", { name: /Lifestyle/ })).toHaveAttribute(
    "href",
    "/search?search=Lifestyle",
  );
  await expect(topics.getByRole("link", { name: /Travel/ })).toHaveAttribute(
    "href",
    "/search?search=Travel",
  );
  await topics.getByRole("link", { name: /Buying Guides/ }).click();
  await expect(page).toHaveURL(/\/articles\?article_type=buying-guide$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/about");
  await page
    .locator("[data-about-page]")
    .getByRole("link", { name: "Explore All Articles" })
    .click();
  await expect(page).toHaveURL(/\/articles$/);
});
