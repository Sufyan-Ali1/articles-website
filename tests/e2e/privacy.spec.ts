import { test, expect } from "@playwright/test";

test("privacy page uses an illustrated hero and numbered sections while retaining its policy", async ({
  page,
}, testInfo) => {
  await page.goto("/privacy");
  const privacy = page.locator('[data-legal-page="privacy"]');
  await expect(privacy.getByRole("heading", { level: 1 })).toHaveText(
    /Privacy Policy.*Your Information/,
  );
  await expect(page).toHaveTitle(/Privacy Policy/);
  const contents = privacy.getByRole("navigation", {
    name: "Document contents",
  });
  await expect(contents.getByRole("link")).toHaveCount(9);
  await expect(
    privacy.getByRole("article").locator("section > span[data-tone] svg"),
  ).toHaveCount(9);
  await expect(
    privacy.getByRole("article").getByRole("heading", { level: 2 }),
  ).toHaveCount(9);
  await expect(privacy.getByRole("article")).toContainText(
    "The site does not include advertising or third-party analytics",
  );
  await expect(privacy.getByRole("article")).toContainText(
    "Our backend receives and stores these messages privately",
  );
  await expect(privacy.getByRole("article")).toContainText(
    "you can suggest a topic without contact details.",
  );
  for (const width of [1920, 1440, 1280, 1024, 834, 760, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const nav = (await page.locator(".header-inner").boundingBox())!;
    const panel = (await privacy.locator(":scope > div").boundingBox())!;
    expect(Math.abs(panel.x - nav.x)).toBeLessThan(1);
    expect(Math.abs(panel.width - nav.width)).toBeLessThan(1);
    const articleBox = (await privacy.getByRole("article").boundingBox())!;
    const noteBox = (await privacy
      .getByRole("complementary", { name: "Document information" })
      .boundingBox())!;
    expect(Math.abs(noteBox.x - nav.x)).toBeLessThan(1);
    expect(Math.abs(noteBox.width - nav.width)).toBeLessThan(1);
    expect(noteBox.y).toBeGreaterThan(articleBox.y + articleBox.height);
    expect(
      await page.evaluate(
        () => globalThis.document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(contents).toHaveCSS("position", "sticky");
    const image = privacy.getByRole("img");
    const box = (await image.boundingBox())!;
    expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThan(1);
    await expect(image).toHaveCSS("object-fit", "contain");
    if ([1440, 834, 390].includes(width)) {
      await expect
        .poll(() =>
          image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: testInfo.outputPath(`privacy-${width}.png`),
        fullPage: true,
      });
    }
  }
});

test("privacy contents stay pinned, scroll independently, and navigate to readable sections", async ({
  page,
  isMobile,
}, testInfo) => {
  await page.setViewportSize({ width: isMobile ? 390 : 1440, height: 900 });
  await page.goto("/privacy");
  const privacy = page.locator('[data-legal-page="privacy"]');
  const contents = privacy.getByRole("navigation", {
    name: "Document contents",
  });
  const initial = (await contents.boundingBox())!;
  const top = await contents.evaluate((node) =>
    parseFloat(getComputedStyle(node).top),
  );
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    initial.y - top + 60,
  );
  await expect
    .poll(async () => Math.abs((await contents.boundingBox())!.y - top))
    .toBeLessThan(1);
  await page.evaluate(() => window.scrollBy({ top: 80, behavior: "instant" }));
  await expect
    .poll(async () => Math.abs((await contents.boundingBox())!.y - top))
    .toBeLessThan(1);
  if (!isMobile) {
    const pinned = (await contents.boundingBox())!;
    expect(Math.abs(pinned.y + pinned.height - 880)).toBeLessThan(1);
    await page.screenshot({
      path: testInfo.outputPath("privacy-pinned-card.png"),
    });
    const note = privacy.getByRole("complementary", {
      name: "Document information",
    });
    const noteTop =
      (await note.boundingBox())!.y +
      (await page.evaluate(() => window.scrollY));
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      noteTop - 900 + 40,
    );
    await expect
      .poll(async () => (await contents.boundingBox())!.y)
      .toBeLessThan(top);
    const card = (await contents.boundingBox())!;
    expect(card.y + card.height).toBeLessThanOrEqual(
      (await note.boundingBox())!.y,
    );
    await page.screenshot({
      path: testInfo.outputPath("privacy-note-reveal.png"),
    });
  }
  await contents
    .getByRole("link", { name: "Contact messages", exact: true })
    .click();
  await expect(page).toHaveURL(/#contact-messages$/);
  const heading = privacy.getByRole("heading", {
    name: "Contact messages",
    exact: true,
  });
  await expect(heading).toBeVisible();
  await expect(
    contents.getByRole("link", { name: "Contact messages", exact: true }),
  ).toHaveAttribute("aria-current", "location");
  const headerBottom = await page
    .locator("header")
    .evaluate((node) => node.getBoundingClientRect().bottom);
  const targetTop = await heading.evaluate(
    (node) =>
      parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) +
      parseFloat(getComputedStyle(node).scrollMarginTop),
  );
  await expect
    .poll(async () => Math.abs((await heading.boundingBox())!.y - targetTop))
    .toBeLessThan(1);
  expect(targetTop).toBeGreaterThan(headerBottom);
  await page.screenshot({
    path: testInfo.outputPath("privacy-sticky-contents.png"),
  });
  if (!isMobile) {
    await page.setViewportSize({ width: 1440, height: 520 });
    await contents.hover();
    const before = await page.evaluate(() => window.scrollY);
    await contents.evaluate((node) => (node.scrollTop = 0));
    await page.mouse.wheel(0, 300);
    await expect
      .poll(() => contents.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  }
});
