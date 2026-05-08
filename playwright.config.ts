import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — testes e2e da Escola.
 *
 * Os testes rodam contra um servidor `next dev` local levantado pelo
 * próprio Playwright (`webServer.command`). O reuso de servidor já
 * em execução acelera o ciclo local.
 *
 * Em CI, browsers precisam ser instalados antes:
 *   npx playwright install --with-deps chromium
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 120_000,
  },
});
