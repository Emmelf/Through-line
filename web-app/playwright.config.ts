import { defineConfig, devices } from "@playwright/test";

// E2E runs against the real Symfony API (http://localhost:8000) backed by MySQL.
// Locally: start the stack first (docker compose up). In CI the job starts it.
export default defineConfig({
  testDir: "./src/tests/e2e",
  timeout: 45_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --host localhost --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
