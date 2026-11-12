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

const TODAY = "2026-11-12";

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

  it("calcula correctamente estancias entre meses", () => {
    expect(nightsBetween("2026-11-30", "2026-12-02")).toBe(2);
  });

  it("calcula correctamente estancias entre años", () => {
    expect(nightsBetween("2026-12-30", "2027-01-02")).toBe(3);
  });

  it("rechaza una salida igual o anterior a llegada", () => {
    const sameDay = validateStaySelection(
      "2026-12-24",
      "2026-12-24",
      "2",
      TODAY,
    );

    expect(sameDay.dateError).not.toBeNull();

    const reversed = validateStaySelection(
      "2026-12-28",
      "2026-12-24",
      "2",
      TODAY,
    );

    expect(reversed.dateError).not.toBeNull();
  });

  it("rechaza una llegada anterior al día actual", () => {
    const result = validateStaySelection(
      "2026-11-11",
      "2026-11-15",
      "2",
      TODAY,
    );

    expect(result.dateError).toBe(
      "La fecha de llegada no puede estar en el pasado.",
    );

    expect(result.nights).toBeNull();
  });

  it("permite comenzar la estancia el día actual", () => {
    const result = validateStaySelection(TODAY, "2026-11-14", "2", TODAY);

    expect(result.dateError).toBeNull();
    expect(result.nights).toBe(2);
  });

  it("no altera las noches por horario de verano", () => {
    expect(nightsBetween("2026-03-07", "2026-03-10")).toBe(3);
  });

  it("permite navegar entre meses y años", () => {
    expect(addCalendarMonths("2026-12", 1)).toBe("2027-01");

    expect(addCalendarMonths("2027-01", -1)).toBe("2026-12");

    expect(addCalendarDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("organiza el mes comenzando en lunes", () => {
    const days = calendarDaysInMonth("2026-11");

    expect(days[0]).toBeNull();
    expect(days[6]).toBe("2026-11-01");
    expect(days).toContain("2026-11-30");
  });

  it("usa la zona horaria de Property", () => {
    const instant = new Date("2026-11-13T01:30:00Z");

    expect(getTodayInPropertyTimeZone("America/El_Salvador", instant)).toBe(
      "2026-11-12",
    );
  });
});

describe("M26.2 — validación de huéspedes", () => {
  it("rechaza vacío, cero y negativos", () => {
    for (const guests of ["", "0", "-1"]) {
      const result = validateStaySelection(
        "2026-12-24",
        "2026-12-28",
        guests,
        TODAY,
      );

      expect(result.guestError).not.toBeNull();
    }
  });

  it("rechaza decimales y valores fuera de int .NET", () => {
    for (const guests of ["1.5", "2147483648"]) {
      const result = validateStaySelection(
        "2026-12-24",
        "2026-12-28",
        guests,
        TODAY,
      );

      expect(result.guestError).not.toBeNull();
    }
  });

  it("acepta huéspedes positivos sin asumir capacidad", () => {
    const result = validateStaySelection(
      "2026-12-24",
      "2026-12-28",
      "3",
      TODAY,
    );

    expect(result.dateError).toBeNull();
    expect(result.guestError).toBeNull();
    expect(result.guestCount).toBe(3);
    expect(result.nights).toBe(4);
  });

  it("detecta fechas incompletas", () => {
    const result = validateStaySelection("", "", "2", TODAY);

    expect(result.dateError).toBe("Selecciona una fecha de llegada.");

    expect(result.nights).toBeNull();
  });
});
