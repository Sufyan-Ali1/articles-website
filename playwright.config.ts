import { defineConfig, devices } from "@playwright/test";
const env = {
  API_USER: "e2e-website",
  API_KEY: "e2e-only-api-key-over-32-characters-long",
  API_BASE_URL: "http://127.0.0.1:4100",
  SITE_URL: "https://ask-explore.test",
  NEXTJS_REVALIDATION_SECRET:
    "e2e-independent-revalidation-secret-over-32-chars",
};
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "*.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  expect: { timeout: 10000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: [
    {
      command: "node tests/e2e/mock-api.mjs",
      url: "http://127.0.0.1:4100/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100",
      env,
      timeout: 180000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
