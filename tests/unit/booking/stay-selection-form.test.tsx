/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StaySelectionForm } from "@/features/booking/stay-selection/stay-selection-form";

/*
 * M26.2 — STAY SELECTION TESTS
 *
 * Selección por fecha ISO para evitar coincidencias
 * ambiguas: 2, 12 y 22 del mismo mes.
 *
 * No se simulan disponibilidad ni reservas.
 */

function renderStayForm(today = "2026-11-12") {
  return render(<StaySelectionForm todayInPropertyTimeZone={today} />);
}

/*
 * Cada día tiene un identificador ISO estable.
 * No dependemos de abreviaturas ni expresiones
 * regulares ambiguas sobre nombres de fechas.
 */
function getCalendarDay(
  month: HTMLElement,
  isoDate: string,
): HTMLButtonElement {
  const day = month.querySelector<HTMLButtonElement>(
    `button[data-calendar-day="${isoDate}"]`,
  );

  if (!day) {
    throw new Error(`No se encontró el día ${isoDate} en el mes seleccionado.`);
  }

  return day;
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

    expect(
      screen.getByText("Selecciona una fecha de llegada."),
    ).toHaveAttribute("role", "alert");
  });

  it("deshabilita fechas pasadas", () => {
    renderStayForm();

    const november = screen.getByRole("group", {
      name: "Noviembre de 2026",
    });

    const pastDay = getCalendarDay(november, "2026-11-11");

    const today = getCalendarDay(november, "2026-11-12");

    expect(pastDay).toBeDisabled();
    expect(today).toBeEnabled();

    expect(
      screen.getByRole("button", {
        name: "Mes anterior",
      }),
    ).toBeDisabled();
  });

  it("permite volver al mes actual sin navegar al pasado", async () => {
    const user = userEvent.setup();

    renderStayForm();

    await user.click(
      screen.getByRole("button", {
        name: "Mes siguiente",
      }),
    );

    expect(
      screen.getByRole("group", {
        name: "Diciembre de 2026",
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Mes anterior",
      }),
    );

    expect(
      screen.getByRole("group", {
        name: "Noviembre de 2026",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Mes anterior",
      }),
    ).toBeDisabled();
  });

  it("mantiene noviembre y diciembre al seleccionar un rango", async () => {
    const user = userEvent.setup();

    renderStayForm();

    const november = screen.getByRole("group", {
      name: "Noviembre de 2026",
    });

    const december = screen.getByRole("group", {
      name: "Diciembre de 2026",
    });

    // CAMBIO: fechas exactas; sin regex parcial.
    const arrival = getCalendarDay(november, "2026-11-30");

    const departure = getCalendarDay(december, "2026-12-02");

    expect(arrival).toHaveAccessibleName(/30 de noviembre de 2026/i);

    expect(departure).toHaveAccessibleName(/2 de diciembre de 2026/i);

    await user.click(arrival);
    await user.click(departure);

    expect(arrival).toHaveAttribute("aria-pressed", "true");

    expect(departure).toHaveAttribute("aria-pressed", "true");

    // Ambos meses deben permanecer renderizados.
    expect(
      screen.getByRole("group", {
        name: "Noviembre de 2026",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("group", {
        name: "Diciembre de 2026",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("2 noches")).toBeInTheDocument();
  });

  it("conserva la llegada al cruzar de diciembre a enero", async () => {
    const user = userEvent.setup();

    renderStayForm();

    const december = screen.getByRole("group", {
      name: "Diciembre de 2026",
    });

    await user.click(getCalendarDay(december, "2026-12-30"));

    // Avanzar no debe borrar la llegada.
    await user.click(
      screen.getByRole("button", {
        name: "Mes siguiente",
      }),
    );

    const january = screen.getByRole("group", {
      name: "Enero de 2027",
    });

    await user.click(getCalendarDay(january, "2027-01-02"));

    expect(screen.getByText("3 noches")).toBeInTheDocument();

    expect(screen.getByText("30 dic 2026")).toBeInTheDocument();
  });

  it("permite seleccionar fechas y huéspedes", async () => {
    const user = userEvent.setup();

    renderStayForm();

    const november = screen.getByRole("group", {
      name: "Noviembre de 2026",
    });

    await user.click(getCalendarDay(november, "2026-11-13"));

    await user.click(getCalendarDay(november, "2026-11-15"));

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

    const confirmation = screen.getByRole("status", {
      name: "Resultado de revisión",
    });

    expect(confirmation).toHaveTextContent("Selección revisada.");

    expect(confirmation).toHaveTextContent("2 huéspedes");
  });

  it("no confunde una selección con una reserva", async () => {
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
