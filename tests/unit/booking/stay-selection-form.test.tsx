/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { StaySelectionForm } from "@/features/booking/stay-selection/stay-selection-form";

import { consultAvailability } from "@/features/booking/availability/consult-availability";

import type {
  AvailabilityResponse,
  AvailabilityResult,
} from "@/features/booking/availability/availability-contract";

import type { BookifyApiError } from "@/lib/api/errors/bookify-api-error";

/*
 * M26.3 — Prueba del contrato de interacción.
 *
 * Solo se simula la frontera con API.
 * No se presentan datos ficticios en producción.
 */
vi.mock("@/features/booking/availability/consult-availability", () => ({
  consultAvailability: vi.fn(),
}));

const PROPERTY_ID = "8b45127a-79e4-4f33-8eca-ff0f2d668b01";

const TODAY = "2026-11-12";

const availability: AvailabilityResponse = {
  propertyId: PROPERTY_ID,
  propertyName: "Propiedad de prueba",
  checkInDate: "2026-11-13",
  checkOutDate: "2026-11-15",
  numberOfNights: 2,
  guestCount: 2,
  availableUnits: [
    {
      id: "71d4bb3a-e421-4ea3-a49e-002681a9210c",
      name: "Habitación de prueba",
      type: "Room",
      maximumCapacity: 4,
      isEntireProperty: false,
      quote: {
        accommodationPrice: 440,
        extraGuestPrice: 75,
        totalPrice: 515,
        currency: "USD",
      },
    },
  ],
};

const rateLimitedError: BookifyApiError = {
  kind: "problem",
  status: 429,
  type: null,
  title: "Demasiadas solicitudes",
  detail: "Inténtalo más tarde.",
  instance: null,
  code: "RateLimit.Exceeded",
  traceId: null,
  correlationId: null,
  retryAfterSeconds: 30,
};

const mockConsultAvailability = vi.mocked(consultAvailability);

beforeEach(() => {
  mockConsultAvailability.mockReset();
});

function renderStayForm(today = TODAY) {
  return render(
    <StaySelectionForm
      propertyId={PROPERTY_ID}
      todayInPropertyTimeZone={today}
    />,
  );
}

function getCalendarDay(
  month: HTMLElement,
  isoDate: string,
): HTMLButtonElement {
  const day = month.querySelector<HTMLButtonElement>(
    `button[data-calendar-day="${isoDate}"]`,
  );

  if (!day) {
    throw new Error(`No se encontró ${isoDate} en el calendario.`);
  }

  return day;
}

async function selectNovemberStay(user: ReturnType<typeof userEvent.setup>) {
  const november = screen.getByRole("group", {
    name: "Noviembre de 2026",
  });

  await user.click(getCalendarDay(november, "2026-11-13"));

  await user.click(getCalendarDay(november, "2026-11-15"));

  await user.type(
    screen.getByRole("spinbutton", {
      name: "Huéspedes",
    }),
    "2",
  );
}

describe("M26.2 — criterios conservados", () => {
  it("exige fechas antes de consultar", async () => {
    const user = userEvent.setup();

    renderStayForm();

    await user.click(
      screen.getByRole("button", {
        name: "Consultar disponibilidad",
      }),
    );

    expect(
      screen.getByText("Selecciona una fecha de llegada."),
    ).toHaveAttribute("role", "alert");

    expect(mockConsultAvailability).not.toHaveBeenCalled();
  });

  it("deshabilita fechas pasadas", () => {
    renderStayForm();

    const november = screen.getByRole("group", {
      name: "Noviembre de 2026",
    });

    expect(getCalendarDay(november, "2026-11-11")).toBeDisabled();

    expect(getCalendarDay(november, TODAY)).toBeEnabled();

    expect(
      screen.getByRole("button", {
        name: "Mes anterior",
      }),
    ).toBeDisabled();
  });

  it("permite volver al mes actual", async () => {
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
  });

  it("mantiene el rango noviembre a diciembre", async () => {
    const user = userEvent.setup();

    renderStayForm();

    const november = screen.getByRole("group", {
      name: "Noviembre de 2026",
    });

    const december = screen.getByRole("group", {
      name: "Diciembre de 2026",
    });

    const arrival = getCalendarDay(november, "2026-11-30");

    const departure = getCalendarDay(december, "2026-12-02");

    await user.click(arrival);
    await user.click(departure);

    expect(arrival).toHaveAttribute("aria-pressed", "true");

    expect(departure).toHaveAttribute("aria-pressed", "true");

    expect(screen.getByText("2 noches")).toBeInTheDocument();

    expect(
      screen.getByRole("group", {
        name: "Noviembre de 2026",
      }),
    ).toBeInTheDocument();
  });

  it("conserva la llegada al cambiar de año", async () => {
    const user = userEvent.setup();

    renderStayForm();

    const december = screen.getByRole("group", {
      name: "Diciembre de 2026",
    });

    await user.click(getCalendarDay(december, "2026-12-30"));

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
  });
});

