import { expect, test } from "@playwright/test";

/*
 * BOOKIFY — VISUAL INTEGRATION CLOSURE
 *
 * DS-003: independencia visual.
 *
 * Verifica la integración entre los scopes
 * público y administrativo.
 *
 * No autentica usuarios ni modifica datos.
 */

const routes = [
  {
    path: "/",
    scope: "public",
    background: "#f8f4ee",
  },
  {
    path: "/properties/not-a-valid-id",
    scope: "public",
    background: "#f8f4ee",
  },
  {
    path: "/login",
    scope: "admin",
    background: "#edf4fc",
  },
  {
    path: "/access-denied",
    scope: "admin",
    background: "#edf4fc",
  },
] as const;

test.describe("Bookify — Visual system boundaries", () => {
  test("las rutas conservan su identidad visual independiente", async ({
    page,
  }) => {
    for (const route of routes) {
      await page.goto(route.path);

      const scope = page.locator(`[data-bookify-ui="${route.scope}"]`);

      await expect(scope).toHaveCount(1);

      const oppositeScope = route.scope === "public" ? "admin" : "public";

      await expect(
        page.locator(`[data-bookify-ui="${oppositeScope}"]`),
      ).toHaveCount(0);

      const background = await scope.evaluate((element) =>
        getComputedStyle(element)
          .getPropertyValue("--color-background")
          .trim()
          .toLowerCase(),
      );

      expect(background, `Color incorrecto en ${route.path}`).toBe(
        route.background,
      );

      await expect(page.getByRole("main")).toHaveCount(1);
    }
  });

  test("la transición entre público y autenticación no contamina los tokens", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator('[data-bookify-ui="public"]')).toBeVisible();

    await page.goto("/login");

    await expect(page.locator('[data-bookify-ui="admin"]')).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Iniciar sesión",
      }),
    ).toBeVisible();

    await page.goto("/");

    await expect(page.locator('[data-bookify-ui="public"]')).toBeVisible();

    await expect(page.locator('[data-bookify-ui="admin"]')).toHaveCount(0);
  });

  test("las pantallas iniciales conservan el reflujo móvil", async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    });

    for (const route of routes) {
      await page.goto(route.path);

      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(
        dimensions.scrollWidth,
        `Overflow horizontal en ${route.path}`,
      ).toBeLessThanOrEqual(dimensions.clientWidth);
    }
  });
});
