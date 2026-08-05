import { existsSync } from "node:fs";

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

/**
 * Nesta máquina o download do Chromium do Playwright trava (o CDN entrega
 * ~1,5 MB e para), o que deixou a suíte e2e sem rodar de 31/07 a 05/08. Quando
 * o Chrome do sistema existe e não estamos em CI, usamos ele via `channel`.
 * Em CI o `playwright install chromium` roda normalmente e nada muda.
 */
const SYSTEM_CHROME_MACOS =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const useSystemChrome = !process.env.CI && existsSync(SYSTEM_CHROME_MACOS);
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Local: limitamos workers para não afogar o único `next dev` (que compila
  // rota a rota sob demanda) — paralelismo total starva a hidratação e gera
  // corrida de submit nativo. CI roda serial.
  workers: process.env.CI ? 1 : 4,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:3055",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(useSystemChrome ? { channel: "chrome" as const } : {}),
      },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3055",
    // `dev.mjs` sobe na 3055 e, por padrão, abre o browser — desligamos isso
    // no contexto de teste para não spawnar abas a cada run.
    env: { NEXT_OPEN: "0", PORT: "3055" },
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 120_000,
  },
});
