import { test, expect } from "@playwright/test";

test("editorial profile has discoverable metadata and an honest empty state", async ({
  page,
  request,
}) => {
  await page.goto("/authors/editorial-team");
  await expect(page.locator("h1")).toHaveText("Ask & Explore Editorial Team");
  await expect(page).toHaveTitle(
    "Ask & Explore Editorial Team: Our Authors & Standards",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ask-explore.test/authors/editorial-team",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index, follow, max-image-preview:large",
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "website",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    0,
  );
  await expect(
    page.getByText("No articles are currently attributed", { exact: false }),
  ).toBeVisible();
  await expect(
    page.locator("main").getByRole("link", { name: "Technology", exact: true }),
  ).toHaveAttribute("href", "/category/technology");
  expect(await (await request.get("/sitemap.xml")).text()).toContain(
    "/authors/editorial-team",
  );
  await expect(page.locator("main section")).toHaveCount(12);
  const question = page.getByText("Who writes the articles on Ask & Explore?", {
    exact: true,
  });
  await question.click();
  await expect(page.locator("details").first()).toHaveAttribute("open", "");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.screenshot({
    path: "test-results/editorial-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.screenshot({
    path: "test-results/editorial-mobile.png",
    fullPage: true,
  });
  await page.goto("/authors/editorial-team");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
});
