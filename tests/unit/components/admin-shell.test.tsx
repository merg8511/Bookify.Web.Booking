/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { AdminShell } from "@/components/navigation/admin-shell";

/*
 * Prueba estructural del shell.
 * No simula autenticación ni permisos.
 */
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

/*
 * jsdom no implementa de forma completa
 * el dialog modal nativo.
 *
 * Estas funciones prueban nuestra lógica React,
 * no sustituyen el QA en navegador.
 */
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });

  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    },
  });
});

function renderShell() {
  return render(
    <AdminShell>
      <section>
        <h1>Contenido administrativo</h1>
      </section>
    </AdminShell>,
  );
}

describe("Bookify — NAV-A1", () => {
  it("muestra únicamente navegación real", () => {
    renderShell();

    const sidebar = screen.getByRole("complementary", {
      name: "Barra lateral administrativa",
    });

    const nav = within(sidebar).getByRole("navigation", {
      name: "Navegación administrativa",
    });

    const panel = within(nav).getByRole("link", {
      name: "Panel",
    });

    expect(panel).toHaveAttribute("href", "/admin");

    expect(panel).toHaveAttribute("aria-current", "page");

    expect(
      within(sidebar).getByRole("link", {
        name: "Sitio público",
      }),
    ).toHaveAttribute("href", "/");

    expect(
      screen.getByRole("link", {
        name: "Mi cuenta",
      }),
    ).toHaveAttribute("href", "/account");

    expect(
      within(nav).queryByRole("link", {
        name: /reservas|calendario|tarifas/i,
      }),
    ).toBeNull();
  });

  it("mantiene un main único", () => {
    renderShell();

    const main = screen.getByRole("main");

    expect(main).toHaveAttribute("id", "contenido-administrativo");

    expect(
      within(main).getByRole("heading", {
        name: "Contenido administrativo",
      }),
    ).toBeInTheDocument();
  });

  it("abre y cierra el drawer", async () => {
    renderShell();

    const user = userEvent.setup();

    const trigger = screen.getByRole("button", {
      name: "Abrir menú administrativo",
    });

    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: "Menú administrativo",
    });

    expect(dialog).toHaveAttribute("open");

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(
      within(dialog).getByRole("button", {
        name: "Cerrar menú administrativo",
      }),
    );

    await waitFor(() => {
      expect(dialog).not.toHaveAttribute("open");
    });

    expect(trigger).toHaveAttribute("aria-expanded", "false");

    expect(trigger).toHaveFocus();
  });

  it("permite cerrar el drawer con Escape", async () => {
    renderShell();

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", {
        name: "Abrir menú administrativo",
      }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "Menú administrativo",
    });

    /*
     * Simula el evento cancel que dispara
     * el navegador al usar Escape.
     */
    fireEvent(
      dialog,
      new Event("cancel", {
        bubbles: true,
        cancelable: true,
      }),
    );

    await waitFor(() => {
      expect(dialog).not.toHaveAttribute("open");
    });

    expect(
      screen.getByRole("button", {
        name: "Abrir menú administrativo",
      }),
    ).toHaveFocus();
  });
});
