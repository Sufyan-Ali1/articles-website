import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/articles",
  "/articles?view=list",
  "/categories",
  "/category/technology",
  "/tag/practical-choices",
  "/search?search=electric",
  "/articles/electric-car-question",
];

for (const route of routes) {
  test(`complete 16:9 images on ${route}`, async ({
    page,
    isMobile,
  }, testInfo) => {
    await page.setViewportSize({ width: isMobile ? 390 : 1440, height: 1000 });
    await page.goto(route);
    await expect(page.locator("main .article-image").first()).toBeAttached();
    let checked = 0;
    for (const frame of await page.locator("main .article-image").all()) {
      if (!(await frame.isVisible())) continue;
      await frame.scrollIntoViewIfNeeded();
      const box = (await frame.boundingBox())!;
      expect(
        Math.abs(box.height - (box.width * 9) / 16),
        `Frame must stay 16:9 on ${route}`,
      ).toBeLessThan(1);
      const image = frame.locator("img");
      await expect(image).toHaveCSS("object-fit", "contain");
      await expect
        .poll(() =>
          image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
      const intrinsic = await image.evaluate((node) => ({
        width: (node as HTMLImageElement).naturalWidth,
        height: (node as HTMLImageElement).naturalHeight,
      }));
      expect(intrinsic.width / intrinsic.height).toBeCloseTo(16 / 9, 3);
      const imageBox = (await image.boundingBox())!;
      expect(Math.abs(imageBox.width - box.width)).toBeLessThan(1);
      expect(Math.abs(imageBox.height - box.height)).toBeLessThan(1);
      await image.hover({ force: true });
      await expect(image).toHaveCSS("transform", "none");
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (route === "/" || route === "/articles/electric-car-question") {
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: testInfo.outputPath(
          route === "/"
            ? "home-complete-images.png"
            : "article-complete-image.png",
        ),
      });
    }
  });
}

test("article body images retain their full natural proportions", async ({
  page,
}) => {
  await page.goto("/articles/image-reader");
  const image = page.getByAltText("Complete inline article image");
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const box = (await image.boundingBox())!;
  expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThan(1);
  await expect(image).toHaveCSS("object-fit", "contain");
});
