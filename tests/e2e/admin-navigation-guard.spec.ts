import { expect, test } from "@playwright/test";

/*
 * BOOKIFY — NAV-A1 SECURITY
 *
 * No crear sesiones falsas.
 * Comprobar que la navegación protegida
 * no se expone a visitantes anónimos.
 */

test.describe("Bookify — Admin navigation guard", () => {
  test("un anónimo no recibe el workspace", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);

    await expect(
      page.getByRole("navigation", {
        name: "Navegación administrativa",
      }),
    ).toHaveCount(0);

    await expect(
      page.getByRole("button", {
        name: "Abrir menú administrativo",
      }),
    ).toHaveCount(0);

    await expect(page.getByText("Acceso autorizado")).toHaveCount(0);
  });

  test("login conserva su propia composición", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", {
        name: "Iniciar sesión",
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("navigation", {
        name: "Navegación administrativa",
      }),
    ).toHaveCount(0);
  });
});
