import { expect, test } from "@playwright/test";

/*
 * BOOKIFY — LOGIN VISUAL 04.1
 *
 * Verificaciones de la pantalla puente OIDC.
 *
 * No se utilizan credenciales ni sesiones
 * de prueba inventadas.
 */

test.describe("Bookify — Login Concierge A2", () => {
  test("presenta Horizon y conserva la acción OIDC", async ({ page }) => {
    await page.goto("/login");

    const scope = page.locator('[data-bookify-ui="admin"]');

    await expect(
      scope.getByRole("heading", {
        level: 1,
        name: "Iniciar sesión",
      }),
    ).toBeVisible();

    await expect(
      scope.getByRole("img", {
        name: "Bookify",
      }),
    ).toHaveAttribute("src", "/brand/horizon-admin-inverse.svg");

    await expect(
      scope.getByRole("button", {
        name: "Continuar con identidad",
      }),
    ).toBeVisible();

    await expect(
      scope.getByRole("link", {
        name: "Volver al inicio",
      }),
    ).toHaveAttribute("href", "/");

    // Las credenciales pertenecen a Keycloak.
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test("conserva el primer foco en el botón OIDC", async ({ page }) => {
    await page.goto("/login");

    await page.keyboard.press("Tab");

    await expect(
      page.getByRole("button", {
        name: "Continuar con identidad",
      }),
    ).toBeFocused();
  });

  test("no presenta overflow horizontal", async ({ page }) => {
    for (const width of [360, 390, 768, 1280, 1440]) {
      await page.setViewportSize({
        width,
        height: 900,
      });

      await page.goto("/login");

      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(dimensions.scrollWidth).toBeLessThanOrEqual(
        dimensions.clientWidth,
      );
    }
  });
});
