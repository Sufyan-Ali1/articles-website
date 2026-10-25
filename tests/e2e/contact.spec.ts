import { test, expect } from "@playwright/test";

test("contact reference layout keeps the form, information card, FAQs, and complete images aligned", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  await page.goto("/contact");
  const contact = page.locator("[data-contact-page]");
  await expect(contact.getByRole("heading", { level: 1 })).toHaveText(
    "Contact Us",
  );
  const form = contact.getByRole("form", {
    name: "Send Us a Message",
    exact: true,
  });
  await expect(
    form.getByRole("button", { name: "Send message", exact: true }),
  ).toBeEnabled();
  await expect(
    form
      .getByRole("group", { name: "Subject", exact: true })
      .getByRole("radio"),
  ).toHaveCount(3);
  const details = contact.getByRole("complementary", {
    name: "Find the Right Way to Get in Touch",
  });
  const faqs = contact.getByRole("region", { name: "Need a Quick Answer?" });
  await expect(faqs.getByRole("article")).toHaveCount(3);
  const newsletter = contact.getByRole("form", {
    name: "Contact page newsletter signup",
  });
  await expect(newsletter.getByRole("textbox")).toBeDisabled();
  await expect(newsletter.getByRole("button")).toBeDisabled();
  for (const width of [1920, 1440, 1280, 1024, 834, 760, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const header = (await page.locator(".header-inner").boundingBox())!;
    const shell = (await contact.locator(":scope > div").boundingBox())!;
    expect(Math.abs(shell.x - header.x)).toBeLessThan(1);
    expect(Math.abs(shell.width - header.width)).toBeLessThan(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const formBox = (await form.boundingBox())!;
    const detailsBox = (await details.boundingBox())!;
    if (width > 760) {
      expect(Math.abs(formBox.y - detailsBox.y)).toBeLessThan(1);
      expect(formBox.x + formBox.width).toBeLessThan(detailsBox.x);
      expect(
        Math.abs(detailsBox.x + detailsBox.width - header.x - header.width),
      ).toBeLessThan(1);
    } else expect(detailsBox.y).toBeGreaterThan(formBox.y + formBox.height);
    for (const image of await contact.getByRole("img").all()) {
      const box = (await image.boundingBox())!;
      expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThan(1);
      await expect(image).toHaveCSS("object-fit", "contain");
    }
    if ([1440, 834, 390].includes(width)) {
      for (const image of await contact.getByRole("img").all()) {
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
        path: testInfo.outputPath(`contact-${width}.png`),
        fullPage: true,
      });
    }
  }
});

test("contact methods and FAQ links route visitors to the form and article requests", async ({
  page,
}) => {
  await page.goto("/contact");
  const contact = page.locator("[data-contact-page]");
  await expect(
    contact.getByRole("button", { name: "Send message", exact: true }),
  ).toBeEnabled();
  await contact
    .getByRole("link", { name: "Start a conversation", exact: true })
    .click();
  await expect(page).toHaveURL(/#contact-name$/);
  await expect
    .poll(async () => (await contact.getByLabel(/Your name/).boundingBox())!.y)
    .toBeGreaterThan(60);
  await contact
    .getByRole("link", { name: "How we use your information" })
    .click();
  await expect(page).toHaveURL(/\/privacy$/);
  await page.goto("/contact");
  await page
    .getByRole("region", { name: "Need a Quick Answer?" })
    .getByRole("link", { name: "article request form" })
    .click();
  await expect(page).toHaveURL(/\/request-article$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
