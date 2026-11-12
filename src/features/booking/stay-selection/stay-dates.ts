/*
 * M26.2 — STAY DATES
 *
 * Reglas:
 * - Llegada no anterior al día actual de Property.
 * - Salida estrictamente posterior a llegada.
 * - Huéspedes enteros y positivos.
 * - Intervalo [llegada, salida).
 *
 * No se calculan disponibilidad, precios
 * ni capacidad de una unidad.
 */

const MILLISECONDS_PER_DAY = 86_400_000;

export const MAX_API_GUEST_COUNT = 2_147_483_647;

export type StayValidation = {
  dateError: string | null;
  guestError: string | null;
  nights: number | null;
  guestCount: number | null;
};

function dateToIso(date: Date): string {
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseCalendarDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1 || year > 9999) {
    return null;
  }

  const date = new Date(0);

  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(12, 0, 0, 0);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function addCalendarDays(isoDate: string, amount: number): string {
  const date = parseCalendarDate(isoDate);

  if (!date) {
    return isoDate;
  }

  date.setUTCDate(date.getUTCDate() + amount);

  const result = dateToIso(date);

  return parseCalendarDate(result) ? result : isoDate;
}

export function addCalendarMonths(isoMonth: string, amount: number): string {
  const firstDay = parseCalendarDate(`${isoMonth}-01`);

  if (!firstDay) {
    return isoMonth;
  }

  firstDay.setUTCDate(1);
  firstDay.setUTCMonth(firstDay.getUTCMonth() + amount);

  const result = dateToIso(firstDay);

  return parseCalendarDate(result) ? result.slice(0, 7) : isoMonth;
}

export function calendarDaysInMonth(isoMonth: string): Array<string | null> {
  const firstDay = parseCalendarDate(`${isoMonth}-01`);

  if (!firstDay) {
    return [];
  }

  const leadingDays = (firstDay.getUTCDay() + 6) % 7;

  const lastDay = new Date(firstDay);
  lastDay.setUTCMonth(lastDay.getUTCMonth() + 1, 0);

  const totalDays = lastDay.getUTCDate();

  const values: Array<string | null> = Array.from(
    { length: leadingDays },
    () => null,
  );

  for (let day = 1; day <= totalDays; day += 1) {
    values.push(`${isoMonth}-${String(day).padStart(2, "0")}`);
  }

  while (values.length % 7 !== 0) {
    values.push(null);
  }

  return values;
}

export function nightsBetween(
  checkIn: string,
  checkOut: string,
): number | null {
  const start = parseCalendarDate(checkIn);
  const end = parseCalendarDate(checkOut);

  if (!start || !end) {
    return null;
  }

  return Math.round((end.getTime() - start.getTime()) / MILLISECONDS_PER_DAY);
}

/*
 * CAMBIO M26.2:
 * "todayInPropertyTimeZone" se recibe de manera
 * explícita. Nunca se usa la zona horaria del
 * navegador como fuente de autoridad.
 */
export function validateStaySelection(
  checkIn: string,
  checkOut: string,
  guestInput: string,
  todayInPropertyTimeZone: string,
): StayValidation {
  let dateError: string | null = null;
  let nights: number | null = null;

  if (!checkIn) {
    dateError = "Selecciona una fecha de llegada.";
  } else if (!parseCalendarDate(checkIn)) {
    dateError = "La fecha de llegada no es válida.";
  } else if (checkIn < todayInPropertyTimeZone) {
    // CAMBIO: evitar seleccionar una llegada pasada.
    dateError = "La fecha de llegada no puede estar en el pasado.";
  } else if (!checkOut) {
    dateError = "Selecciona una fecha de salida.";
  } else {
    nights = nightsBetween(checkIn, checkOut);

    if (nights === null || nights <= 0) {
      dateError = "La salida debe ser posterior a la llegada.";
      nights = null;
    }
  }

  let guestError: string | null = null;
  let guestCount: number | null = null;

  const normalized = guestInput.trim();

  if (!/^\d+$/.test(normalized)) {
    guestError = "Indica un número entero de huéspedes.";
  } else {
    const parsed = Number(normalized);

    if (
      !Number.isSafeInteger(parsed) ||
      parsed <= 0 ||
      parsed > MAX_API_GUEST_COUNT
    ) {
      guestError = "Indica una cantidad válida de huéspedes.";
    } else {
      guestCount = parsed;
    }
  }

  return {
    dateError,
    guestError,
    nights,
    guestCount,
  };
}

export function formatCalendarDate(isoDate: string): string {
  const date = parseCalendarDate(isoDate);

  if (!date) {
    return "Seleccionar fecha";
  }

  return new Intl.DateTimeFormat("es-SV", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function accessibleCalendarDate(isoDate: string): string {
  const date = parseCalendarDate(isoDate);

  if (!date) {
    return isoDate;
  }

  return new Intl.DateTimeFormat("es-SV", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function calendarMonthTitle(isoMonth: string): string {
  const date = parseCalendarDate(`${isoMonth}-01`);

  if (!date) {
    return isoMonth;
  }

  const title = new Intl.DateTimeFormat("es-SV", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return title.charAt(0).toUpperCase() + title.slice(1);
}

/*
 * El servidor utiliza la zona horaria de Property.
 * No interpretamos DateOnly como hora de check-in.
 */
export function getTodayInPropertyTimeZone(
  timeZoneId: string,
  instant: Date = new Date(),
): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZoneId,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(instant);

    const getPart = (type: string) =>
      parts.find((part) => part.type === type)?.value;

    const year = getPart("year");
    const month = getPart("month");
    const day = getPart("day");

    const value = `${year}-${month}-${day}`;

    if (parseCalendarDate(value)) {
      return value;
    }
  } catch {
    // Fallback técnico si la zona horaria es inválida.
  }

  return instant.toISOString().slice(0, 10);
}
