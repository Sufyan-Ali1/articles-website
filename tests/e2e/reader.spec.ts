import { test, expect } from "@playwright/test";

test("reader panels remain visible without desktop close controls", async ({
  page,
  isMobile,
}, testInfo) => {
  test.skip(isMobile, "Desktop reader sidebars");
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/articles/electric-car-question");
  const contents = page.getByRole("complementary", {
    name: "In this article",
    exact: true,
  });
  const related = page.getByRole("complementary", {
    name: "Related articles",
    exact: true,
  });
  await expect(related.getByRole("link", { name: /See all/ })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: testInfo.outputPath("reader-desktop.png"),
    fullPage: false,
  });
  const navBounds = (await page.locator(".header-inner").boundingBox())!;
  const contentsBounds = (await contents.boundingBox())!;
  const relatedBounds = (await related.boundingBox())!;
  expect(contentsBounds.x).toBe(navBounds.x);
  expect(relatedBounds.x + relatedBounds.width).toBe(
    navBounds.x + navBounds.width,
  );
  await expect(page.locator("button[data-panel-control]")).toHaveCount(0);
  const heading = await page.locator("article").boundingBox();
  for (const panel of [contents, related]) {
    const box = await panel.boundingBox();
    expect(Math.abs(box!.y - heading!.y)).toBeLessThan(2);
  }
  expect(heading!.width).toBeLessThanOrEqual(800);
  await expect(contents.getByRole("navigation")).toBeVisible();
  await expect(related.getByRole("link", { name: /See all/ })).toBeVisible();
  expect(
    await related.locator('a[href="/articles/electric-car-question"]').count(),
  ).toBe(0);
  const urls = await related
    .locator('a[href^="/articles/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(new Set(urls).size).toBe(urls.length);
});

