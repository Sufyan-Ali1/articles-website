import { test, expect } from "@playwright/test";

test("404 page provides recovery routes and a complete responsive illustration", async ({
  page,
}, testInfo) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  const content = page.locator("[data-not-found-page]");
  await expect(content.getByRole("heading", { level: 1 })).toHaveText(
    "Oops!We Can’t Find This Page",
  );
  await expect(page).toHaveTitle(/404.*Page Not Found/);
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(page.locator("header")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  const recovery = content.getByRole("region", {
    name: "What would you like to do?",
  });
  await expect(recovery.getByRole("link")).toHaveCount(4);
  const image = content.getByRole("img");
  await expect
    .poll(() =>
      image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  for (const width of [1920, 1440, 1280, 1024, 834, 760, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const nav = (await page.locator(".header-inner").boundingBox())!;
    const grid = (await recovery.boundingBox())!;
    expect(Math.abs(grid.x - nav.x)).toBeLessThan(1);
    expect(Math.abs(grid.width - nav.width)).toBeLessThan(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const art = (await image.boundingBox())!;
    expect(art.x).toBeGreaterThanOrEqual(0);
    expect(art.x + art.width).toBeLessThanOrEqual(width);
    expect(Math.abs(art.height - (art.width * 9) / 16)).toBeLessThan(1);
    await expect(image).toHaveCSS("object-fit", "contain");
    if ([1440, 834, 390].includes(width)) {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: testInfo.outputPath(`404-${width}.png`),
        fullPage: true,
      });
    }
  }
  for (const [name, href] of [
    ["Go to Homepage", "/"],
    ["Browse Articles", "/articles"],
    ["Explore Categories", "/categories"],
    ["Search Content", "/search"],
  ]) {
    await expect(
      recovery.getByRole("link", { name, exact: false }),
    ).toHaveAttribute("href", href);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const searchLink = content.getByRole("link", {
    name: "Search Articles",
    exact: true,
  });
  await searchLink.focus();
  await expect(searchLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/search$/);
});
