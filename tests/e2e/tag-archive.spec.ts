import { test, expect } from "@playwright/test";

test("old tag URLs redirect once to a noindex filtered article list", async ({
  request,
}) => {
  for (const prefix of ["tag", "tags"]) {
    const redirect = await request.get(`/${prefix}/practical-choices`, {
      maxRedirects: 0,
    });
    expect(redirect.status()).toBe(308);
    expect(redirect.headers().location).toBe("/articles?tag=practical-choices");
    const response = await request.get(redirect.headers().location);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('name="robots" content="noindex, follow"');
    expect(html).not.toContain("data-tag-page");
  }
});

test("article tag links use filters and never create tag archives", async ({
  page,
}) => {
  await page.goto("/articles/electric-car-question");
  const tag = page.locator(".article-tags a").first();
  await expect(tag).toHaveAttribute("href", "/articles?tag=practical-choices");
  await tag.click();
  await expect(page.locator(".results-info")).toContainText("15 articles");
  await expect(
    page.getByRole("link", { name: "Next", exact: true }),
  ).toHaveAttribute("href", "/articles?tag=practical-choices&page=2");
  await page.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page.locator("[data-archive-story]")).toHaveCount(3);
});
