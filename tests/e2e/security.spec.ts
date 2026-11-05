import { test, expect } from "@playwright/test";

test("Google Analytics initializes once across client-side navigation", async ({
  page,
}) => {
  let loads = 0;
  await page.route(
    "https://www.googletagmanager.com/gtag/js?**",
    async (route) => {
      loads += 1;
      await route.fulfill({ contentType: "application/javascript", body: "" });
    },
  );
  await page.goto("/about");
  const tag = page.locator(
    'script[src="https://www.googletagmanager.com/gtag/js?id=G-RPSXX10VMF"]',
  );
  await expect(tag).toHaveCount(1);
  const configs = () =>
    page.evaluate(() => {
      const layer = (window as Window & { dataLayer?: ArrayLike<unknown>[] })
        .dataLayer;
      return (layer || [])
        .map((entry) => Array.from(entry))
        .filter((entry) => entry[0] === "config" && entry[1] === "G-RPSXX10VMF")
        .length;
    });
  await expect.poll(configs).toBe(1);
  await page
    .locator(".site-header")
    .getByRole("link", { name: "Home", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await expect(tag).toHaveCount(1);
  expect(await configs()).toBe(1);
  // Next.js may preload the resource separately from its script request.
  expect(loads).toBeGreaterThan(0);
});

test("production responses enforce headers and reject unauthenticated cache mutation", async ({
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  const headers = response.headers();
  expect(headers["x-powered-by"]).toBeUndefined();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  expect(headers["strict-transport-security"]).toBe("max-age=31536000");
  expect(headers["content-security-policy"]).toContain(
    "script-src-attr 'none'",
  );
  expect(headers["content-security-policy"]).not.toContain("unsafe-eval");
  const unauthorized = await request.post("/api/revalidate", {
    data: { event: "article.update" },
  });
  expect(unauthorized.status()).toBe(401);
  expect(unauthorized.headers()["cache-control"]).toBe("no-store");
});

test("hostile API article markup cannot execute or change the document origin", async ({
  page,
}) => {
  const dialogs: string[] = [];
  const escapedRequests: string[] = [];
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  await page.route("**/attacker.invalid/**", async (route) => {
    escapedRequests.push(route.request().url());
    await route.abort();
  });
  await page.goto("/articles/security-reader");
  const content = page.locator("#article-content");
  await expect(
    content.getByRole("heading", { name: "Safe article heading" }),
  ).toBeVisible();
  await expect(
    content.locator("base,meta,script,iframe,object,embed,svg,math,form,input"),
  ).toHaveCount(0);
  await expect(
    content.locator(
      "[onclick],[onerror],[srcset],[srcdoc],[style],[data-copy-code]",
    ),
  ).toHaveCount(0);
  await expect(page).toHaveURL(/\/articles\/security-reader$/);
  expect(await page.evaluate(() => document.baseURI)).toBe(page.url());
  expect(dialogs).toEqual([]);
  expect(escapedRequests).toEqual([]);
  // Confirm that the CSP still permits normal Next.js hydration and navigation.
  await page
    .locator(".article-header")
    .getByRole("button", { name: "Save article" })
    .click();
  await expect(
    page
      .locator(".article-header")
      .getByRole("button", { name: "Unsave article" }),
  ).toHaveAttribute("aria-pressed", "true");
});
