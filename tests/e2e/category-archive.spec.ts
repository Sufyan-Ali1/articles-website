import { test, expect } from "@playwright/test";

test("category detail shares the article archive design and uses the full width without a category panel", async ({
  page,
}, testInfo) => {
  await page.goto("/category/technology");
  const category = page.locator("[data-category-page]");
  await expect(category.getByRole("heading", { level: 1 })).toHaveText(
    "Technology",
  );
  await expect(category.locator("[data-archive-story]")).toHaveCount(6);
  await expect(category.locator(".results-info")).toContainText("6 articles");
  await expect(category.locator("[data-archive-sidebar]")).toHaveCount(0);
  await expect(
    category.getByRole("navigation", {
      name: "Filter articles by category",
      includeHidden: true,
    }),
  ).toHaveCount(0);
  await expect(category.locator("details")).toHaveCount(0);
  const form = category.getByRole("search", {
    name: "Filter published articles",
  });
  await expect(form).toHaveAttribute("action", "/category/technology");
  await expect(form.locator('input[name="category"]')).toHaveCount(0);
  await expect(
    category.getByRole("navigation", { name: "Article types" }),
  ).toBeVisible();
  await expect(
    category
      .getByRole("form", { name: "Articles newsletter signup" })
      .getByRole("button"),
  ).toBeDisabled();
  for (const width of [1920, 1440, 1024, 834, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const nav = (await page.locator(".header-inner").boundingBox())!;
    const results = (await category
      .getByRole("region", { name: "Published articles" })
      .boundingBox())!;
    expect(Math.abs(results.x - nav.x)).toBeLessThan(1);
    expect(Math.abs(results.width - nav.width)).toBeLessThan(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const image of await category.getByRole("img").all()) {
      const box = (await image.boundingBox())!;
      expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThan(1);
      await expect(image).toHaveCSS("object-fit", "contain");
    }
    if ([1440, 834, 390].includes(width)) {
      for (const image of await category.getByRole("img").all()) {
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
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await page.screenshot({
        path: testInfo.outputPath(`category-archive-${width}.png`),
        fullPage: true,
      });
    }
  }
});

test("category article filters, resets, and page changes stay within the category", async ({
  page,
}) => {
  await page.goto("/category/technology?category=automotive");
  const category = page.locator("[data-category-page]");
  await expect(category.locator("[data-archive-story]")).toHaveCount(6);
  await expect(
    category.locator('[data-archive-story="electric-car-question"]'),
  ).toHaveCount(0);
  await expect(
    category.locator('[data-archive-story="home-network"]'),
  ).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ask-explore.test/category/technology",
  );
  await category.getByRole("link", { name: "List view", exact: true }).click();
  await expect(page).toHaveURL(/\/category\/technology\?view=list$/);
  await expect(category.locator(".article-list")).toBeVisible();
  const types = category.getByRole("navigation", { name: "Article types" });
  await types.getByRole("link", { name: "Reviews", exact: true }).click();
  await expect(page).toHaveURL(
    /\/category\/technology\?article_type=review&view=list$/,
  );
  await expect(
    types.getByRole("link", { name: "Reviews", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await category
    .getByRole("combobox", { name: "Sort articles" })
    .selectOption("title");
  await expect(page).toHaveURL(/sort=title/);
  expect(new URL(page.url()).pathname).toBe("/category/technology");
  expect(new URL(page.url()).searchParams.get("article_type")).toBe("review");
  await types.getByRole("link", { name: "All", exact: true }).click();
  await expect(
    types.getByRole("link", { name: "All", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await category
    .getByRole("searchbox", { name: "Search article titles" })
    .fill("laptop");
  await category
    .getByRole("button", { name: "Search articles", exact: true })
    .click();
  await expect(page).toHaveURL(/search=laptop/);
  expect(new URL(page.url()).pathname).toBe("/category/technology");
  expect(new URL(page.url()).searchParams.has("category")).toBe(false);
  await expect(category.locator("[data-archive-story]")).toHaveCount(1);
  await expect(category.locator("mark")).toHaveText(/laptop/i);
  await category
    .getByRole("link", { name: "Reset filters", exact: true })
    .click();
  await expect(page).toHaveURL(/\/category\/technology\?view=list$/);
  await expect(category.locator("[data-archive-story]")).toHaveCount(6);
  await page.goto("/category/technology?page=2");
  await expect(category.locator("[data-archive-story]")).toHaveCount(0);
  await expect(category.locator(".results-info")).toContainText(
    "6 articles available",
  );
  await category
    .getByRole("link", { name: "Explore category articles", exact: true })
    .click();
  await expect(page).toHaveURL(/\/category\/technology$/);
  await expect(category.locator("[data-archive-story]")).toHaveCount(6);
  await page.goto("/category/everyday-tech");
  await expect(category.getByRole("heading", { level: 1 })).toHaveText(
    "Everyday tech",
  );
  await expect(category.locator("[data-archive-story]")).toHaveCount(3);
  await expect(category.locator("[data-archive-sidebar]")).toHaveCount(0);
});
