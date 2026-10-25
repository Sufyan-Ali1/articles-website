import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/articles",
  "/articles/electric-car-question",
  "/categories",
  "/category/technology",
  "/tag/practical-choices",
  "/search",
  "/about",
  "/contact",
  "/request-article",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/not-a-real-page",
];

test("all page routes share the new navbar and never render the legacy navbar", async ({
  page,
  isMobile,
}, testInfo) => {
  test.setTimeout(60000);
  let baseline: unknown;
  for (const route of routes) {
    await page.goto(route);
    const header = page.locator(".site-header");
    await expect(header).toHaveCount(1);
    await expect(header.locator(".logo")).toHaveText("Ask & Explore");
    await expect(
      header.locator(
        ".logo-mark, .publication-wordmark, .reader-wordmark, .header-request",
      ),
    ).toHaveCount(0);
    await expect(header.locator(".desktop-nav > a")).toHaveText([
      "Home",
      "Articles",
      "About",
    ]);
    await expect(header.locator(".categories-dropdown > button")).toHaveText(
      "Categories",
    );
    const appearance = await header.evaluate((node) => {
      const logo = node.querySelector(".logo")!;
      const inner = node.querySelector(".header-inner")!;
      const box = node.getBoundingClientRect();
      const innerBox = inner.getBoundingClientRect();
      return {
        height: box.height,
        background: getComputedStyle(node).backgroundColor,
        logoSize: getComputedStyle(logo).fontSize,
        x: innerBox.x,
        width: innerBox.width,
        labels: Array.from(node.querySelectorAll(".desktop-nav > a")).map(
          (link) => link.textContent,
        ),
      };
    });
    if (!baseline) baseline = appearance;
    expect(appearance, `Same navbar on ${route}`).toEqual(baseline);
    if (isMobile) {
      await expect(header.locator(".header-search-form")).toBeHidden();
      await header.getByRole("button", { name: "Open navigation" }).click();
      const menu = page.getByRole("dialog");
      await expect(
        menu.getByRole("link", { name: "Home", exact: true }),
      ).toBeVisible();
      await expect(
        menu.getByRole("link", { name: "Articles", exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
    } else {
      await expect(header.locator(".header-search-form")).toBeVisible();
      await expect(
        header.getByRole("button", { name: "Categories", exact: true }),
      ).toBeVisible();
      await expect(
        header.getByRole("link", { name: "Latest", exact: true }),
      ).toHaveCount(0);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (["/", "/articles/electric-car-question", "/about"].includes(route)) {
      await page.screenshot({
        path: testInfo.outputPath(
          `navbar-${route === "/" ? "home" : route === "/about" ? "about" : "article"}.png`,
        ),
      });
    }
  }
});

test("navbar categories and editable search support keyboard navigation and submitted queries", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "Desktop dropdown; compact categories are checked separately.",
  );
  await page.goto("/category/technology");
  const header = page.locator(".site-header");
  const categories = header.getByRole("button", {
    name: "Categories",
    exact: true,
  });
  await expect(categories).toHaveClass(/nav-active/);
  await categories.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#categories-panel")).toBeVisible();
  await expect(
    page
      .locator("#categories-panel")
      .getByRole("link", { name: "Technology", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  await expect(categories).toBeFocused();
  await expect(page.locator("#categories-panel")).toHaveCount(0);
  await header.getByRole("link", { name: "Articles", exact: true }).click();
  await expect(page).toHaveURL(/\/articles$/);
  await expect(
    header.getByRole("link", { name: "Articles", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await header.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  const input = header.getByRole("searchbox", {
    name: "Search published articles",
  });
  await input.click();
  await input.fill("  electric car  ");
  await expect(page).toHaveURL(/\/about$/);
  await header
    .getByRole("button", { name: "Search publication", exact: true })
    .click();
  await expect(page).toHaveURL(/\/search\?search=electric\+car$/);
  await expect(
    page
      .locator("main")
      .getByRole("searchbox", { name: "Search article titles" }),
  ).toHaveValue("electric car");
  await input.fill("laptop");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/search\?search=laptop$/);
  await page.goto("/about");
  await input.fill("   ");
  await input.press("Enter");
  await expect(input).toHaveValue("");
  await expect(page).toHaveURL(/\/about$/);
});

test("navbar search input, right-hand submit icon and request action fit every viewport", async ({
  page,
}, testInfo) => {
  await page.goto("/about");
  const header = page.locator(".site-header");
  const input = header.getByRole("searchbox", {
    name: "Search published articles",
  });
  for (const width of [
    1920, 1440, 1280, 1200, 1100, 1024, 1000, 900, 834, 760, 700, 640, 390, 360,
    320,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    const request = header.getByRole("link", {
      name: "Request a topic",
      exact: true,
    });
    const form = header.getByRole("search", { name: "Search publication" });
    if (width <= 1000) {
      await expect(header.locator(".header-search-form")).toBeHidden();
      await header
        .getByRole("button", { name: "Open search", exact: true })
        .click();
      await expect(input).toBeFocused();
    }
    await expect(input).toBeVisible();
    await expect(request).toBeVisible();
    await expect(request.locator("svg")).toBeVisible();
    const submit = header.getByRole("button", {
      name: "Search publication",
      exact: true,
    });
    const inputBox = (await input.boundingBox())!;
    const submitBox = (await submit.boundingBox())!;
    const formBox = (await form.boundingBox())!;
    expect(inputBox.x + inputBox.width).toBeLessThanOrEqual(submitBox.x);
    expect(formBox.x).toBeGreaterThanOrEqual(0);
    expect(formBox.x + formBox.width).toBeLessThanOrEqual(width);
    const searchBox = (await (
      width > 1000
        ? form
        : header.getByRole("button", { name: "Open search", exact: true })
    ).boundingBox())!;
    const requestBox = (await request.boundingBox())!;
    expect(searchBox.x + searchBox.width).toBeLessThanOrEqual(requestBox.x);
    expect(requestBox.x + requestBox.width).toBeLessThanOrEqual(width);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await input.fill("electric car");
    await expect(page).toHaveURL(/\/about$/);
    if ([1440, 834, 390, 320].includes(width))
      await page.screenshot({
        path: testInfo.outputPath(`navbar-input-${width}.png`),
      });
    if (width <= 1000) {
      await page.keyboard.press("Escape");
      await expect(header.locator(".header-search-form")).toBeHidden();
      await expect(
        header.getByRole("button", { name: "Open search", exact: true }),
      ).toBeFocused();
    }
  }
  await header
    .getByRole("button", { name: "Open search", exact: true })
    .click();
  await input.fill("electric");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/search\?search=electric$/);
  await header
    .getByRole("link", { name: "Request a topic", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/request-article$/);
});

test("mobile navigation provides the main links and expandable categories", async ({
  page,
  isMobile,
}) => {
  test.skip(
    !isMobile,
    "Mobile categories are displayed in the navigation sheet.",
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const menu = page.getByRole("dialog");
  for (const name of ["Home", "Articles", "About"])
    await expect(menu.getByRole("link", { name, exact: true })).toBeVisible();
  await menu.locator("summary").filter({ hasText: "Categories" }).click();
  await expect(
    menu.getByRole("link", { name: "Explore all categories", exact: true }),
  ).toBeVisible();
  await menu.getByRole("link", { name: "Technology", exact: true }).click();
  await expect(page).toHaveURL(/\/category\/technology$/);
  await expect(menu).toBeHidden();
});
