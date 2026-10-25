import { test, expect } from "@playwright/test";

test("category directory matches the new layout and keeps complete images across screen sizes", async ({
  page,
}, testInfo) => {
  await page.goto("/categories");
  const directory = page.locator("[data-categories-page]");
  await expect(directory.getByRole("heading", { level: 1 })).toHaveText(
    "Explore Categories",
  );
  const cards = directory.locator("[data-category-card]");
  await expect(cards).toHaveCount(2);
  await expect(
    directory.locator('[data-category-card="technology"]'),
  ).toContainText("6 articles");
  await expect(
    directory.getByRole("group", { name: "Filter categories" }),
  ).toHaveCount(0);
  await expect(directory.locator("aside")).toHaveCount(0);
  await expect(
    directory.getByRole("link", { name: "Everyday tech", exact: true }),
  ).toBeVisible();
  for (const width of [1920, 1440, 1024, 834, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const nav = (await page.locator(".header-inner").boundingBox())!;
    const shell = (await directory.locator(":scope > div").boundingBox())!;
    expect(Math.abs(nav.x - shell.x)).toBeLessThan(1);
    expect(Math.abs(nav.width - shell.width)).toBeLessThan(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const first = (await cards.nth(0).boundingBox())!;
    const second = (await cards.nth(1).boundingBox())!;
    if (width <= 640) expect(second.y).toBeGreaterThan(first.y + first.height);
    else expect(Math.abs(first.y - second.y)).toBeLessThan(1);
    for (const image of await directory.getByRole("img").all()) {
      const box = (await image.boundingBox())!;
      expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThan(1);
      await expect(image).toHaveCSS("object-fit", "contain");
    }
    if ([1440, 834, 390].includes(width)) {
      for (const image of await directory.getByRole("img").all()) {
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
        path: testInfo.outputPath(`categories-${width}.png`),
        fullPage: true,
      });
    }
  }
});

test("category searches, empty states, and exploration links work without redundant filters", async ({
  page,
}) => {
  await page.goto("/categories");
  const directory = page.locator("[data-categories-page]");
  const search = directory.getByRole("searchbox", {
    name: "Search categories",
  });
  await search.fill("automotive");
  await expect(directory.locator("[data-category-card]")).toHaveCount(1);
  await expect(
    directory.getByRole("heading", { name: "Automotive", exact: true }),
  ).toBeVisible();
  await expect(
    directory.getByRole("heading", { name: "Technology", exact: true }),
  ).toHaveCount(0);
  await search.fill("everyday");
  await expect(directory.locator("[data-category-card]")).toHaveCount(1);
  await expect(directory.getByRole("status")).toContainText("1 category");
  await search.fill("nothing-matches-this");
  await expect(
    directory.getByRole("heading", {
      name: "No categories match your search.",
    }),
  ).toBeVisible();
  await directory.getByRole("button", { name: "Show all categories" }).click();
  await expect(search).toHaveValue("");
  await expect(directory.locator("[data-category-card]")).toHaveCount(2);
  await search.fill("everyday");
  await directory.getByRole("button", { name: "Clear search" }).click();
  await expect(directory.locator("[data-category-card]")).toHaveCount(2);
  await directory
    .getByRole("link", { name: "Explore Technology articles", exact: true })
    .click();
  await expect(page).toHaveURL(/\/category\/technology$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Technology",
  );
});

test("unavailable category previews fall back to complete local topic photos", async ({
  page,
}, testInfo) => {
  await page.route("http://127.0.0.1:4100/media/**", (route) => route.abort());
  await page.goto("/categories");
  const directory = page.locator("[data-categories-page]");
  await expect(directory.locator("[data-category-card]")).toHaveCount(2);
  for (const image of await directory.getByRole("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute("src", /images%2Fabout%2F/);
    await expect
      .poll(() =>
        image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.screenshot({
    path: testInfo.outputPath("categories-local-photos.png"),
    fullPage: true,
  });
});

test("category search becomes a centered glass overlay after the original leaves view", async ({
  page,
  isMobile,
}, testInfo) => {
  await page.setViewportSize({ width: isMobile ? 390 : 1440, height: 760 });
  await page.goto("/categories");
  const directory = page.locator("[data-categories-page]");
  const anchor = directory.locator("[data-category-search-anchor]");
  const search = directory.locator("[data-category-search]");
  const input = search.locator("input");
  await expect(search).toBeVisible();
  await expect(search).toHaveAttribute("data-floating", "false");
  await input.fill("tech");
  await input.evaluate((node) =>
    (node as HTMLInputElement).setSelectionRange(1, 3),
  );
  const original = (await anchor.boundingBox())!;
  const headerHeight = (await page.locator(".site-header").boundingBox())!
    .height;
  const boundary = original.y + original.height - headerHeight;
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: "instant" }),
    boundary - 12,
  );
  await expect(search).toHaveAttribute("data-floating", "false");
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: "instant" }),
    boundary + 24,
  );
  await expect(search).toHaveAttribute("data-floating", "true");
  await expect(search).toHaveCSS("opacity", "1");
  await expect(search).toHaveCSS("position", "fixed");
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("tech");
  expect(
    await input.evaluate((node) => [
      (node as HTMLInputElement).selectionStart,
      (node as HTMLInputElement).selectionEnd,
    ]),
  ).toEqual([1, 3]);
  await expect(
    directory.getByRole("searchbox", { name: "Search categories" }),
  ).toHaveCount(1);
  await expect
    .poll(async () => Math.round((await search.boundingBox())!.y))
    .toBe(headerHeight + (isMobile ? 10 : 12));
  const overlay = (await search.boundingBox())!;
  const viewportWidth = await page.evaluate(() => innerWidth);
  expect(
    Math.abs(overlay.x + overlay.width / 2 - viewportWidth / 2),
  ).toBeLessThan(1);
  expect(overlay.y).toBeGreaterThanOrEqual(headerHeight + 10);
  expect(overlay.x).toBeGreaterThanOrEqual(16);
  await expect(search).toHaveCSS("backdrop-filter", /blur\(40px\)/);
  await search.getByRole("button", { name: "Clear search" }).click();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await expect(directory.locator("[data-category-card]")).toHaveCount(2);
  await input.fill("nothing-matches-this");
  await expect(
    directory.getByRole("heading", {
      name: "No categories match your search.",
    }),
  ).toBeVisible();
  await expect(search).toHaveAttribute("data-floating", "true");
  await expect(input).toBeFocused();
  await input.fill("automotive");
  await expect(directory.locator("[data-category-card]")).toHaveCount(1);
  await expect(
    directory.locator('[data-category-card="automotive"]'),
  ).toBeVisible();
  await expect(input).toHaveValue("automotive");
  await page.screenshot({
    path: testInfo.outputPath("categories-floating-search.png"),
  });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(search).toHaveAttribute("data-floating", "false");
  await expect(search).toHaveCSS("position", "static");
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("automotive");
  await directory.getByRole("button", { name: "Clear search" }).click();
  await expect(directory.locator("[data-category-card]")).toHaveCount(2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: "instant" }),
    boundary + 24,
  );
  await expect(search).toHaveAttribute("data-floating", "true");
  await expect(search).toHaveCSS("animation-name", "none");
});
