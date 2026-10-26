import { test, expect } from "@playwright/test";

test("article archive keeps the new layout, full images, and category controls outside the toolbar", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  await page.goto("/articles");
  const archive = page.locator("[data-articles-page]");
  await expect(archive.getByRole("heading", { level: 1 })).toHaveText(
    "Explore Our Articles",
  );
  await expect(archive.locator("[data-archive-story]")).toHaveCount(12);
  await expect(
    archive.locator("[data-archive-sidebar] a").first(),
  ).toContainText("15");
  await expect(archive.locator(".results-info")).toContainText(
    "Showing 1–12 of 15 articles",
  );
  const filters = archive.getByRole("search", {
    name: "Filter published articles",
  });
  await expect(filters.locator('select[name="category"]')).toHaveCount(0);
  await expect(
    filters.getByRole("navigation", { name: /categor/i }),
  ).toHaveCount(0);
  await expect(
    filters.getByRole("navigation", { name: "Article types" }),
  ).toBeVisible();
  const newsletter = archive.getByRole("form", {
    name: "Articles newsletter signup",
  });
  await expect(newsletter.getByRole("textbox")).toBeEnabled();
  await expect(newsletter.getByRole("button")).toBeEnabled();
  for (const width of [1920, 1440, 1024, 834, 760, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const nav = (await page.locator(".header-inner").boundingBox())!;
    const shell = (await archive.locator(":scope > div").boundingBox())!;
    expect(Math.abs(shell.x - nav.x)).toBeLessThan(1);
    expect(Math.abs(shell.width - nav.width)).toBeLessThan(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const sidebar = archive.locator("[data-archive-sidebar]");
    if (width <= 760) await expect(sidebar).toBeHidden();
    else await expect(sidebar).toHaveCSS("position", "sticky");
    for (const image of await archive.getByRole("img").all()) {
      const box = (await image.boundingBox())!;
      expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThan(1);
      await expect(image).toHaveCSS("object-fit", "contain");
    }
    if ([1440, 834, 390].includes(width)) {
      for (const image of await archive.getByRole("img").all()) {
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
        path: testInfo.outputPath(`archive-${width}.png`),
        fullPage: true,
      });
    }
  }
});

test("article archive category panel fills the viewport and both controls stay anchored", async ({
  page,
  isMobile,
}, testInfo) => {
  test.skip(
    isMobile,
    "Desktop sticky sidebar; mobile uses native expandable categories.",
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/articles");
  const sidebar = page.locator("[data-archive-sidebar]:visible");
  const filterBar = page.locator("[data-archive-filter-bar]");
  await expect(
    sidebar.getByRole("link", { name: /All Articles/ }),
  ).toContainText("15");
  const nav = (await page.locator(".header-inner").boundingBox())!;
  expect((await sidebar.boundingBox())!.x).toBe(nav.x);
  const results = page.getByRole("region", { name: "Published articles" });
  expect((await filterBar.boundingBox())!.x).toBe(nav.x);
  expect((await filterBar.boundingBox())!.width).toBe(nav.width);
  const headerHeight = (await page.locator(".site-header").boundingBox())!
    .height;
  for (const scroll of [650, 950]) {
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: "instant" }),
      scroll,
    );
    await expect(filterBar).toHaveAttribute("data-floating", "true");
    await expect
      .poll(async () => Math.round((await filterBar.boundingBox())!.y))
      .toBe(headerHeight + 12);
    await expect
      .poll(async () => Math.round((await sidebar.boundingBox())!.y))
      .toBe(headerHeight + 18);
    const bounds = (await sidebar.boundingBox())!;
    expect(Math.abs(bounds.y + bounds.height - (900 - 18))).toBeLessThan(1);
  }
  await page.screenshot({
    path: testInfo.outputPath("archive-desktop-pinned.png"),
  });
  await page.setViewportSize({ width: 1440, height: 300 });
  const categoryNav = sidebar.getByRole("navigation");
  await expect(categoryNav).toHaveCSS("overflow-y", "auto");
  await expect
    .poll(() =>
      categoryNav.evaluate((node) => node.scrollHeight > node.clientHeight),
    )
    .toBe(true);
  const scroll = await page.evaluate(() => window.scrollY);
  await categoryNav.evaluate((node) => (node.scrollTop = node.scrollHeight));
  expect(await categoryNav.evaluate((node) => node.scrollTop)).toBeGreaterThan(
    0,
  );
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await page.setViewportSize({ width: 1440, height: 900 });
  const newsletter = page.getByRole("region", {
    name: "Keep up with useful guides.",
  });
  await newsletter.scrollIntoViewIfNeeded();
  const sidebarBox = (await sidebar.boundingBox())!;
  expect(sidebarBox.y + sidebarBox.height).toBeLessThanOrEqual(
    (await newsletter.boundingBox())!.y,
  );
  const filterBox = (await filterBar.boundingBox())!;
  expect(filterBox.y + filterBox.height).toBeLessThanOrEqual(
    (await newsletter.boundingBox())!.y,
  );
  await page.goto("/articles?page=2");
  await expect(page.locator("[data-archive-story]")).toHaveCount(3);
  await expect(sidebar).toBeVisible();
  await expect
    .poll(async () => {
      const shortSidebar = await sidebar.boundingBox();
      const shortResults = await results.boundingBox();
      return shortSidebar && shortResults
        ? shortSidebar.height - shortResults.height
        : Infinity;
    })
    .toBeLessThanOrEqual(0);
});

