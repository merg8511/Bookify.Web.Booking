import { expect, test } from "@playwright/test";

/*
 * BOOKIFY — PROPERTY EDITORIAL P1
 *
 * M26.1 + migración visual 03.2.
 *
 * Sin mocks de API.
 * Sin credenciales ficticias.
 * Sin reservas simuladas.
 */

test.describe("Bookify — Property editorial", () => {
  test("un identificador inválido muestra la página de recurso no encontrado", async ({
    page,
  }) => {
    await page.goto("/properties/not-a-valid-id");

    // Next.js puede responder 200 cuando el resultado
    // notFound() se renderiza mediante streaming.
    // La comprobación funcional es la UI resultante.

    await expect(
      page.getByRole("heading", {
        name: "No encontramos esta propiedad.",
      }),
    ).toBeVisible();

    await expect(page.locator("#contenido-principal")).toBeVisible();

    await expect(
      page.getByRole("link", {
        name: "Volver al inicio",
      }),
    ).toHaveAttribute("href", "/");

    // No presentar imágenes ilustrativas de Property
    // cuando el identificador no corresponde
    // a una propiedad válida.
    await expect(page.getByText(/Fotografía ilustrativa/)).toHaveCount(0);
  });

  test("la fotografía editorial local está disponible", async ({ request }) => {
    const response = await request.get("/images/demo/home-room.jpg");

    expect(response.ok()).toBe(true);

    expect(response.headers()["content-type"]).toContain("image/jpeg");
  });

  test("una propiedad real muestra solo los datos disponibles en el contrato", async ({
    page,
  }) => {
    const propertyId = process.env.BOOKIFY_E2E_PROPERTY_ID;

    test.skip(
      !propertyId,
      "Requiere BOOKIFY_E2E_PROPERTY_ID con un UUID real existente.",
    );

    await page.goto(`/properties/${propertyId}`);

    await expect(
      page.getByRole("heading", {
        level: 1,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Horarios del alojamiento",
      }),
    ).toBeVisible();

    await expect(
      page.getByText("Check-in", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("Check-out", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("Zona horaria", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Fotografía ilustrativa. No corresponde a este alojamiento.",
      ),
    ).toBeVisible();

    await expect(
      page.getByRole("img", {
        name: /fotografía de referencia/i,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: /reservar|confirmar reserva/i,
      }),
    ).toHaveCount(0);

    await expect(
      page.getByRole("link", {
        name: "Volver al inicio",
      }),
    ).toHaveAttribute("href", "/");
  });

  test("la propiedad inexistente mantiene navegación pública en móvil", async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    });

    await page.goto("/properties/not-a-valid-id");

    await expect(
      page.getByRole("button", {
        name: "Abrir menú",
      }),
    ).toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );

    expect(hasOverflow).toBe(false);
  });
});
