import { test, expect } from "@playwright/test";

test("system error matches the new layout and retry fetches a recovered article", async ({
  page,
  request,
}, testInfo) => {
  await request.post("http://127.0.0.1:4100/__control", {
    data: { outage: true },
  });
  try {
    await page.goto("/articles/electric-car-question");
    const error = page.locator("[data-system-error]");
    await expect(error.getByRole("heading", { level: 1 })).toHaveText(
      "This page couldn’t load.",
    );
    await expect(
      error.getByRole("button", { name: "Try again", exact: true }),
    ).toBeEnabled();
    await expect(
      error.getByRole("link", { name: "Explore articles", exact: true }),
    ).toHaveAttribute("href", "/articles");
    await expect(
      error.getByRole("link", { name: "Back to homepage", exact: true }),
    ).toHaveAttribute("href", "/");
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    for (const width of [1440, 834, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`system-error-${width}.png`),
      });
    }
    await request.post("http://127.0.0.1:4100/__control", {
      data: { outage: false },
    });
    await error.getByRole("button", { name: "Try again", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /The electric car question/,
    );
    await expect(error).toHaveCount(0);
  } finally {
    await request.post("http://127.0.0.1:4100/__control", {
      data: { outage: false },
    });
  }
});
