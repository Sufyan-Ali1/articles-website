import { test, expect } from "@playwright/test";

const pages = [
  {
    path: "/terms",
    id: "terms",
    title: "Terms & Conditions",
    count: 8,
    anchor: "article-suggestions",
    heading: "Article suggestions",
    preserved:
      "Sending an idea does not create an agreement to publish it, pay for it, respond, or keep it confidential.",
  },
  {
    path: "/disclaimer",
    id: "disclaimer",
    title: "Editorial & Affiliate Disclosures",
    count: 6,
    anchor: "commercial-and-affiliate-links",
    heading: "Commercial and affiliate links",
    preserved: "An external link is not necessarily an affiliate link",
  },
];

for (const config of pages) {
  test(`dynamic legal layout renders the content and responsive design of ${config.path}`, async ({
    page,
  }, testInfo) => {
    await page.goto(config.path);
    const legal = page.locator(`[data-legal-page="${config.id}"]`);
    await expect(legal.getByRole("heading", { level: 1 })).toHaveText(
      config.title,
    );
    const article = legal.getByRole("article", { name: config.title });
    await expect(article.getByRole("heading", { level: 2 })).toHaveCount(
      config.count,
    );
    await expect(article).toContainText(config.preserved);
    const contents = legal.getByRole("navigation", {
      name: "Document contents",
    });
    await expect(contents.getByRole("link")).toHaveCount(config.count);
    await expect(
      legal.getByRole("complementary", { name: "Document information" }),
    ).toBeVisible();
    await expect(
      legal.getByRole("link", { name: "Contact us", exact: true }),
    ).toHaveAttribute("href", "/contact");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://ask-explore.test${config.path}`,
    );
    for (const width of [1920, 1440, 1280, 1024, 834, 760, 640, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const nav = (await page.locator(".header-inner").boundingBox())!;
      const layout = (await legal.locator(":scope > div").boundingBox())!;
      expect(Math.abs(layout.x - nav.x)).toBeLessThan(1);
      expect(Math.abs(layout.width - nav.width)).toBeLessThan(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(contents).toHaveCSS("position", "sticky");
      const articleBox = (await article.boundingBox())!;
      const noteBox = (await legal
        .getByRole("complementary", { name: "Document information" })
        .boundingBox())!;
      expect(Math.abs(noteBox.x - nav.x)).toBeLessThan(1);
      expect(Math.abs(noteBox.width - nav.width)).toBeLessThan(1);
      expect(noteBox.y).toBeGreaterThan(articleBox.y + articleBox.height);
      if (width > 760) {
        const sidebarBox = (await legal
          .locator("[data-legal-sidebar]")
          .boundingBox())!;
        expect(Math.abs(sidebarBox.y - articleBox.y)).toBeLessThan(1);
        expect(Math.abs(sidebarBox.height - articleBox.height)).toBeLessThan(1);
      }
      const image = legal.getByRole("img");
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
          path: testInfo.outputPath(`${config.id}-${width}.png`),
          fullPage: true,
        });
      }
    }
  });

  test(`dynamic legal contents stay sticky and navigate within ${config.path}`, async ({
    page,
    isMobile,
  }, testInfo) => {
    await page.setViewportSize({ width: isMobile ? 390 : 1440, height: 850 });
    await page.goto(config.path);
    const legal = page.locator(`[data-legal-page="${config.id}"]`);
    const contents = legal.getByRole("navigation", {
      name: "Document contents",
    });
    const initial = (await contents.boundingBox())!;
    const stickyTop = await contents.evaluate((node) =>
      parseFloat(getComputedStyle(node).top),
    );
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: "instant" }),
      initial.y - stickyTop + 60,
    );
    await expect
      .poll(async () => Math.abs((await contents.boundingBox())!.y - stickyTop))
      .toBeLessThan(1);
    if (!isMobile) {
      const pinned = (await contents.boundingBox())!;
      expect(Math.abs(pinned.y + pinned.height - 830)).toBeLessThan(1);
      await page.evaluate(() =>
        window.scrollBy({ top: 80, behavior: "instant" }),
      );
      await expect
        .poll(async () =>
          Math.abs((await contents.boundingBox())!.y - pinned.y),
        )
        .toBeLessThan(1);
      expect(
        Math.abs((await contents.boundingBox())!.height - pinned.height),
      ).toBeLessThan(1);
      await page.screenshot({
        path: testInfo.outputPath(`${config.id}-pinned-card.png`),
      });
      const note = legal.getByRole("complementary", {
        name: "Document information",
      });
      const noteDocumentTop =
        (await note.boundingBox())!.y +
        (await page.evaluate(() => window.scrollY));
      await page.evaluate(
        (top) => window.scrollTo({ top, behavior: "instant" }),
        noteDocumentTop - 850 + 40,
      );
      await expect
        .poll(async () => (await contents.boundingBox())!.y)
        .toBeLessThan(stickyTop);
      const cardBox = (await contents.boundingBox())!;
      expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(
        (await note.boundingBox())!.y,
      );
      await page.screenshot({
        path: testInfo.outputPath(`${config.id}-note-reveal.png`),
      });
    }
    await contents
      .getByRole("link", { name: config.heading, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`#${config.anchor}$`));
    const heading = legal.getByRole("heading", {
      name: config.heading,
      exact: true,
    });
    await expect(heading).toBeVisible();
    await expect(
      contents.getByRole("link", { name: config.heading, exact: true }),
    ).toHaveAttribute("aria-current", "location");
    expect((await heading.boundingBox())!.y).toBeGreaterThan(
      await page
        .locator("header")
        .evaluate((node) => node.getBoundingClientRect().bottom),
    );
    await page.screenshot({
      path: testInfo.outputPath(`${config.id}-sticky.png`),
    });
    if (!isMobile) {
      await page.setViewportSize({ width: 1440, height: 1800 });
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      const card = (await contents.boundingBox())!;
      const articleBox = (await legal.getByRole("article").boundingBox())!;
      expect(card.height).toBeLessThanOrEqual(articleBox.height + 1);
    }
  });
}
