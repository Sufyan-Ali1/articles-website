import { test, expect } from "@playwright/test";
import { solveMathCaptcha } from "./solve-captcha";

const newsletterLocations = [
  ["/", "Homepage newsletter signup"],
  ["/about", "About page newsletter signup"],
  ["/articles", "Articles newsletter signup"],
  ["/category/technology", "Articles newsletter signup"],
  ["/contact", "Contact page newsletter signup"],
  ["/request-article", "Article request newsletter signup"],
  ["/articles/electric-car-question", "Newsletter signup"],
  ...[
    "/",
    "/about",
    "/articles",
    "/articles?tag=practical-choices",
    "/category/technology",
    "/categories",
    "/search?search=electric",
    "/contact",
    "/request-article",
    "/articles/electric-car-question",
    "/authors/editorial-team",
    "/privacy",
    "/terms",
    "/disclaimer",
  ].map((path) => [path, "Footer newsletter signup"] as const),
] as const;

for (const [path, label] of newsletterLocations) {
  test(`newsletter submits through the gateway: ${path} ${label}`, async ({
    page,
  }) => {
    await page.goto(path);
    const submissions: unknown[] = [];
    page.on("request", (request) => {
      if (
        request.url().endsWith("/api/v1/subscriptions") &&
        request.method() === "POST"
      )
        submissions.push(request.postDataJSON());
    });
    const form = page.getByRole("form", { name: label, exact: true });
    await form.getByRole("textbox").fill("not-an-email");
    await form.getByRole("button").click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "Please enter a valid email address" }),
    ).toBeVisible();
    expect(submissions).toHaveLength(0);
    await form.getByRole("textbox").fill("LocalFormCheck@Example.com");
    const response = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/v1/subscriptions") &&
        response.request().method() === "POST",
    );
    await form.getByRole("button").click();
    const accepted = await response;
    expect(accepted.status()).toBe(202);
    expect(new URL(accepted.url()).origin).toBe(new URL(page.url()).origin);
    expect(submissions).toEqual([{ email: "localformcheck@example.com" }]);
    await expect(
      page.getByRole("status").filter({ hasText: "You’re subscribed" }),
    ).toBeVisible();
  });
}

for (const [reason, label] of [
  ["general", "General enquiry"],
  ["correction", "Article correction"],
  ["privacy", "Privacy enquiry"],
]) {
  test(`contact form submits ${reason} through the gateway`, async ({
    page,
  }) => {
    await page.goto("/contact");
    const form = page.getByRole("form", {
      name: "Send Us a Message",
      exact: true,
    });
    await form
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    await expect(form.locator("#contact-email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await form.locator("#contact-email").fill("local-check@example.com");
    await form
      .locator("label")
      .filter({ has: page.locator(`input[value="${reason}"]`) })
      .click();
    await expect(form.locator(`input[value="${reason}"]`)).toBeChecked();
    if (reason === "correction")
      await form
        .locator("#contact-article")
        .fill("https://ask-explore.test/articles/electric-car-question");
    await form
      .locator("#contact-message")
      .fill(`Local isolated-backend ${label} submission check.`);
    await solveMathCaptcha(form);
    const response = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/v1/contact-messages") &&
        response.request().method() === "POST",
    );
    await form
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    expect((await response).status()).toBe(202);
    await expect(
      page.getByRole("heading", { name: "Thanks for getting in touch." }),
    ).toBeVisible();
  });
}

test("topic request submits through the gateway without optional contact details", async ({
  page,
}) => {
  await page.goto("/request-article");
  const form = page.locator("#request-form");
  await form
    .locator('input[name="topic"]')
    .fill("A topic for a local isolated-backend test");
  await solveMathCaptcha(form);
  const response = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/article-requests") &&
      response.request().method() === "POST",
  );
  await form
    .getByRole("button", { name: "Send article request", exact: true })
    .click();
  expect((await response).status()).toBe(202);
  await expect(
    page.getByRole("heading", { name: "Curiosity, received." }),
  ).toBeVisible();
});
