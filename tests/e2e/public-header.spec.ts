import { expect, test } from "@playwright/test";

/*
 * BOOKIFY — NAV-P1
 *
 * Header público:
 * - Horizonte oficial
 * - Navegación real
 * - Menú móvil
 * - Teclado y foco
 * - Sin dependencia de la API de reservas
 */

test.describe("Bookify — NAV-P1", () => {
  test("el header público presenta Horizon y rutas reales", async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 1280,
      height: 800,
    });

    await page.goto("/");

    const header = page.getByRole("banner");

    await expect(header).toBeVisible();

    const logo = header.getByRole("link", {
      name: "Bookify",
    });

    await expect(logo).toHaveAttribute("href", "/");

    await expect(
      logo.getByRole("img", {
        name: "Bookify",
      }),
    ).toHaveAttribute("src", "/brand/horizon-public.svg");

    const navigation = header.getByRole("navigation", {
      name: "Navegación principal",
    });

    await expect(navigation).toBeVisible();

    await expect(
      navigation.getByRole("link", {
        name: "Inicio",
      }),
    ).toHaveAttribute("aria-current", "page");

    await expect(
      header.getByRole("link", {
        name: "Acceso del equipo",
      }),
    ).toHaveAttribute("href", "/login");

    await expect(
      header.getByRole("link", {
        name: /Reservar/,
      }),
    ).toHaveCount(0);
  });

  test("el menú móvil abre y cierra con Escape", async ({ page }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    });

    await page.goto("/");

    const menu = page.locator('nav[aria-label="Navegación móvil"]');

    const openButton = page.getByRole("button", {
      name: "Abrir menú",
    });

    await expect(openButton).toBeVisible();
    await expect(openButton).toHaveAttribute("aria-expanded", "false");

    await expect(menu).toBeHidden();

    await openButton.click();

    const closeButton = page.getByRole("button", {
      name: "Cerrar menú",
    });

    await expect(closeButton).toHaveAttribute("aria-expanded", "true");

    await expect(menu).toBeVisible();

    await menu
      .getByRole("link", {
        name: "Inicio",
      })
      .focus();

    await page.keyboard.press("Escape");

    await expect(menu).toBeHidden();

    await expect(openButton).toHaveAttribute("aria-expanded", "false");

    await expect(openButton).toBeFocused();
  });

  test("el menú se cierra al seleccionar Inicio", async ({ page }) => {
    await page.setViewportSize({
      width: 375,
      height: 812,
    });

    await page.goto("/");

    await page
      .getByRole("button", {
        name: "Abrir menú",
      })
      .click();

    const menu = page.getByRole("navigation", {
      name: "Navegación móvil",
    });

    await menu
      .getByRole("link", {
        name: "Inicio",
      })
      .click();

    await expect(menu).toBeHidden();

    await expect(
      page.getByRole("button", {
        name: "Abrir menú",
      }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  test("el acceso del equipo lleva al login real", async ({ page }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    });

    await page.goto("/");

    await page
      .getByRole("button", {
        name: "Abrir menú",
      })
      .click();

    await page
      .getByRole("navigation", {
        name: "Navegación móvil",
      })
      .getByRole("link", {
        name: "Acceso del equipo",
      })
      .click();

    await expect(page).toHaveURL(/\/login$/);

    await expect(
      page.getByRole("heading", {
        name: "Iniciar sesión",
      }),
    ).toBeVisible();

    // Auth utiliza su propio scope A2,
    // no el header público.
    await expect(page.getByRole("banner")).toHaveCount(0);
  });

  test("permite saltar al contenido con teclado", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", {
      name: "Saltar al contenido principal",
    });

    await expect(skipLink).toBeFocused();

    await page.keyboard.press("Enter");

    await expect(page.locator("#contenido-principal")).toBeFocused();
  });

  test("la propiedad no encontrada conserva el header", async ({ page }) => {
    // ID inválido: evita consultar el backend.
    await page.goto("/properties/not-a-valid-id");

    await expect(page.getByRole("banner")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "No encontramos esta propiedad.",
      }),
    ).toBeVisible();

    await expect(page.locator("#contenido-principal")).toBeVisible();
  });

  test("la navegación expandida no desborda en móvil", async ({ page }) => {
    await page.setViewportSize({
      width: 360,
      height: 780,
    });

    await page.goto("/");

    await page
      .getByRole("button", {
        name: "Abrir menú",
      })
      .click();

    const overflows = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(overflows).toBe(false);
  });
});
