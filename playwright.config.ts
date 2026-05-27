import { defineConfig, devices } from "@playwright/test";

/**
 * E2E スモーク用 Playwright 設定。
 * - 既に dev サーバが http://localhost:3000 で起動している前提
 * - tests/e2e 配下の *.spec.ts を実行
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PW_BASE_URL || "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
