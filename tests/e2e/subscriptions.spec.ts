import { test, expect } from "@playwright/test";

test("footer subscription accepts an email through the backend", async ({
  page,
}) => {
  await page.goto("/contact");
  const form = page.getByRole("form", { name: "Footer newsletter signup" });
  const request = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/v1/subscriptions") &&
      request.method() === "POST",
  );
  await form.getByRole("textbox").fill("Reader@Example.com");
  await form.getByRole("button").click();
  expect((await request).postDataJSON()).toEqual({
    email: "reader@example.com",
  });
  await expect(
    page.getByRole("status").filter({ hasText: "You’re subscribed" }),
  ).toBeVisible();
});
