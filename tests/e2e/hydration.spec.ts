import { test, expect } from "@playwright/test";

test("search hydrates with browser extension attributes on html and body", async ({
  page,
}) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydrat|server rendered HTML|didn't match/i.test(message.text())
    )
      hydrationErrors.push(message.text());
  });
  page.on("pageerror", (error) => hydrationErrors.push(error.message));
  await page.addInitScript(() => {
    const injectAttributes = () => {
      document.documentElement?.setAttribute(
        "data-tag-assistant-prod-present",
        "pending:1794471329700",
      );
      if (!document.body) return false;
      document.body.setAttribute("data-new-gr-c-s-check-loaded", "14.1346.0");
      document.body.setAttribute("data-gr-ext-installed", "");
      document.body.setAttribute("cz-shortcut-listen", "true");
      return true;
    };
    if (!injectAttributes()) {
      const observer = new MutationObserver(() => {
        if (injectAttributes()) observer.disconnect();
      });
      observer.observe(document, { childList: true, subtree: true });
    }
  });
  await page.goto("/search?topics=all");
  await expect(page.locator("html")).toHaveAttribute(
    "data-tag-assistant-prod-present",
    "pending:1794471329700",
  );
  await expect(page.locator("body")).toHaveAttribute(
    "data-gr-ext-installed",
    "",
  );
  const topics = page.getByRole("group", { name: "Search topics" });
  await topics.getByRole("button", { name: "Technology", exact: true }).click();
  await expect(page).toHaveURL(/topics=technology/);
  await expect(
    topics.getByRole("button", { name: "Technology", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(hydrationErrors).toEqual([]);
});
