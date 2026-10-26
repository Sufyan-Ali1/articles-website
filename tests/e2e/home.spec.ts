import { test, expect } from "@playwright/test";

test("combined homepage renders distinct stories, active topics, and the version one footer", async ({
  page,
  isMobile,
}, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Practical Guides.*Smarter Everyday Choices/,
  );
  await expect(
    page.getByRole("heading", { name: "Latest Articles", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Editor’s Picks", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Reviews & Guides", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Popular with Readers", exact: true }),
  ).toBeVisible();
  const sections = await page
    .locator(
      "[data-homepage] section[aria-label], [data-homepage] nav[aria-label='Discover topics']",
    )
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("aria-label")),
    );
  expect(sections).toEqual([
    "Featured story",
    "Discover topics",
    "Explore by Category",
    "Latest Articles",
    "Editor's Picks",
    "Popular articles",
    "Reviews & Guides",
    "Stay curious",
  ]);
  const stories = await page
    .locator("[data-home-story]")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-home-story")),
    );
  expect(new Set(stories).size).toBe(stories.length);
  expect(stories.length).toBeGreaterThanOrEqual(10);
  await expect(
    page
      .getByRole("navigation", { name: "Discover topics" })
      .getByRole("link", { name: /Technology/ }),
  ).toHaveAttribute("href", "/category/technology");
  await expect(
    page
      .getByRole("region", { name: "Explore by Category" })
      .getByRole("link", { name: /Buying guides/ }),
  ).toHaveAttribute("href", "/articles?article_type=buying-guide");
  await expect(page.locator("body")).not.toContainText("Archived topic");
  await expect(
    page.locator(".site-footer").getByRole("heading", { name: "Quick Links" }),
  ).toBeVisible();
  await expect(
    page
      .locator(".site-footer")
      .getByRole("heading", { name: "Explore Topics" }),
  ).toBeVisible();
  await expect(
    page
      .locator(".site-footer")
      .getByRole("heading", { name: "Stay in Touch" }),
  ).toBeVisible();
  await expect(page.locator(".site-footer")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  for (const name of [
    "Homepage newsletter signup",
    "Footer newsletter signup",
  ]) {
    await expect(
      page.getByRole("form", { name }).getByRole("button"),
    ).toBeEnabled();
  }
  await page.evaluate(() => document.fonts.ready);
  await page
    .getByRole("region", { name: "Editor's Picks", exact: true })
    .screenshot({ path: testInfo.outputPath("homepage-editor-picks.png") });
  await page.screenshot({
    path: testInfo.outputPath("homepage-combined.png"),
    fullPage: true,
  });
  if (!isMobile) {
    await page.getByRole("button", { name: "Categories", exact: true }).click();
    await expect(page.locator("#categories-panel")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#categories-panel")).toBeHidden();
  }
  await page
    .getByRole("link", { name: "Suggest a Topic", exact: true })
    .click();
  await expect(page).toHaveURL(/\/request-article$/);
});

test("homepage keeps its content aligned with the navbar without horizontal overflow", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Latest Articles", exact: true }),
  ).toBeVisible();
  for (const width of [1440, 1024, 834, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const header = (await page.locator(".header-inner").boundingBox())!;
    const hero = (await page
      .getByRole("region", { name: "Featured story", exact: true })
      .boundingBox())!;
    expect(hero.x).toBe(header.x);
    expect(hero.width).toBe(header.width);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if ([1440, 834, 390].includes(width)) {
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: testInfo.outputPath(`homepage-${width}.png`),
      });
    }
  }
});

test("hero uses compact content spacing and complete images across screen sizes and rotation", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Latest Articles", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const sizes = [
    [1920, 1080],
    [1440, 900],
    [1366, 768],
    [1024, 600],
    [834, 1112],
    [768, 1024],
    [390, 844],
    [390, 667],
    [375, 667],
    [320, 568],
    [320, 480],
    [667, 375],
    [568, 320],
  ];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const intro = page.locator("[data-home-intro]");
    const padding = await page
      .getByRole("region", { name: "Featured story", exact: true })
      .evaluate((node) => [
        parseFloat(getComputedStyle(node).paddingTop),
        parseFloat(getComputedStyle(node).paddingBottom),
      ]);
    if (width <= 640) {
      expect(padding).toEqual([30, 28]);
    } else {
      expect(padding[0]).toBeGreaterThanOrEqual(36);
      expect(padding[0]).toBeLessThanOrEqual(60);
      expect(padding[0]).toBe(padding[1]);
    }
    const header = (await page.locator(".site-header").boundingBox())!;
    const introBounds = (await intro.boundingBox())!;
    expect(
      Math.abs(introBounds.y - header.y - header.height),
    ).toBeLessThanOrEqual(1);
    const hero = (await page
      .getByRole("region", { name: "Featured story", exact: true })
      .boundingBox())!;
    const heading = (await page
      .getByRole("heading", { level: 1 })
      .boundingBox())!;
    const button = (await page
      .getByRole("link", { name: "Explore Latest Articles", exact: true })
      .boundingBox())!;
    const image = (await page
      .locator("[data-home-intro] article")
      .boundingBox())!;
    const imageFrame = (await page
      .locator("[data-home-intro] .article-image")
      .boundingBox())!;
    const topics = (await page
      .getByRole("navigation", { name: "Discover topics" })
      .boundingBox())!;
    expect(
      heading.y,
      `Headline starts inside hero at ${width}×${height}`,
    ).toBeGreaterThanOrEqual(hero.y);
    expect(
      button.y + button.height,
      `CTA fits at ${width}×${height}`,
    ).toBeLessThanOrEqual(hero.y + hero.height + 1);
    expect(
      image.height,
      `Featured image remains visible at ${width}×${height}`,
    ).toBeGreaterThan(48);
    expect(image.y + image.height).toBeLessThanOrEqual(topics.y + 1);
    expect(
      Math.abs(imageFrame.height - (imageFrame.width * 9) / 16),
    ).toBeLessThan(1);
    expect(imageFrame.height).toBeGreaterThan(48);
    expect(imageFrame.y).toBeGreaterThanOrEqual(image.y - 1);
    expect(imageFrame.y + imageFrame.height).toBeLessThanOrEqual(
      image.y + image.height + 1,
    );
    expect(Math.abs(topics.y - hero.y - hero.height)).toBeLessThanOrEqual(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (
      ["1440x900", "390x844", "320x568", "568x320"].includes(
        `${width}x${height}`,
      )
    ) {
      await page.screenshot({
        path: testInfo.outputPath(`first-screen-${width}x${height}.png`),
      });
    }
  }
});
