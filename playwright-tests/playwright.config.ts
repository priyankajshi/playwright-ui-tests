import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import * as path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const consentFile = path.join(__dirname, "./playwright/.auth/consent.json");

dotenv.config({ path: path.resolve(__dirname, ".env.demo") });

export default defineConfig({
  testDir: ".",
  testMatch: "tests/**/*.spec.ts",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [
        ["list"],
        ["blob"],
        ["allure-playwright", { outputFolder: "allure-results" }],
      ]
    : [
        ["html", { outputFolder: "playwright-report" }],
        ["allure-playwright", { outputFolder: "allure-results" }],
      ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "accept-consent",
      testMatch: "setup/acceptConsent.setup.ts",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "signup",
      use: {
        ...devices["Desktop Chrome"],
        locale: process.env.LANGUAGE || "en",
        storageState: consentFile,
      },
      dependencies: ["accept-consent"],
      testMatch: ["tests/**/*.spec.ts"],
    },
  ],
});
