import { test, expect } from "@playwright/test";

test("About presents the new sections with complete images across screen sizes", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  await page.goto("/about");
  const about = page.locator("[data-about-page]");
  await expect(about.getByRole("heading", { level: 1 })).toHaveText(
    "Clear answers for everyday decisions.",
  );
  await expect(about.getByRole("region")).toHaveCount(7);
  await expect(page.locator(".site-header")).toHaveCount(1);
  await expect(page.locator(".site-footer")).toHaveCount(1);
  const topics = about.getByRole("region", {
    name: "Practical knowledge for everyday decisions.",
  });
  await expect(topics.getByRole("link")).toHaveCount(5);
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
        .getByRole("region", { name: "Explore Our Articles", exact: true })
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
    name: "Practical knowledge for everyday decisions.",
  });
  await expect(
    topics.getByRole("link", { name: /Technology/ }),
  ).toHaveAttribute("href", "/category/technology");
  await expect(
    topics.getByRole("link", { name: /Automotive/ }),
  ).toHaveAttribute("href", "/category/automotive");
  await expect(topics.getByRole("link", { name: /How To/ })).toHaveAttribute(
    "href",
    "/articles?article_type=tutorial",
  );
  // This fixture has no Lifestyle category; the card must stay useful without a broken category URL.
  await expect(topics.getByRole("link", { name: /Lifestyle/ })).toHaveAttribute(
    "href",
    "/search?search=Lifestyle",
  );
  await topics.getByRole("link", { name: /Buying Guides/ }).click();
  await expect(page).toHaveURL(/\/articles\?article_type=buying-guide$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/about");
  await page
    .locator("[data-about-page]")
    .getByRole("link", { name: "Browse the Articles" })
    .click();
  await expect(page).toHaveURL(/\/articles$/);
});
