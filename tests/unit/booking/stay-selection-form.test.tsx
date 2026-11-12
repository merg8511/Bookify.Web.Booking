/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StaySelectionForm } from "@/features/booking/stay-selection/stay-selection-form";

function renderStayForm() {
  return render(<StaySelectionForm todayInPropertyTimeZone="2026-11-12" />);
}

describe("M26.2 — formulario de estancia", () => {
  it("solicita las fechas antes de revisar criterios", async () => {
    const user = userEvent.setup();

    renderStayForm();

    await user.click(
      screen.getByRole("button", {
        name: "Revisar selección",
      }),
    );

    // También se muestra el error de huéspedes,
    // por lo que buscamos el mensaje específico.
    expect(
      screen.getByText("Selecciona una fecha de llegada."),
    ).toHaveAttribute("role", "alert");
  });

  it("permite seleccionar dos fechas y huéspedes", async () => {
    const user = userEvent.setup();

    const { container } = renderStayForm();

    const arrival = container.querySelector<HTMLButtonElement>(
      '[data-calendar-day="2026-11-13"]',
    );

    const departure = container.querySelector<HTMLButtonElement>(
      '[data-calendar-day="2026-11-15"]',
    );

    expect(arrival).not.toBeNull();
    expect(departure).not.toBeNull();

    await user.click(arrival!);
    await user.click(departure!);

    const guests = screen.getByRole("spinbutton", {
      name: "Huéspedes",
    });

    await user.type(guests, "2");

    expect(screen.getByText("2 noches")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Revisar selección",
      }),
    );

    const confirmation = screen.getByRole("status");

    expect(confirmation).toHaveTextContent("Selección revisada.");

    expect(confirmation).toHaveTextContent("2 huéspedes");
  });

  it("no confunde una selección válida con disponibilidad", async () => {
    const user = userEvent.setup();

    renderStayForm();

    expect(
      screen.getByText(/no confirma disponibilidad, precio ni reserva/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Revisar selección",
      }),
    );

    expect(screen.queryByText("Reserva confirmada")).not.toBeInTheDocument();
  });
});
