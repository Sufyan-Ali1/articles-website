import { test, expect } from "@playwright/test";

test("tag detail shares the category archive layout without a sidebar", async ({
  page,
}, testInfo) => {
  await page.goto("/tag/practical-choices?tag=another-tag");
  const tag = page.locator("[data-tag-page]");
  await expect(tag.getByRole("heading", { level: 1 })).toHaveText(
    "Practical choices",
  );
  await expect(tag.locator("[data-archive-story]")).toHaveCount(12);
  await expect(tag.locator(".results-info")).toContainText("15 articles");
  await expect(tag.locator("[data-archive-sidebar],details")).toHaveCount(0);
  const form = tag.getByRole("search", { name: "Filter published articles" });
  await expect(form).toHaveAttribute("action", "/tag/practical-choices");
  await expect(form.locator('input[name="tag"]')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ask-explore.test/tag/practical-choices",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index, follow",
  );
  await expect(
    tag
      .getByRole("form", { name: "Articles newsletter signup" })
      .getByRole("button"),
  ).toBeDisabled();
  for (const width of [1920, 1440, 1024, 834, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const nav = (await page.locator(".header-inner").boundingBox())!;
    const results = (await tag
      .getByRole("region", { name: "Published articles" })
      .boundingBox())!;
    expect(Math.abs(results.x - nav.x)).toBeLessThan(1);
    expect(Math.abs(results.width - nav.width)).toBeLessThan(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const image of await tag.getByRole("img").all()) {
      const box = (await image.boundingBox())!;
      expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThan(1);
      await expect(image).toHaveCSS("object-fit", "contain");
    }
    if ([1440, 834, 390].includes(width)) {
      for (const image of await tag.getByRole("img").all()) {
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
        path: testInfo.outputPath(`tag-archive-${width}.png`),
        fullPage: true,
      });
    }
  }
});

test("tag archive filters, pagination, reset and plural links retain the selected tag", async ({
  page,
  request,
}) => {
  const redirect = await request.get(
    "/tags/practical-choices?search=electric&view=list",
    { maxRedirects: 0 },
  );
  expect(redirect.status()).toBe(308);
  expect(redirect.headers().location).toBe(
    "/tag/practical-choices?search=electric&view=list",
  );
  await page.goto("/tags/practical-choices");
  await expect(page).toHaveURL(/\/tag\/practical-choices$/);
  const tag = page.locator("[data-tag-page]");
  await tag.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/\/tag\/practical-choices\?page=2$/);
  await expect(tag.locator("[data-archive-story]")).toHaveCount(3);
  await tag.getByRole("link", { name: "List view", exact: true }).click();
  await expect(page).toHaveURL(/view=list&page=2/);
  await tag
    .getByRole("navigation", { name: "Article types" })
    .getByRole("link", { name: "Reviews", exact: true })
    .click();
  await expect(page).toHaveURL(
    /\/tag\/practical-choices\?article_type=review&view=list$/,
  );
  await tag
    .getByRole("combobox", { name: "Sort articles" })
    .selectOption("title");
  await expect(page).toHaveURL(/sort=title/);
  const input = tag.getByRole("searchbox", { name: "Search article titles" });
  await input.fill("workspace");
  await tag
    .getByRole("button", { name: "Search articles", exact: true })
    .click();
  await expect(page).toHaveURL(/search=workspace/);
  expect(new URL(page.url()).pathname).toBe("/tag/practical-choices");
  expect(new URL(page.url()).searchParams.has("tag")).toBe(false);
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  await expect(tag.locator("[data-archive-story]")).toHaveCount(1);
  await expect(tag.locator(".article-list")).toBeVisible();
  await expect(tag.locator("[data-archive-story] h2 mark")).toHaveText(
    /workspace/i,
  );
  await tag.getByRole("link", { name: "Reset filters", exact: true }).click();
  await expect(page).toHaveURL(/\/tag\/practical-choices\?view=list$/);
  await expect(tag.locator(".results-info")).toContainText("15 articles");
  await input.fill("nothing-matches-this");
  await tag
    .getByRole("button", { name: "Search articles", exact: true })
    .click();
  await expect(
    tag.getByRole("heading", { name: "No articles match these filters." }),
  ).toBeVisible();
  await expect(
    tag.getByRole("link", { name: "Explore tag articles", exact: true }),
  ).toHaveAttribute("href", "/tag/practical-choices");
  await page.goto("/tag/not-a-real-tag");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /We Can’t Find This Page/,
  );
});
