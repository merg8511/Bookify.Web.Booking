import { expect, test } from "@playwright/test";

/*
 * BOOKIFY — VISUAL MIGRATION 01.4
 *
 * Accesibilidad global y movimiento reducido.
 *
 * No requiere autenticación ni backend activo.
 */

test.describe("Bookify — Global visual foundations", () => {
  test("el login conserva foco visible por teclado", async ({ page }) => {
    await page.goto("/login");

    await page.keyboard.press("Tab");

    const action = page.getByRole("button", {
      name: "Continuar con identidad",
    });

    await expect(action).toBeFocused();

    await expect(action).toHaveCSS("outline-style", "solid");

    await expect(action).toHaveCSS("outline-width", "3px");

    await expect(action).toHaveCSS("outline-color", "rgb(22, 61, 101)");
  });

  test("la interfaz respeta movimiento reducido", async ({ page }) => {
    await page.emulateMedia({
      reducedMotion: "reduce",
    });

    await page.goto("/login");

    const action = page.getByRole("button", {
      name: "Continuar con identidad",
    });

    await expect(action).toBeVisible();

    const durations = await action.evaluate((element) => {
      const style = getComputedStyle(element);

      return style.transitionDuration.split(",").map((value) => {
        const duration = value.trim();
        const number = Number.parseFloat(duration);

        return duration.endsWith("ms") ? number / 1000 : number;
      });
    });

    expect(
      durations.every(
        (duration) => Number.isFinite(duration) && duration <= 0.001,
      ),
    ).toBe(true);
  });

  test("el público conserva su fondo con movimiento reducido", async ({
    page,
  }) => {
    await page.emulateMedia({
      reducedMotion: "reduce",
    });

    await page.goto("/");

    const scope = page.locator('[data-bookify-ui="public"]');

    await expect(scope).toHaveCSS("background-color", "rgb(248, 244, 238)");

    await expect(page.getByRole("main")).toBeVisible();
  });
});
