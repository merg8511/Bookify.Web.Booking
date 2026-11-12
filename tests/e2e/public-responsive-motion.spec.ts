import { expect, test } from "@playwright/test";

/*
 * BOOKIFY — 03.4
 *
 * RESP-001: R-P1 Editorial Continuity.
 * MOTION-001: P-M1 Quiet Elegance.
 *
 * No depende de usuarios ni propiedades falsas.
 */

const viewports = [
  { width: 320, height: 720 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 940, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 },
];

async function expectNoHorizontalOverflow(
  page: import("@playwright/test").Page,
) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(
    dimensions.scrollWidth,
    `Overflow: ${JSON.stringify(dimensions)}`,
  ).toBeLessThanOrEqual(dimensions.clientWidth);
}

test.describe("Bookify — R-P1 y P-M1", () => {
  test("Home conserva su jerarquía y no desborda", async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/");

      await page.evaluate(() => document.fonts.ready);

      await expect(
        page.getByRole("heading", {
          level: 1,
          name: /Una estancia especial comienza/i,
        }),
      ).toBeVisible();

      await expect(
        page.getByRole("link", {
          name: "Conocer la experiencia",
        }),
      ).toBeVisible();

      await expectNoHorizontalOverflow(page);
    }
  });

  test("not-found mantiene reflujo y navegación", async ({ page }) => {
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({
        width,
        height: 850,
      });

      await page.goto("/properties/not-a-valid-id");

      await page.evaluate(() => document.fonts.ready);

      await expect(
        page.getByRole("heading", {
          name: "No encontramos esta propiedad.",
        }),
      ).toBeVisible();

      await expect(
        page.getByRole("link", {
          name: "Volver al inicio",
        }),
      ).toBeVisible();

      await expectNoHorizontalOverflow(page);
    }
  });

  test("el hero público utiliza el revelado editorial aprobado", async ({
    page,
  }) => {
    await page.emulateMedia({
      reducedMotion: "no-preference",
    });

    await page.goto("/");

    const heroCopy = page
      .getByRole("heading", {
        level: 1,
        name: /Una estancia especial comienza/i,
      })
      .locator("..");

    await expect(heroCopy).toHaveCSS("animation-duration", "0.38s");
  });

  test("movimiento reducido desactiva el revelado decorativo", async ({
    page,
  }) => {
    await page.emulateMedia({
      reducedMotion: "reduce",
    });

    await page.setViewportSize({
      width: 390,
      height: 844,
    });

    await page.goto("/");

    const heroCopy = page
      .getByRole("heading", {
        level: 1,
        name: /Una estancia especial comienza/i,
      })
      .locator("..");

    await expect(heroCopy).toHaveCSS("animation-name", "none");

    const button = page.getByRole("button", {
      name: "Abrir menú",
    });

    await button.click();

    const navigation = page.getByRole("navigation", {
      name: "Navegación móvil",
    });

    await expect(navigation).toBeVisible();

    await expect(navigation).toHaveCSS("animation-name", "none");
  });
});
