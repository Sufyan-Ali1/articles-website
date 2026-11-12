import { test, expect } from "@playwright/test";
import { solveMathCaptcha } from "./solve-captcha";

test("request page publishes the supplied metadata and linked section schema", async ({
  page,
  request,
}) => {
  const description =
    "Suggest an article topic to Ask & Explore. Request a practical guide, clear explanation, or product comparison and tell us what you'd like to learn.";
  const response = await request.get("/request-article");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  const jsonLd = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/,
  );
  expect(jsonLd).not.toBeNull();
  const schema = JSON.parse(jsonLd![1]);
  expect(schema["@context"]).toBe("https://schema.org");
  expect(schema["@graph"]).toHaveLength(8);
  const graph = schema["@graph"] as {
    "@id": string;
    "@type": string;
    name: string;
    hasPart?: {
      "@id"?: string;
      name?: string;
      acceptedAnswer?: { text: string };
    }[];
  }[];
  const webPage = graph.find((node) => node["@type"] === "WebPage")!;
  expect(webPage).toMatchObject({
    "@id": "https://ask-explore.test/request-article#webpage",
    name: "Request an Article or Suggest a Topic | Ask & Explore",
    headline: "Request an Article",
    description,
    mainContentOfPage: {
      "@id": "https://ask-explore.test/request-article#request-form",
    },
  });
  await page.goto("/request-article");
  await expect(page).toHaveTitle(
    "Request an Article or Suggest a Topic | Ask & Explore",
  );
  for (const selector of [
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
  ]) {
    await expect(page.locator(selector)).toHaveAttribute(
      "content",
      description,
    );
  }
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    1,
  );
  for (const part of webPage.hasPart!) {
    expect(graph.some((node) => node["@id"] === part["@id"])).toBe(true);
    await expect(page.locator(new URL(part["@id"]!).hash)).toHaveCount(1);
  }
  const faq = graph.find((node) => node["@id"].endsWith("#quick-answers"))!;
  for (const question of faq.hasPart!) {
    const answer = page
      .locator("#quick-answers article")
      .filter({
        has: page.getByRole("heading", { name: question.name, exact: true }),
      })
      .locator("p");
    await expect(answer).toHaveText(question.acceptedAnswer!.text);
  }
});

