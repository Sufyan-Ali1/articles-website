import { test, expect } from "@playwright/test";
import sharp from "sharp";

test("shared branding, favicons and share artwork use the recreated AE identity", async ({
  page,
  request,
  isMobile,
}, testInfo) => {
  await page.goto("/");
  const header = page.locator(".site-header");
  const footer = page.locator(".site-footer");
  for (const surface of [header, footer]) {
    await expect(surface.locator("[data-brand]")).toHaveText("Ask & Explore");
    await expect(surface.locator("[data-brand] img")).toHaveAttribute(
      "src",
      "/images/brand/ae-mark.svg",
    );
  }
  const icon = page.locator('link[rel="icon"][type="image/svg+xml"]');
  const appleIcon = page.locator('link[rel="apple-touch-icon"]');
  await expect(icon).toHaveAttribute("href", /\/icon\.svg/);
  await expect(appleIcon).toHaveAttribute("href", /\/apple-icon\.png/);
  for (const [path, width, height] of [
    ["/apple-icon.png", 180, 180],
    ["/images/brand/ae-icon-192.png", 192, 192],
    ["/images/brand/ae-icon-512.png", 512, 512],
    ["/opengraph-image", 1200, 630],
    ["/images/brand/article-fallback.webp", 1920, 1080],
  ] as const) {
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
    const metadata = await sharp(await response.body()).metadata();
    expect(metadata.width, path).toBe(width);
    expect(metadata.height, path).toBe(height);
  }
  const favicon = await request.get("/favicon.ico");
  expect(favicon.ok()).toBe(true);
  expect([...(await favicon.body()).subarray(0, 4)]).toEqual([0, 0, 1, 0]);
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.name).toBe("Ask & Explore");
  expect(manifest.icons).toHaveLength(2);
  if (isMobile) {
    await header.getByRole("button", { name: "Open navigation" }).click();
    await expect(
      page.getByRole("dialog").locator("[data-brand]"),
    ).toBeVisible();
    await page.keyboard.press("Escape");
  }
  await page.screenshot({ path: testInfo.outputPath("branded-home.png") });
});

test("missing and broken article images use the complete editorial fallback", async ({
  page,
}, testInfo) => {
  await page.route("http://127.0.0.1:4100/media/**", (route) => route.abort());
  await page.goto("/articles");
  await expect(page.locator("[data-archive-story]")).toHaveCount(12);
  for (const card of await page.locator("[data-archive-story]").all()) {
    await card.scrollIntoViewIfNeeded();
    const image = card.locator(".image-fallback img");
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src", /article-fallback/);
    await expect(image).toHaveCSS("object-fit", "contain");
    await expect
      .poll(() =>
        image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    const bounds = (await image.boundingBox())!;
    expect(bounds.width / bounds.height).toBeCloseTo(16 / 9, 2);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("editorial-fallback.png"),
  });
});
