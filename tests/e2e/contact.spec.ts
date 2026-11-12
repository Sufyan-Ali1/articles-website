import { test, expect } from "@playwright/test";

test("contact metadata and connected schema are present in server HTML", async ({
  page,
  request,
}) => {
  const title = "Contact Us for Questions & Feedback | Ask & Explore";
  const description =
    "Contact Ask & Explore about an article, suggest a correction, ask a question, or share a collaboration proposal. Send your message using our contact form.";
  const response = await request.get("/contact");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  const script = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/,
  );
  expect(script).not.toBeNull();
  const schema = JSON.parse(script![1]);
  expect(schema["@context"]).toBe("https://schema.org");
  expect(schema["@graph"]).toHaveLength(21);
  const graph = schema["@graph"] as {
    "@id": string;
    "@type": string;
    acceptedAnswer?: { text: string };
  }[];
  const ids = new Set(graph.map((node) => node["@id"]));
  expect(ids.size).toBe(graph.length);
  function checkReferences(value: unknown) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) return value.forEach(checkReferences);
    const node = value as Record<string, unknown>;
    if (Object.keys(node).length === 1 && typeof node["@id"] === "string")
      expect(ids.has(node["@id"])).toBe(true);
    Object.values(node).forEach(checkReferences);
  }
  graph.forEach(checkReferences);
  expect(graph.find((node) => node["@type"] === "ContactPage")).toMatchObject({
    "@id": "https://ask-explore.test/contact#webpage",
    name: title,
    headline: "Contact Us",
    description,
    isAccessibleForFree: true,
  });
  await page.goto("/contact?reason=correction");
  await expect(page).toHaveTitle(title);
  for (const selector of [
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
  ])
    await expect(page.locator(selector)).toHaveAttribute(
      "content",
      description,
    );
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    1,
  );
  for (const node of graph) {
    const hash = new URL(node["@id"]).hash;
    if (!["#organization", "#website", "#webpage"].includes(hash))
      await expect(page.locator(hash)).toHaveCount(1);
    if (node["@type"] === "Question") {
      const text = (await page.locator(`${hash} p`).innerText()).replace(
        /[“”]/g,
        "",
      );
      expect(text).toBe(node.acceptedAnswer!.text);
    }
  }
  await expect(page.locator("#contact-form")).toHaveAttribute("method", "post");
});

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
    name: "How to Contact Ask & Explore",
  });
  const faqs = contact.getByRole("region", {
    name: "Common Contact Questions",
  });
  await expect(faqs.getByRole("article")).toHaveCount(3);
  const newsletter = contact.getByRole("form", {
    name: "Contact page newsletter signup",
  });
  await expect(newsletter.getByRole("textbox")).toBeEnabled();
  await expect(newsletter.getByRole("button")).toBeEnabled();
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
    const subjects = form
      .getByRole("group", { name: "Subject", exact: true })
      .locator("label");
    const firstSubject = (await subjects.first().boundingBox())!;
    for (const subject of await subjects.all()) {
      const box = (await subject.boundingBox())!;
      expect(Math.abs(box.y - firstSubject.y)).toBeLessThan(1);
      expect(Math.abs(box.width - firstSubject.width)).toBeLessThan(1);
      expect(box.x + box.width).toBeLessThanOrEqual(formBox.x + formBox.width);
    }
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
    .getByRole("link", { name: "Go to message form", exact: true })
    .last()
    .click();
  await expect(page).toHaveURL(/#contact-message-form$/);
  await expect
    .poll(async () => (await contact.getByLabel(/Your name/).boundingBox())!.y)
    .toBeGreaterThan(60);
  await contact
    .getByRole("link", { name: "How we use your information" })
    .click();
  await expect(page).toHaveURL(/\/privacy$/);
  await page.goto("/contact");
  await page
    .getByRole("region", { name: "Common Contact Questions" })
    .getByRole("link", { name: "Request an Article" })
    .click();
  await expect(page).toHaveURL(/\/request-article$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