test("article request page keeps cards below its hero, scrolling guidance, and always-visible FAQs", async ({
  page,
}, testInfo) => {
  await page.goto("/request-article");
  await expect(page).toHaveTitle(
    "Request an Article or Suggest a Topic | Ask & Explore",
  );
  const request = page.locator("[data-request-page]");
  await expect(request.getByRole("heading", { level: 1 })).toHaveText(
    "Request an Article",
  );
  const hero = request.locator("[data-request-hero]");
  const background = hero.locator("img");
  await expect(background).toHaveAttribute("src", /hero-background/);
  await expect(background).toHaveAttribute("alt", "");
  const form = request.getByRole("form", {
    name: "Suggest an Article Topic",
  });
  await expect(
    form.getByRole("button", { name: "Send article request", exact: true }),
  ).toBeEnabled();
  await expect(form.getByRole("textbox")).toHaveCount(4);
  await expect(form.getByRole("combobox")).toHaveCount(0);
  await expect(form.getByRole("checkbox")).toHaveCount(0);
  await expect(
    form.getByRole("group", { name: "Idea starters" }).getByRole("button"),
  ).toHaveCount(3);
  const how = request.getByRole("complementary", { name: "How It Works" });
  const sidebar = request.locator("[data-request-sidebar]");
  const tip = sidebar.getByRole("region", {
    name: "Make Your Idea Count",
  });
  await expect(how.getByRole("listitem")).toHaveCount(3);
  await expect(tip.getByRole("listitem")).toHaveCount(3);
  await expect(tip.getByRole("link")).toHaveAttribute("href", "/articles");
  const faqs = request.getByRole("region", { name: "Quick Answers" });
  await expect(faqs.getByRole("article")).toHaveCount(3);
  await expect(faqs.locator("details, summary, button")).toHaveCount(0);
  for (const answer of await faqs.locator("article p").all()) {
    await expect(answer).toBeVisible();
  }
  const newsletter = request.getByRole("form", {
    name: "Article request newsletter signup",
  });
  await expect(newsletter.getByRole("textbox")).toBeEnabled();
  await expect(newsletter.getByRole("button")).toBeEnabled();
  for (const width of [1920, 1440, 1280, 1024, 834, 760, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const nav = (await page.locator(".header-inner").boundingBox())!;
    const shell = (await request.locator(":scope > div").boundingBox())!;
    expect(Math.abs(shell.x - nav.x)).toBeLessThan(1);
    expect(Math.abs(shell.width - nav.width)).toBeLessThan(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const formBox = (await form.boundingBox())!;
    const howBox = (await how.boundingBox())!;
    const heroBox = (await hero.boundingBox())!;
    const tipBox = (await tip.boundingBox())!;
    expect(formBox.y).toBeGreaterThan(heroBox.y + heroBox.height);
    expect(howBox.y).toBeGreaterThan(heroBox.y + heroBox.height);
    expect(tipBox.y).toBeGreaterThan(howBox.y + howBox.height);
    await expect(sidebar).toHaveCSS("position", "static");
    if (width > 760) {
      expect(formBox.x + formBox.width).toBeLessThan(howBox.x);
      expect(
        Math.abs(tipBox.y + tipBox.height - formBox.y - formBox.height),
      ).toBeLessThan(1);
      expect(
        Math.abs(howBox.x + howBox.width - nav.x - nav.width),
      ).toBeLessThan(1);
    } else {
      expect(howBox.y).toBeGreaterThan(formBox.y + formBox.height);
    }
    const title = (await hero
      .getByRole("heading", { level: 1 })
      .boundingBox())!;
    expect(Math.abs(title.x + title.width / 2 - width / 2)).toBeLessThan(1);
    const image = background;
    const box = (await image.boundingBox())!;
    expect(Math.abs(box.width - width)).toBeLessThan(1);
    expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThan(1);
    await expect(image).toHaveCSS("object-fit", "contain");
    await expect
      .poll(() =>
        image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    if ([1440, 834, 390].includes(width)) {
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await page.screenshot({
        path: testInfo.outputPath(`request-article-${width}.png`),
        fullPage: true,
      });
      await hero.screenshot({
        path: testInfo.outputPath(`request-hero-${width}.png`),
      });
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  const initialSidebar = (await sidebar.boundingBox())!;
  const initialForm = (await form.boundingBox())!;
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: "instant" }),
    initialSidebar.y - 100,
  );
  await expect
    .poll(async () => {
      const sidebarMovement =
        initialSidebar.y - (await sidebar.boundingBox())!.y;
      const formMovement = initialForm.y - (await form.boundingBox())!.y;
      return Math.abs(sidebarMovement - formMovement);
    })
    .toBeLessThan(1);
  expect(initialSidebar.y - (await sidebar.boundingBox())!.y).toBeGreaterThan(
    100,
  );
  await page.screenshot({
    path: testInfo.outputPath("request-scrolling-sidebar.png"),
  });
});

test("article request starters preserve drafts and a topic can be submitted without contact details", async ({
  page,
}) => {
  let body: Record<string, unknown> | undefined;
  await page.route("**/api/v1/article-requests", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    body = route.request().postDataJSON();
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        data: { message: "Suggestion received by the test handler." },
      }),
    });
  });
  await page.goto("/request-article");
  const request = page.locator("[data-request-page]");
  const topic = request.getByLabel(/What would you like us to cover/);
  await request
    .getByRole("button", { name: "Send article request", exact: true })
    .click();
  await expect(topic).toHaveAttribute("aria-invalid", "true");
  expect(body).toBeUndefined();
  await request
    .getByRole("button", { name: "Explain something", exact: true })
    .click();
  await expect(topic).toHaveValue("How does ");
  await request
    .getByRole("button", { name: "Compare options", exact: true })
    .click();
  await expect(topic).toHaveValue("What’s the difference between ");
  await expect(topic).toBeFocused();
  await expect(topic).toHaveAttribute("aria-invalid", "false");
  await request
    .getByRole("button", { name: "Help me choose", exact: true })
    .click();
  await expect(topic).toHaveValue("How do I choose ");
  expect(
    await topic.evaluate((node) => (node as HTMLInputElement).selectionStart),
  ).toBe("How do I choose ".length);
  await topic.pressSequentially("home chargers");
  await request
    .getByRole("button", { name: "Compare options", exact: true })
    .click();
  await expect(topic).toHaveValue(
    "What’s the difference between home chargers",
  );
  await expect(
    request.getByRole("button", { name: "Compare options", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await topic.fill("A question I have already written");
  await request
    .getByRole("button", { name: "Help me choose", exact: true })
    .click();
  await expect(topic).toHaveValue("A question I have already written");
  await solveMathCaptcha(request.locator(".topic-form"));
  await request
    .getByRole("button", { name: "Send article request", exact: true })
    .click();
  await expect(
    request.getByRole("heading", { name: "Curiosity, received." }),
  ).toBeVisible();
  expect(body).toEqual({
    topic: "A question I have already written",
    website: "",
  });
  await request
    .getByRole("button", { name: "Suggest another topic", exact: true })
    .click();
  await expect(
    request.getByLabel(/What would you like us to cover/),
  ).toHaveValue("");
});