test("reader panels stay anchored while reading without edge controls", async ({
  page,
  isMobile,
}, testInfo) => {
  test.skip(isMobile, "Desktop sticky panels");
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/articles/electric-car-question");
  const panels = page.locator("aside[data-side]");
  await expect(panels).toHaveCount(2);
  await expect(page.locator("button[data-panel-control]")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo({ top: 850, behavior: "instant" }));
  await expect(page.locator("[data-reader-scroll]")).toHaveCSS(
    "overflow-y",
    "auto",
  );
  for (const panel of await panels.all()) {
    await expect
      .poll(async () => Math.round((await panel.boundingBox())!.y))
      .toBe(82);
    expect(
      await panel.evaluate((node) => ({
        scroll: node.scrollHeight > node.clientHeight,
        overflow: getComputedStyle(node).overflowY,
      })),
    ).toEqual({ scroll: false, overflow: "visible" });
  }
  await page.screenshot({ path: testInfo.outputPath("reader-sticky.png") });
  await page
    .getByRole("link", { name: "A practical comparison", exact: true })
    .first()
    .click();
  const target = page.locator("#a-practical-comparison");
  await expect
    .poll(async () => Math.round((await target.boundingBox())!.y))
    .toBeGreaterThan(65);
  await expect(
    page.locator(
      'aside[data-side="contents"] a[href="#a-practical-comparison"]',
    ),
  ).toHaveAttribute("aria-current", "location");
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  const footer = (await page.locator(".site-footer").boundingBox())!;
  for (const panel of await panels.all()) {
    const box = (await panel.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(footer.y);
  }
  await page.setViewportSize({ width: 1440, height: 260 });
  await expect(page.locator('aside[data-side="contents"]')).toHaveCSS(
    "position",
    "sticky",
  );
  expect(
    (await page.locator('aside[data-side="contents"]').boundingBox())!.height,
  ).toBeLessThanOrEqual(154);
  await expect(page.locator('aside[data-side="related"]')).toHaveAttribute(
    "data-tall",
    "true",
  );
});

test("reader adapts to tablet, mobile, and zoom-sized viewports", async ({
  page,
}, testInfo) => {
  await page.goto("/articles/electric-car-question");
  await expect(page.locator(".breadcrumbs")).toBeVisible();
  for (const width of [1440, 1280, 1100, 900, 834, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const nav = (await page.locator(".header-inner").boundingBox())!;
    const reader = (await page.locator("main > .container").boundingBox())!;
    expect(reader.x).toBe(nav.x);
    expect(reader.width).toBe(nav.width);
    const contents = page.locator(".mobile-toc");
    if (width < 900) {
      await expect(page.locator('aside[data-side="contents"]')).toBeHidden();
      await expect(contents).toBeVisible();
      await contents.locator("summary").click();
      await expect(contents.getByRole("navigation")).toBeVisible();
      await contents.locator("summary").click();
      await expect(contents.getByRole("navigation")).toBeHidden();
    } else {
      await expect(contents).toBeHidden();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 834 || width === 390) {
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: testInfo.outputPath(`reader-${width}.png`),
      });
    }
  }
  await page.screenshot({
    path: testInfo.outputPath("reader-mobile.png"),
    fullPage: true,
  });
  const related = page.getByRole("complementary", {
    name: "Related articles",
    exact: true,
  });
  await expect(
    related.getByRole("link", { name: /View all articles/ }),
  ).toBeHidden();
  await related
    .getByRole("button", { name: "Related articles", exact: true })
    .click();
  await expect(
    related.getByRole("link", { name: /View all articles/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy link", exact: true }).first(),
  ).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await expect(
    page.getByRole("button", { name: "Close related articles" }),
  ).toHaveCount(0);
});

test("long contents scroll independently and follow the current article section", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Desktop independently scrolling contents");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/articles/long-reader");
  const panel = page.locator('aside[data-side="contents"]');

  await expect(panel.getByRole("link")).toHaveCount(35);
  await expect(panel).toHaveCSS("position", "sticky");
  const scroller = page.locator("[data-reader-scroll]");
  expect(
    await scroller.evaluate((node) => node.scrollHeight > node.clientHeight),
  ).toBe(true);
  await page
    .locator("#section-25")
    .evaluate((node) =>
      node.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  const active = panel.locator('a[aria-current="location"]');
  await expect(active).toHaveText("Section 25");
  await expect
    .poll(() => scroller.evaluate((node) => node.scrollTop))
    .toBeGreaterThan(0);
  const currentLink = (await active.boundingBox())!;
  const scrollBounds = (await scroller.boundingBox())!;
  expect(currentLink.y).toBeGreaterThanOrEqual(scrollBounds.y);
  expect(currentLink.y + currentLink.height).toBeLessThanOrEqual(
    scrollBounds.y + scrollBounds.height,
  );
  const pagePosition = await page.evaluate(() => scrollY);
  const previousScroll = await scroller.evaluate((node) => node.scrollTop);
  await page.mouse.move(
    scrollBounds.x + scrollBounds.width / 2,
    scrollBounds.y + scrollBounds.height / 2,
  );
  await page.mouse.wheel(0, -300);
  await expect
    .poll(() => scroller.evaluate((node) => node.scrollTop))
    .toBeLessThan(previousScroll);
  expect(await page.evaluate(() => scrollY)).toBe(pagePosition);
  await expect(active).toBeInViewport();
  await panel.getByRole("link").last().click();
  await expect(page).toHaveURL(/#section-35$/);
  await expect(page.locator("#section-35")).toBeInViewport();
  await page.goto("/articles/plain-reader");
  await expect(page.locator("#article-content")).toBeVisible();
  await expect(panel).toHaveCount(0);
  await expect(page.locator(".mobile-toc")).toHaveCount(0);
  await expect(page.locator(".article-hero")).toHaveCount(0);
});

test("reference reader provides progress, persistent saving, sharing, and a disabled newsletter design", async ({
  page,
}) => {
  await page.goto("/articles/electric-car-question");
  const progress = page.getByRole("progressbar", {
    name: "Article reading progress",
  });
  await expect(progress).toHaveAttribute("aria-valuenow", "0");
  const save = page
    .getByRole("button", { name: "Save article", exact: true })
    .first();
  await save.click();
  await expect(
    page.getByRole("button", { name: "Unsave article" }).first(),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Unsave article" }).first(),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Unsave article" }).first().click();
  await page
    .locator("#a-practical-comparison")
    .evaluate((node) => node.scrollIntoView({ behavior: "instant" }));
  await expect
    .poll(async () => Number(await progress.getAttribute("aria-valuenow")))
    .toBeGreaterThan(0);
  await expect(
    page.getByRole("button", { name: "Copy link", exact: true }).first(),
  ).toBeAttached();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await expect(
    page
      .getByRole("form", { name: "Newsletter signup", exact: true })
      .getByRole("button", { name: "Subscribe" }),
  ).toBeDisabled();
  await expect(
    page
      .getByRole("form", { name: "Newsletter signup", exact: true })
      .getByRole("textbox", { name: "Your email address" }),
  ).toBeDisabled();
});
