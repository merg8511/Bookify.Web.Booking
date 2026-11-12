import { test, expect } from "@playwright/test";

/*
 * MÓDULO 25.7 — PLAYWRIGHT BASE
 *
 * Pruebas de navegador de los fundamentos
 * realmente construidos en el Módulo 25.
 *
 * No utilizamos usuarios OIDC reales,
 * credenciales Guest ni reservas ficticias.
 */

test.describe("Bookify — public foundations", () => {
  test("la página pública responde", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
      }),
    ).toContainText("Una estancia especial comienza mucho antes de llegar.");

    await expect(page.getByRole("main")).toBeVisible();
  });

  test("la página de login presenta la acción OIDC", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", {
        name: "Iniciar sesión",
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Continuar con identidad",
      }),
    ).toBeVisible();

    // No hacemos clic porque requiere
    // un proveedor OIDC real.
  });

  test("la página de acceso denegado es comprensible", async ({ page }) => {
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
    ).toHaveAttribute("href", "/account");
  });

  test("la interfaz pública no desborda en móvil", async ({ page }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    });

    await page.goto("/");

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });

  test("la Home editorial es honesta con el alcance actual", async ({
    page,
    request,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("link", {
        name: "Conocer la experiencia",
      }),
    ).toHaveAttribute("href", "#experiencia");

    await expect(
      page.getByText(
        "La búsqueda pública y la reserva en línea todavía no están habilitadas.",
        { exact: false },
      ),
    ).toBeVisible();

    await expect(page.locator("main img")).toHaveCount(3);

    const images = [
      "/images/demo/home-hero.jpg",
      "/images/demo/home-room.jpg",
      "/images/demo/home-terrace.jpg",
    ];

    for (const path of images) {
      const response = await request.get(path);

      expect(response.ok(), `Imagen no disponible: ${path}`).toBe(true);

      expect(response.headers()["content-type"]).toContain("image/jpeg");
    }

    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});

test.describe("Bookify — anonymous security", () => {
  test("un anónimo no accede a /account", async ({ page }) => {
    await page.goto("/account");

    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);

    await expect(
      page.getByRole("heading", {
        name: "Iniciar sesión",
      }),
    ).toBeVisible();
  });

  test("un anónimo no accede a /admin", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);

    await expect(page.getByText("Acceso autorizado")).toHaveCount(0);
  });

  test("la sesión pública anónima no expone secretos", async ({ request }) => {
    const response = await request.get("/api/auth/session");

    expect(response.ok()).toBe(true);

    const body = await response.text();

    expect(body).not.toMatch(
      /bookifyApiAccessToken|refresh_token|id_token|Booking-Guest-Token|client_secret/i,
    );
  });

  test("las rutas internas de diagnóstico no están publicadas", async ({
    request,
  }) => {
    const guestProbe = await request.get("/api/__dev/guest-smoke");

    expect(guestProbe.status()).toBe(404);

    const authProbe = await request.get("/admin/__auth-probe");

    expect(authProbe.status()).toBe(404);
  });
});
