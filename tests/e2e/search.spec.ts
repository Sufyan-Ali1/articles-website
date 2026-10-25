import { test, expect } from "@playwright/test";

test("search uses the shared full-width archive with a responsive illustrated hero", async ({
  page,
}, testInfo) => {
  await page.goto("/search?search=e");
  const search = page.locator("[data-search-page]");
  await expect(search.getByRole("heading", { level: 1 })).toHaveText(
    /Find the answers.*you’re looking for/,
  );
  await expect(search.locator("[data-archive-story]")).toHaveCount(12);
  await expect(search.locator("[data-archive-sidebar],details")).toHaveCount(0);
  await expect(search.getByRole("search")).toHaveCount(1);
  await expect(
    search.getByRole("navigation", { name: "Search shortcuts" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(
    search.locator("[data-archive-story] h2 mark").first(),
  ).toHaveText(/e/i);
  for (const width of [1920, 1440, 1280, 1024, 834, 760, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const nav = (await page.locator(".header-inner").boundingBox())!;
    const results = (await search
      .getByRole("region", { name: "Published articles" })
      .boundingBox())!;
    expect(Math.abs(nav.x - results.x)).toBeLessThan(1);
    expect(Math.abs(nav.width - results.width)).toBeLessThan(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const image of await search.getByRole("img").all()) {
      const box = (await image.boundingBox())!;
      expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThan(1);
      await expect(image).toHaveCSS("object-fit", "contain");
    }
    if ([1440, 834, 390].includes(width)) {
      for (const image of await search.getByRole("img").all()) {
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
        path: testInfo.outputPath(`search-${width}.png`),
        fullPage: true,
      });
      if (width === 390)
        await page.screenshot({
          path: testInfo.outputPath("search-mobile-viewport.png"),
        });
    }
  }
});

test("search shortcuts, sort, layout and pagination preserve the query and reset page changes", async ({
  page,
}) => {
  await page.goto("/search");
  const search = page.locator("[data-search-page]");
  await expect(
    search.getByRole("heading", { name: "What would you like to discover?" }),
  ).toBeVisible();
  await expect(
    search.getByRole("link", { name: "Latest", exact: true }),
  ).toHaveAttribute("href", "/articles");
  const input = search
    .locator("[data-search-hero-form]")
    .getByRole("searchbox", {
      name: "Search article titles",
    });
  await input.fill("electric");
  await search
    .locator("[data-search-hero-form]")
    .getByRole("button", { name: "Search articles", exact: true })
    .click();
  await expect(search.locator(".results-info")).toHaveText("2 articles found");
  const shortcuts = search.getByRole("navigation", {
    name: "Search shortcuts",
  });
  await shortcuts
    .getByRole("link", { name: "Automotive", exact: true })
    .click();
  await expect(
    shortcuts.getByRole("link", { name: "Automotive", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  expect(new URL(page.url()).searchParams.get("search")).toBe("electric");
  await shortcuts.getByRole("link", { name: "Tutorials", exact: true }).click();
  await expect(
    shortcuts.getByRole("link", { name: "Tutorials", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await search
    .getByRole("combobox", { name: "Sort articles" })
    .selectOption("title");
  await expect(
    search.getByRole("link", { name: "List view", exact: true }),
  ).toHaveAttribute("href", /article_type=tutorial&sort=title/);
  await search.getByRole("link", { name: "List view", exact: true }).click();
  await expect(page).toHaveURL(/view=list/);
  const params = new URL(page.url()).searchParams;
  expect(params.get("search")).toBe("electric");
  expect(params.get("category")).toBe("automotive");
  expect(params.get("article_type")).toBe("tutorial");
  expect(params.get("sort")).toBe("title");
  expect(params.get("view")).toBe("list");
  await page.goto("/search?search=e&sort=title&view=list");
  await search.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  expect(new URL(page.url()).searchParams.get("page")).toBe("2");
  expect(new URL(page.url()).searchParams.get("search")).toBe("e");
  await input.fill("laptop");
  await search
    .locator("[data-search-hero-form]")
    .getByRole("button", { name: "Search articles", exact: true })
    .click();
  await expect(page).toHaveURL(/search=laptop/);
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  expect(new URL(page.url()).searchParams.get("sort")).toBe("title");
  expect(new URL(page.url()).searchParams.get("view")).toBe("list");
  await expect(search.locator(".article-list")).toBeVisible();
  await search.getByRole("link", { name: "Remove filter laptop" }).click();
  await expect(input).toHaveValue("");
});