test("article archive keeps mobile filters compact and article types independently scrollable", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/articles");
  const filterBar = page.locator("[data-archive-filter-bar]");
  await expect(filterBar).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 950, behavior: "instant" }));
  const top = (await page.locator(".site-header").boundingBox())!.height + 10;
  await expect
    .poll(async () => Math.round((await filterBar.boundingBox())!.y))
    .toBe(top);
  expect((await filterBar.boundingBox())!.height).toBeLessThan(150);
  const actions = filterBar.locator("[data-archive-actions]");
  const scrollY = await page.evaluate(() => window.scrollY);
  await actions.evaluate((node) => (node.scrollLeft = node.scrollWidth));
  expect(await actions.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  await expect(filterBar.getByRole("searchbox")).toBeVisible();
  await expect(
    filterBar.getByRole("combobox", { name: "Sort articles" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("archive-mobile-pinned.png"),
  });
});

test("article archive combines category, format, search, sort, view, and pagination state", async ({
  page,
  isMobile,
}) => {
  await page.goto("/articles?page=2&sort=-view_count&view=list");
  const archive = page.locator("[data-articles-page]");
  if (isMobile) {
    const panel = archive.locator("details");
    await expect(panel).not.toHaveAttribute("open", "");
    await panel.locator("summary").click();
  }
  const categories = page.getByRole("navigation", {
    name: "Filter articles by category",
  });
  await categories.getByRole("link", { name: /^Technology/ }).click();
  await expect(page).toHaveURL(/category=technology/);
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  expect(new URL(page.url()).searchParams.get("view")).toBe("list");
  expect(new URL(page.url()).searchParams.get("sort")).toBe("-view_count");
  await expect(archive.locator("[data-archive-story]")).toHaveCount(6);
  const types = archive.getByRole("navigation", { name: "Article types" });
  await types.getByRole("link", { name: "Reviews", exact: true }).click();
  await expect(page).toHaveURL(/article_type=review/);
  expect(new URL(page.url()).searchParams.get("category")).toBe("technology");
  await expect(
    types.getByRole("link", { name: "Reviews", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await archive
    .getByRole("combobox", { name: "Sort articles" })
    .selectOption("title");
  await expect(page).toHaveURL(/sort=title/);
  expect(new URL(page.url()).searchParams.get("article_type")).toBe("review");
  await types.getByRole("link", { name: "All", exact: true }).click();
  await expect(
    types.getByRole("link", { name: "All", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await archive
    .getByRole("searchbox", { name: "Search article titles" })
    .fill("laptop");
  await archive
    .getByRole("button", { name: "Search articles", exact: true })
    .click();
  await expect(page).toHaveURL(/search=laptop/);
  expect(new URL(page.url()).searchParams.get("category")).toBe("technology");
  await expect(archive.locator("[data-archive-story]")).toHaveCount(1);
  await expect(archive.locator("mark")).toHaveText(/laptop/i);
  await archive
    .getByRole("link", { name: "Reset filters", exact: true })
    .click();
  await expect(archive.locator("[data-archive-story]")).toHaveCount(12);
  await archive.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(archive.locator("[data-archive-story]")).toHaveCount(3);
  await archive
    .getByRole("searchbox", { name: "Search article titles" })
    .fill("no-matching-story");
  await archive
    .getByRole("button", { name: "Search articles", exact: true })
    .click();
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  await expect(
    archive.getByRole("heading", { name: "No articles match these filters." }),
  ).toBeVisible();
  await archive
    .getByRole("link", { name: "Explore all articles", exact: true })
    .click();
  await expect(archive.locator("[data-archive-story]")).toHaveCount(12);
});