describe("M26.3 — consulta real de disponibilidad", () => {
  it("envía la propiedad, fechas y huéspedes correctos", async () => {
    const user = userEvent.setup();

    mockConsultAvailability.mockResolvedValue({
      ok: true,
      data: availability,
    });

    renderStayForm();

    await selectNovemberStay(user);

    await user.click(
      screen.getByRole("button", {
        name: "Consultar disponibilidad",
      }),
    );

    await waitFor(() => {
      expect(mockConsultAvailability).toHaveBeenCalledWith({
        propertyId: PROPERTY_ID,
        checkInDate: "2026-11-13",
        checkOutDate: "2026-11-15",
        guestCount: 2,
      });
    });

    expect(
      await screen.findByRole("heading", {
        name: "Opciones para tu estancia",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Habitación de prueba",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Capacidad máxima:", { exact: false }),
    ).toBeInTheDocument();

    expect(screen.getByText(/515/)).toBeInTheDocument();

    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("distingue una consulta sin alternativas", async () => {
    const user = userEvent.setup();

    mockConsultAvailability.mockResolvedValue({
      ok: true,
      data: {
        ...availability,
        availableUnits: [],
      },
    });

    renderStayForm();

    await selectNovemberStay(user);

    await user.click(
      screen.getByRole("button", {
        name: "Consultar disponibilidad",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Sin opciones para esta estancia",
      }),
    ).toBeInTheDocument();

    expect(screen.queryByText("Habitación de prueba")).not.toBeInTheDocument();
  });

  it("muestra el límite 429 sin borrar criterios", async () => {
    const user = userEvent.setup();

    mockConsultAvailability.mockResolvedValue({
      ok: false,
      error: rateLimitedError,
    });

    renderStayForm();

    await selectNovemberStay(user);

    await user.click(
      screen.getByRole("button", {
        name: "Consultar disponibilidad",
      }),
    );

    expect(
      await screen.findByText("Demasiadas solicitudes"),
    ).toBeInTheDocument();

    expect(screen.getByText(/30 segundos/)).toBeInTheDocument();

    expect(screen.getByText("2 noches")).toBeInTheDocument();

    expect(
      screen.getByRole("spinbutton", {
        name: "Huéspedes",
      }),
    ).toHaveValue(2);
  });

  it("invalida la cotización al cambiar huéspedes", async () => {
    const user = userEvent.setup();

    mockConsultAvailability.mockResolvedValue({
      ok: true,
      data: availability,
    });

    renderStayForm();

    await selectNovemberStay(user);

    await user.click(
      screen.getByRole("button", {
        name: "Consultar disponibilidad",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Habitación de prueba",
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Añadir huésped",
      }),
    );

    expect(
      screen.queryByRole("heading", {
        name: "Habitación de prueba",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("spinbutton", {
        name: "Huéspedes",
      }),
    ).toHaveValue(3);
  });

  it("evita un segundo envío mientras consulta", async () => {
    const user = userEvent.setup();

    let completeRequest: ((result: AvailabilityResult) => void) | undefined;

    mockConsultAvailability.mockImplementation(
      () =>
        new Promise<AvailabilityResult>((resolve) => {
          completeRequest = resolve;
        }),
    );

    renderStayForm();

    await selectNovemberStay(user);

    await user.click(
      screen.getByRole("button", {
        name: "Consultar disponibilidad",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Consultando disponibilidad...",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("status", {
        name: "Cargando disponibilidad",
      }),
    ).toBeInTheDocument();

    expect(mockConsultAvailability).toHaveBeenCalledTimes(1);

    completeRequest?.({
      ok: true,
      data: availability,
    });

    expect(
      await screen.findByRole("heading", {
        name: "Habitación de prueba",
      }),
    ).toBeInTheDocument();
  });

  it("no presenta resultados obsoletos", async () => {
    const user = userEvent.setup();

    let completeRequest: ((result: AvailabilityResult) => void) | undefined;

    mockConsultAvailability.mockImplementation(
      () =>
        new Promise<AvailabilityResult>((resolve) => {
          completeRequest = resolve;
        }),
    );

    renderStayForm();

    await selectNovemberStay(user);

    await user.click(
      screen.getByRole("button", {
        name: "Consultar disponibilidad",
      }),
    );

    // Modificar criterios mientras el GET está pendiente.
    await user.click(
      screen.getByRole("button", {
        name: "Añadir huésped",
      }),
    );

    completeRequest?.({
      ok: true,
      data: availability,
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Consultar disponibilidad",
        }),
      ).toBeEnabled();
    });

    // La respuesta anterior era para 2 huéspedes.
    // Ahora el formulario contiene 3.
    expect(
      screen.queryByRole("heading", {
        name: "Habitación de prueba",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("spinbutton", {
        name: "Huéspedes",
      }),
    ).toHaveValue(3);
  });

  it("no simula creación de reservas", () => {
    renderStayForm();

    expect(
      screen.getByText(/no confirma un precio definitivo ni crea una reserva/i),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /confirmar reserva/i,
      }),
    ).not.toBeInTheDocument();
  });
});
