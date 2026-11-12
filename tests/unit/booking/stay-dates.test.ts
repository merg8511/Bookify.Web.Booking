import { describe, expect, it } from "vitest";

import {
  addCalendarDays,
  addCalendarMonths,
  calendarDaysInMonth,
  getTodayInPropertyTimeZone,
  nightsBetween,
  parseCalendarDate,
  validateStaySelection,
} from "@/features/booking/stay-selection/stay-dates";

describe("M26.2 — fechas de estancia", () => {
  it("acepta fechas válidas y rechaza días inexistentes", () => {
    expect(parseCalendarDate("2028-02-29")).not.toBeNull();
    expect(parseCalendarDate("2027-02-29")).toBeNull();
    expect(parseCalendarDate("2026-13-01")).toBeNull();
    expect(parseCalendarDate("2026-11-31")).toBeNull();
  });

  it("calcula noches con intervalo [llegada, salida)", () => {
    expect(nightsBetween("2026-12-24", "2026-12-28")).toBe(4);

    expect(nightsBetween("2026-12-24", "2026-12-25")).toBe(1);
  });

  it("no permite una salida igual o anterior a la llegada", () => {
    const sameDay = validateStaySelection("2026-12-24", "2026-12-24", "2");

    expect(sameDay.dateError).not.toBeNull();

    const reversed = validateStaySelection("2026-12-28", "2026-12-24", "2");

    expect(reversed.dateError).not.toBeNull();
  });

  it("no altera las noches por cambios de horario de verano", () => {
    expect(nightsBetween("2026-03-07", "2026-03-10")).toBe(3);
  });

  it("permite navegar entre meses y años", () => {
    expect(addCalendarMonths("2026-12", 1)).toBe("2027-01");

    expect(addCalendarMonths("2027-01", -1)).toBe("2026-12");

    expect(addCalendarDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("organiza el mes comenzando en lunes", () => {
    const days = calendarDaysInMonth("2026-11");

    // 1 de noviembre de 2026 es domingo.
    expect(days[0]).toBeNull();
    expect(days[6]).toBe("2026-11-01");
    expect(days).toContain("2026-11-30");
  });

  it("usa la zona horaria de la propiedad para el mes inicial", () => {
    const instant = new Date("2026-11-13T01:30:00Z");

    expect(getTodayInPropertyTimeZone("America/El_Salvador", instant)).toBe(
      "2026-11-12",
    );
  });
});

describe("M26.2 — validación de huéspedes", () => {
  it("rechaza una cantidad vacía, cero o negativa", () => {
    for (const guests of ["", "0", "-1"]) {
      const result = validateStaySelection("2026-12-24", "2026-12-28", guests);

      expect(result.guestError).not.toBeNull();
    }
  });

  it("rechaza decimales y valores fuera del entero .NET", () => {
    for (const guests of ["1.5", "2147483648"]) {
      const result = validateStaySelection("2026-12-24", "2026-12-28", guests);

      expect(result.guestError).not.toBeNull();
    }
  });

  it("acepta un entero positivo sin asumir capacidad por unidad", () => {
    const result = validateStaySelection("2026-12-24", "2026-12-28", "3");

    expect(result.dateError).toBeNull();
    expect(result.guestError).toBeNull();
    expect(result.guestCount).toBe(3);
    expect(result.nights).toBe(4);
  });

  it("detecta los campos de fecha incompletos", () => {
    const result = validateStaySelection("", "", "2");

    expect(result.dateError).toBe("Selecciona una fecha de llegada.");

    expect(result.nights).toBeNull();
  });
});
