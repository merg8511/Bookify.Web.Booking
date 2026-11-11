import { expect, test } from "@playwright/test";

const logoAssets = [
  "/brand/horizon-public.svg",
  "/brand/horizon-public-inverse.svg",
  "/brand/horizon-admin.svg",
  "/brand/horizon-admin-inverse.svg",
];

test.describe("Bookify — Horizon assets", () => {
  test("todos los SVG oficiales están disponibles", async ({ request }) => {
    for (const asset of logoAssets) {
      const response = await request.get(asset);

      expect(response.ok(), `Asset no disponible: ${asset}`).toBe(true);

      const content = await response.text();

      expect(content).toMatch(/<svg\b/i);

      // El lettering oficial está trazado:
      // no debe depender de una fuente del navegador.
      expect(content).not.toMatch(/<text\b/i);
    }
  });

  test("favicon contiene tamaños aprobados", async ({ request }) => {
    const response = await request.get("/favicon.ico");

    expect(response.ok()).toBe(true);

    const content = await response.body();

    // Encabezado estándar de archivo ICO.
    expect(content.readUInt16LE(0)).toBe(0);
    expect(content.readUInt16LE(2)).toBe(1);

    const entries = content.readUInt16LE(4);

    const sizes = Array.from({ length: entries }, (_, index) => {
      const encoded = content[6 + index * 16];

      return encoded === 0 ? 256 : encoded;
    });

    expect(sizes).toEqual(expect.arrayContaining([16, 24, 32, 48]));
  });

  test("el navegador recibe metadata del favicon", async ({ page }) => {
    await page.goto("/");

    await expect(
      page
        .locator('head link[rel="icon"]')
        .filter({
          has: undefined,
        })
        .first(),
    ).toHaveAttribute("href", /favicon\.ico/);
  });

  test("Apple Touch Icon está disponible", async ({ request }) => {
    const response = await request.get("/apple-icon.png");

    expect(response.ok()).toBe(true);

    expect(response.headers()["content-type"]).toContain("image/png");
  });
});
