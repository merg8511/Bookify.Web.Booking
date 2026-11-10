import { defineConfig, devices } from "@playwright/test";

/*
 * MÓDULO 25.7 — PLAYWRIGHT
 *
 * Ejecutamos contra el servidor de producción
 * de Next.js, no contra un backend simulado.
 *
 * Las pruebas base son anónimas y no requieren
 * un proveedor OIDC operativo.
 */

const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",

  fullyParallel: true,

  forbidOnly: Boolean(process.env.CI),

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ["list"],
    [
      "html",
      {
        open: "never",
        outputFolder: "playwright-report",
      },
    ],
  ],

  use: {
    baseURL,

    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: {
    command: "pnpm start --port 3100 --hostname 127.0.0.1",

    url: baseURL,

    /*
     * CAMBIO 25.7:
     * No reutilizamos un servidor existente,
     * para evitar probar por accidente otra
     * versión de Bookify en el mismo puerto.
     */
    reuseExistingServer: false,

    timeout: 120_000,

    stdout: "ignore",
    stderr: "pipe",
  },
});
