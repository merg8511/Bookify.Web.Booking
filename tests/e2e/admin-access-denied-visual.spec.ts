import { expect, test } from "@playwright/test";

/*
 * BOOKIFY — ACCESS DENIED 04.2
 *
 * Validación visual y semántica.
 *
 * No se modifican ni simulan
 * los mecanismos de autorización.
 */

test.describe("Bookify — Access Denied A2", () => {
  test("presenta Horizon y acciones de recuperación", async ({ page }) => {
    await page.goto("/access-denied");

    const scope = page.locator('[data-bookify-ui="admin"]');

    await expect(scope).toBeVisible();

    await expect(
      scope.getByRole("img", {
        name: "Bookify",
      }),
    ).toHaveAttribute("src", "/brand/horizon-admin-inverse.svg");

    await expect(
      scope.getByRole("heading", {
        level: 1,
        name: "No tienes acceso a esta sección",
      }),
    ).toBeVisible();

    await expect(
      scope.getByRole("link", {
        name: "Volver a mi sesión",
      }),
    ).toHaveAttribute("href", "/account");

    await expect(
      scope.getByRole("link", {
        name: "Ir al inicio",
      }),
    ).toHaveAttribute("href", "/");

    await expect(
      scope.getByRole("navigation", {
        name: "Navegación administrativa",
      }),
    ).toHaveCount(0);
  });

  test("mantiene el foco inicial en una acción de recuperación", async ({
    page,
  }) => {
    await page.goto("/access-denied");

    await page.keyboard.press("Tab");

    await expect(
      page.getByRole("link", {
        name: "Volver a mi sesión",
      }),
    ).toBeFocused();
  });

  test("conserva la interfaz en distintos anchos", async ({ page }) => {
    const widths = [360, 390, 768, 1024, 1440];

    for (const width of widths) {
      await page.setViewportSize({
        width,
        height: 900,
      });

      await page.goto("/access-denied");

      await expect(
        page.getByRole("heading", {
          name: "No tienes acceso a esta sección",
        }),
      ).toBeVisible();

      await expect(
        page.getByRole("link", {
          name: "Volver a mi sesión",
        }),
      ).toBeVisible();

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
