import { test, expect } from "@playwright/test";

test("editorial profile has discoverable metadata and an honest empty state", async ({
  page,
  request,
}) => {
  await page.goto("/authors/editorial-team");
  await expect(page.locator("h1")).toHaveText("Ask & Explore Editorial Team");
  await expect(page).toHaveTitle(
    "Ask & Explore Editorial Team | Author Profile & Standards",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Meet the Ask & Explore Editorial Team. Learn about our shared author profile, research principles, editorial standards, and the practical guides we publish.",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Ask & Explore Editorial Team | Author Profile",
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    "Learn about the Ask & Explore Editorial Team, our editorial principles, research approach, and practical guides.",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://ask-explore.test/authors/editorial-team",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
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
  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  const schema = JSON.parse((await jsonLd.textContent())!);
  expect(schema["@context"]).toBe("https://schema.org");
  expect(schema["@graph"]).toHaveLength(4);
  expect(schema["@graph"][0]).toMatchObject({
    "@type": "ProfilePage",
    "@id": "https://ask-explore.test/authors/editorial-team#webpage",
    mainEntity: {
      "@id": "https://ask-explore.test/authors/editorial-team#author",
    },
    inLanguage: "en",
  });
  await expect(
    page.getByText("No articles are currently attributed", { exact: false }),
  ).toBeVisible();
  await expect(
    page
      .locator('section[aria-labelledby="expertise"]')
      .getByRole("link", { name: "Technology", exact: true }),
  ).toHaveAttribute("href", "/category/technology");
  for (const id of ["expertise", "explore"]) {
    const section = page.locator(`section[aria-labelledby="${id}"]`);
    await expect(section.locator("ul").getByRole("link")).toHaveCount(6);
    await expect(
      section.getByRole("link", { name: "Technology", exact: true }),
    ).toHaveAttribute("href", "/category/technology");
    await expect(
      section.getByRole("link", { name: "Buying Guides", exact: true }),
    ).toHaveAttribute("href", "/articles?article_type=buying-guide");
    await expect(
      section.getByRole("link", { name: "Travel", exact: true }),
    ).toHaveAttribute("href", "/search?search=Travel");
  }
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
    const explore = page.locator('section[aria-labelledby="explore"]');
    const banner = (await explore.locator(":scope > div").boundingBox())!;
    const topics = (await explore.locator("ul").boundingBox())!;
    expect(topics.y - banner.y - banner.height).toBeGreaterThanOrEqual(27);
    const card = explore.locator("li").first();
    const cardBox = (await card.boundingBox())!;
    const iconBox = (await card.locator("svg").boundingBox())!;
    expect(
      Math.abs(iconBox.x + iconBox.width / 2 - cardBox.x - cardBox.width / 2),
    ).toBeLessThanOrEqual(1);
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
