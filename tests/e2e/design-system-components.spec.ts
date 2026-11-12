import { test, expect } from "@playwright/test";

/*
 * BOOKIFY — VISUAL MIGRATION 01.3
 *
 * Verifica que los componentes compartidos
 * adopten la identidad visual de su contexto.
 */

test.describe("Bookify — Design System C1/C2", () => {
  test("botón público utiliza C1", async ({ page }) => {
    await page.goto("/");

    const scope = page.locator('[data-bookify-ui="public"]');

    const button = scope.getByRole("link", {
      name: "Conocer la experiencia",
    });

    await expect(button).toBeVisible();

    const style = await button.evaluate((element) => {
      const css = getComputedStyle(element);

      return {
        background: css.backgroundColor,
        minHeight: css.minHeight,
        borderRadius: css.borderRadius,
        fontFamily: css.fontFamily,
      };
    });

    expect(style.background).toBe("rgb(70, 80, 46)");
    expect(style.minHeight).toBe("48px");
    expect(style.borderRadius).toBe("10px");
    expect(style.fontFamily).toMatch(/Cabin/i);
  });

  test("botón administrativo utiliza C2", async ({ page }) => {
    await page.goto("/login");

    const scope = page.locator('[data-bookify-ui="admin"]');

    const button = scope.getByRole("button", {
      name: "Continuar con identidad",
    });

    await expect(button).toBeVisible();

    const style = await button.evaluate((element) => {
      const css = getComputedStyle(element);

      return {
        background: css.backgroundColor,
        minHeight: css.minHeight,
        borderRadius: css.borderRadius,
        fontFamily: css.fontFamily,
      };
    });

    expect(style.background).toBe("rgb(26, 115, 85)");
    expect(style.minHeight).toBe("40px");
    expect(style.borderRadius).toBe("8px");
    expect(style.fontFamily).toMatch(/Inter/i);
  });

  test("admin mantiene control táctil en móvil", async ({ page }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    });

    await page.goto("/login");

    const button = page.getByRole("button", {
      name: "Continuar con identidad",
    });

    await expect(button).toBeVisible();

    const minHeight = await button.evaluate(
      (element) => getComputedStyle(element).minHeight,
    );

    expect(minHeight).toBe("44px");
  });
});
