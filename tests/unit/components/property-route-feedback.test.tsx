/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import PropertyLoading from "@/app/(public)/properties/[propertyId]/loading";
import PropertyNotFound from "@/app/(public)/properties/[propertyId]/not-found";

/*
 * BOOKIFY — PROPERTY FEEDBACK 03.3
 *
 * Verifica la semántica de los estados
 * sin consultar ni simular el backend.
 */

describe("Property — feedback público", () => {
  it("presenta un estado de carga accesible sin información ficticia", () => {
    render(<PropertyLoading />);

    const main = screen.getByRole("main");

    expect(main).toHaveAttribute("id", "contenido-principal");

    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando información del alojamiento",
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /reservar/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("permite volver al inicio cuando la propiedad no existe", () => {
    render(<PropertyNotFound />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "No encontramos esta propiedad.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Volver al inicio",
      }),
    ).toHaveAttribute("href", "/");

    expect(screen.getByRole("main")).toHaveAttribute(
      "id",
      "contenido-principal",
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
