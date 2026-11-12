/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import { AccountOverview } from "@/app/account/account-overview";

import { BOOKIFY_ROLES, type BookifyRole } from "@/lib/auth/roles";

/*
 * BOOKIFY — ACCOUNT 04.3
 *
 * Solo presentación.
 * Los guards de sesión se prueban
 * independientemente en session.test.ts.
 */

function renderAccount(roles: readonly BookifyRole[]) {
  return render(
    <AccountOverview
      subject="subject-de-prueba"
      roles={roles}
      signOutAction={async () => {}}
    />,
  );
}

describe("Bookify — Account Overview", () => {
  it("muestra únicamente la identidad proporcionada", () => {
    renderAccount([BOOKIFY_ROLES.Customer]);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Mi cuenta",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("subject-de-prueba")).toBeInTheDocument();

    expect(screen.getByText("Customer")).toBeInTheDocument();

    expect(screen.getByText("Sesión activa")).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Bookify",
      }),
    ).toHaveAttribute("src", "/brand/horizon-admin.svg");
  });

  it("no presenta administración al rol Customer", () => {
    renderAccount([BOOKIFY_ROLES.Customer]);

    expect(
      screen.queryByRole("link", {
        name: "Ir a administración",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Cerrar sesión",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Volver al inicio",
      }),
    ).toHaveAttribute("href", "/");
  });

  it.each([BOOKIFY_ROLES.Admin, BOOKIFY_ROLES.Owner])(
    "permite mostrar el enlace administrativo al rol %s",
    (role) => {
      renderAccount([role]);

      expect(
        screen.getByRole("link", {
          name: "Ir a administración",
        }),
      ).toHaveAttribute("href", "/admin");
    },
  );

  it("maneja una sesión sin roles reconocidos", () => {
    renderAccount([]);

    expect(screen.getByText("Sin roles Bookify asignados")).toBeInTheDocument();

    expect(
      screen.queryByRole("link", {
        name: "Ir a administración",
      }),
    ).not.toBeInTheDocument();
  });

  it("mantiene un único main accesible", () => {
    renderAccount([BOOKIFY_ROLES.Admin]);

    expect(screen.getByRole("main")).toHaveAttribute("id", "contenido-cuenta");

    expect(
      screen.getByRole("link", {
        name: "Saltar al contenido principal",
      }),
    ).toHaveAttribute("href", "#contenido-cuenta");
  });
});
