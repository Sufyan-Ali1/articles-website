import { test, expect } from "@playwright/test";

test("mobile topic highlight clears immediately on the second tap", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Touchscreen hover regression");
  await page.goto("/search?topics=all");
  const topic = page
    .getByRole("group", { name: "Search topics" })
    .getByRole("button", { name: "Technology", exact: true });
  const unselectedBackground = await topic.evaluate(
    (node) => getComputedStyle(node).backgroundColor,
  );
  await topic.tap();
  await expect(topic).toHaveAttribute("aria-pressed", "true");
  await expect(topic).not.toHaveCSS("background-color", unselectedBackground);
  await expect(page).toHaveURL(/topics=technology/);
  await topic.tap();
  await expect(topic).toHaveAttribute("aria-pressed", "false");
  await expect(topic).toHaveCSS("background-color", unselectedBackground);
  await expect(page).toHaveURL(/topics=all/);
  await expect(topic).toHaveCSS("background-color", unselectedBackground);
});

test("topics support independent multiple selections, all, and removing one topic", async ({
  page,
}) => {
  await page.goto("/search?topics=all");
  const topics = page.getByRole("group", { name: "Search topics" });
  const results = page.locator("[data-search-results]");
  await expect(results.locator(".results-info")).toHaveText(
    "15 articles found",
  );
  await expect(topics.getByRole("button")).toHaveCount(7);
  await topics.getByRole("button", { name: "Technology", exact: true }).click();
  await expect(results.locator(".results-info")).toHaveText("6 articles found");
  await topics.getByRole("button", { name: "Automotive", exact: true }).click();
  await expect(results.locator(".results-info")).toHaveText(
    "12 articles found",
  );
  await expect(results.locator("[data-archive-story]")).toHaveCount(12);
  await topics
    .getByRole("button", { name: "Buying Guides", exact: true })
    .click();
  await expect(results.locator(".results-info")).toHaveText(
    "13 articles found",
  );
  await results.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(results.locator("[data-archive-story]")).toHaveCount(1);
  await topics
    .getByRole("button", { name: "Buying Guides", exact: true })
    .click();
  await expect(results.locator(".results-info")).toHaveText(
    "12 articles found",
  );
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  await page
    .getByRole("link", { name: "Remove topic Technology", exact: true })
    .click();
  await expect(results.locator(".results-info")).toHaveText("6 articles found");
  await expect(
    topics.getByRole("button", { name: "Automotive", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    topics.getByRole("button", { name: "Technology", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await topics.getByRole("button", { name: "Automotive", exact: true }).click();
  await expect(results.locator(".results-info")).toHaveText(
    "15 articles found",
  );
  await expect(
    topics.getByRole("button", { name: "All", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await topics.getByRole("button", { name: "Travel", exact: true }).click();
  await expect(results.locator(".results-info")).toHaveText("0 articles found");
  await expect(
    topics.getByRole("button", { name: "Travel", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await topics.getByRole("button", { name: "All", exact: true }).click();
  await expect(results.locator(".results-info")).toHaveText(
    "15 articles found",
  );
});

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
    search.getByRole("group", { name: "Search topics" }),
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
    const heroImage = search.locator('img[src*="hero.webp"]');
    if (width <= 760) await expect(heroImage).toBeHidden();
    else await expect(heroImage).toBeVisible();
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
      if (!(await image.isVisible())) continue;
      const box = (await image.boundingBox())!;
      expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThan(1);
      await expect(image).toHaveCSS("object-fit", "contain");
    }
    if ([1440, 834, 390].includes(width)) {
      for (const image of await search.getByRole("img").all()) {
        if (!(await image.isVisible())) continue;
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
    search.getByRole("button", { name: "All", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    search.getByRole("button", { name: "Travel", exact: true }),
  ).toBeVisible();
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
  const shortcuts = search.getByRole("group", { name: "Search topics" });
  await shortcuts
    .getByRole("button", { name: "Automotive", exact: true })
    .click();
  await expect(
    shortcuts.getByRole("button", { name: "Automotive", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/topics=automotive/);
  await shortcuts
    .getByRole("button", { name: "Technology", exact: true })
    .click();
  await expect(
    shortcuts.getByRole("button", { name: "Technology", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    shortcuts.getByRole("button", { name: "Automotive", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/topics=technology%2Cautomotive/);
  await search
    .getByRole("combobox", { name: "Sort articles" })
    .selectOption("title");
  await expect(
    search.getByRole("link", { name: "List view", exact: true }),
  ).toHaveAttribute("href", /sort=title.*topics=technology%2Cautomotive/);
  await search.getByRole("link", { name: "List view", exact: true }).click();
  await expect(page).toHaveURL(/view=list/);
  const params = new URL(page.url()).searchParams;
  expect(params.get("search")).toBe("electric");
  expect(params.get("topics")).toBe("technology,automotive");
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
