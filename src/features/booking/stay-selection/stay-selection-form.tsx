"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { consultAvailability } from "@/features/booking/availability/consult-availability";
import { AvailabilityResults } from "@/features/booking/availability/availability-results";

import type {
  AvailabilityCriteria,
  AvailabilityResult,
} from "@/features/booking/availability/availability-contract";

import { normalizeThrownError } from "@/lib/api/errors/normalize-api-error";

import {
  MAX_API_GUEST_COUNT,
  accessibleCalendarDate,
  addCalendarDays,
  addCalendarMonths,
  calendarDaysInMonth,
  calendarMonthTitle,
  formatCalendarDate,
  nightsBetween,
  parseCalendarDate,
  validateStaySelection,
} from "./stay-dates";

import styles from "./stay-selection-form.module.css";

/*
 * BOOKIFY — RESERVATION JOURNEY
 *
 * M26.2: fechas y huéspedes.
 * M26.3: disponibilidad y cotización real.
 *
 * FORM-001: F1.
 * CAL-001: P-CAL1.
 * FEEDBACK-001: FB-P1.
 *
 * Sin selección de unidad ni creación de Booking.
 */

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

type StaySelectionFormProps = {
  propertyId: string;
  todayInPropertyTimeZone: string;
};

type CalendarMonthProps = {
  month: string;
  focusedDay: string;
  checkIn: string;
  checkOut: string;
  today: string;
  secondMonth?: boolean;
  onSelect: (date: string) => void;
  onDayKeyDown: (event: KeyboardEvent<HTMLButtonElement>, date: string) => void;
};

type Consultation = {
  criteria: AvailabilityCriteria;
  result: AvailabilityResult;
};

function CalendarMonth({
  month,
  focusedDay,
  checkIn,
  checkOut,
  today,
  secondMonth = false,
  onSelect,
  onDayKeyDown,
}: CalendarMonthProps) {
  const days = calendarDaysInMonth(month);

  return (
    <div
      className={[styles.month, secondMonth ? styles.secondMonth : ""]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label={calendarMonthTitle(month)}
    >
      <h4 className={styles.monthTitle}>{calendarMonthTitle(month)}</h4>

      <div className={styles.weekDays} aria-hidden="true">
        {WEEK_DAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className={styles.days}>
        {days.map((date, index) => {
          if (!date) {
            return (
              <span
                key={`${month}-empty-${index}`}
                className={styles.emptyDay}
                aria-hidden="true"
              />
            );
          }

          const isPast = date < today;
          const isStart = date === checkIn;
          const isEnd = date === checkOut;

          const inRange =
            Boolean(checkIn && checkOut) && date > checkIn && date < checkOut;

          const selectedLabel = isStart
            ? "Llegada"
            : isEnd
              ? "Salida"
              : inRange
                ? "Dentro de la estancia"
                : null;

          return (
            <button
              key={date}
              type="button"
              data-calendar-day={date}
              disabled={isPast}
              tabIndex={!isPast && date === focusedDay ? 0 : -1}
              className={[
                styles.day,
                isStart || isEnd ? styles.selectedDay : "",
                inRange ? styles.rangeDay : "",
                date === today ? styles.today : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={isStart || isEnd}
              aria-label={[
                accessibleCalendarDate(date),
                selectedLabel,
                isPast ? "Fecha pasada" : null,
                date === today ? "Hoy" : null,
              ]
                .filter(Boolean)
                .join(", ")}
              onClick={() => onSelect(date)}
              onKeyDown={(event) => onDayKeyDown(event, date)}
            >
              {Number(date.slice(-2))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function responseMatchesCriteria(
  result: AvailabilityResult,
  criteria: AvailabilityCriteria,
): boolean {
  if (!result.ok) {
    return true;
  }

  const data = result.data;

  const expectedNights = nightsBetween(
    criteria.checkInDate,
    criteria.checkOutDate,
  );

  return (
    data.propertyId.toLowerCase() === criteria.propertyId.toLowerCase() &&
    data.checkInDate === criteria.checkInDate &&
    data.checkOutDate === criteria.checkOutDate &&
    Number(data.guestCount) === criteria.guestCount &&
    Number(data.numberOfNights) === expectedNights
  );
}

export function StaySelectionForm({
  propertyId,
  todayInPropertyTimeZone,
}: StaySelectionFormProps) {
  const calendarHelpId = useId();
  const dateErrorId = useId();
  const guestInputId = useId();
  const guestErrorId = useId();

  const today = todayInPropertyTimeZone;
  const firstAllowedMonth = today.slice(0, 7);

  const [visibleMonth, setVisibleMonth] = useState(firstAllowedMonth);

  const [focusedDay, setFocusedDay] = useState(today);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestInput, setGuestInput] = useState("");

  const [attempted, setAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [consultation, setConsultation] = useState<Consultation | null>(null);

  const calendarRef = useRef<HTMLDivElement>(null);
  const guestInputRef = useRef<HTMLInputElement>(null);
  const pendingCalendarFocusRef = useRef(false);

  // M26.3: evita consultas simultáneas duplicadas.
  const inFlightRef = useRef(false);

  // M26.3: descarta respuestas de criterios antiguos.
  const requestGenerationRef = useRef(0);

  const nextMonth = addCalendarMonths(visibleMonth, 1);
  const canGoPrevious = visibleMonth > firstAllowedMonth;

  const validation = validateStaySelection(
    checkIn,
    checkOut,
    guestInput,
    today,
  );

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : null;

  useEffect(() => {
    if (!pendingCalendarFocusRef.current) {
      return;
    }

    const day = calendarRef.current?.querySelector<HTMLButtonElement>(
      `[data-calendar-day="${focusedDay}"]`,
    );

    if (day && !day.disabled) {
      day.focus();
      pendingCalendarFocusRef.current = false;
    }
  }, [visibleMonth, focusedDay]);

  /*
   * M26.3:
   * Cualquier cambio de criterios invalida
   * inmediatamente el resultado anterior.
   *
   * Navegar entre meses NO modifica criterios.
   */
  function invalidateConsultation() {
    requestGenerationRef.current += 1;
    setConsultation(null);
  }

  function selectDay(date: string) {
    if (date < today || !parseCalendarDate(date)) {
      return;
    }

    setFocusedDay(date);
    invalidateConsultation();

    if (!checkIn || checkOut || date <= checkIn) {
      setCheckIn(date);
      setCheckOut("");
    } else {
      setCheckOut(date);
    }
  }

  function revealFocusedDay(date: string) {
    if (date < today || !parseCalendarDate(date)) {
      return;
    }

    const targetMonth = date.slice(0, 7);

    const isCompact =
      typeof window !== "undefined" &&
      (typeof window.matchMedia === "function"
        ? window.matchMedia("(max-width: 900px)").matches
        : window.innerWidth <= 900);

    if (isCompact) {
      if (targetMonth !== visibleMonth) {
        setVisibleMonth(targetMonth);
      }
    } else {
      const targetIsVisible =
        targetMonth === visibleMonth || targetMonth === nextMonth;

      if (!targetIsVisible) {
        setVisibleMonth(
          targetMonth < visibleMonth
            ? targetMonth
            : addCalendarMonths(targetMonth, -1),
        );
      }
    }

    pendingCalendarFocusRef.current = true;
    setFocusedDay(date);
  }

  function handleDayKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    date: string,
  ) {
    const selected = parseCalendarDate(date);

    if (!selected) {
      return;
    }

    let offset: number | null = null;

    switch (event.key) {
      case "ArrowLeft":
        offset = -1;
        break;
      case "ArrowRight":
        offset = 1;
        break;
      case "ArrowUp":
        offset = -7;
        break;
      case "ArrowDown":
        offset = 7;
        break;
      case "Home":
        offset = -((selected.getUTCDay() + 6) % 7);
        break;
      case "End":
        offset = 6 - ((selected.getUTCDay() + 6) % 7);
        break;
      default:
        return;
    }

    event.preventDefault();

    const newDate = addCalendarDays(date, offset);

    if (newDate < today) {
      return;
    }

    revealFocusedDay(newDate);
  }

  function changeMonth(amount: number) {
    const month = addCalendarMonths(visibleMonth, amount);

    if (month === visibleMonth || month < firstAllowedMonth) {
      return;
    }

    const firstFocusableDay =
      month === firstAllowedMonth ? today : `${month}-01`;

    pendingCalendarFocusRef.current = true;

    setVisibleMonth(month);
    setFocusedDay(firstFocusableDay);
  }

  function changeGuests(amount: number) {
    const parsed = Number(guestInput);

    const current =
      Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_API_GUEST_COUNT
        ? parsed
        : 0;

    const next = Math.max(1, Math.min(MAX_API_GUEST_COUNT, current + amount));

    invalidateConsultation();
    setGuestInput(String(next));
  }

  /*
   * M26.3:
   * La acción principal consulta datos reales.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);

    if (inFlightRef.current) {
      return;
    }

    const currentValidation = validateStaySelection(
      checkIn,
      checkOut,
      guestInput,
      today,
    );

    if (currentValidation.dateError) {
      const focused = calendarRef.current?.querySelector<HTMLButtonElement>(
        `[data-calendar-day="${focusedDay}"]`,
      );

      if (focused && !focused.disabled) {
        focused.focus();
      }

      return;
    }

    if (currentValidation.guestError || currentValidation.guestCount === null) {
      guestInputRef.current?.focus();
      return;
    }

    const criteria: AvailabilityCriteria = {
      propertyId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestCount: currentValidation.guestCount,
    };

    const requestId = ++requestGenerationRef.current;

    inFlightRef.current = true;
    setIsLoading(true);
    setConsultation(null);

    try {
      const result = await consultAvailability(criteria);

      if (requestId !== requestGenerationRef.current) {
        return;
      }

      /*
       * Defensa adicional:
       * no presentar una cotización correspondiente
       * a otra propiedad, período o cantidad.
       */
      const safeResult: AvailabilityResult = responseMatchesCriteria(
        result,
        criteria,
      )
        ? result
        : {
            ok: false,
            error: normalizeThrownError(
              new Error("Availability response did not match criteria."),
            ),
          };

      setConsultation({
        criteria,
        result: safeResult,
      });
    } catch (error: unknown) {
      if (requestId === requestGenerationRef.current) {
        setConsultation({
          criteria,
          result: {
            ok: false,
            error: normalizeThrownError(error),
          },
        });
      }
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Fechas y huéspedes de la estancia"
    >
      <div className={styles.formIntro}>
        <p className={styles.eyebrow}>PREPARA TU ESTANCIA</p>

        <h3 className={styles.title}>
          Elige tu llegada, tu salida y tus huéspedes.
        </h3>

        <p className={styles.introText}>
          Primero selecciona tus fechas. Después, indica cuántas personas se
          alojarán.
        </p>
      </div>

      <div className={styles.selectionGrid}>
        <fieldset className={styles.dateFieldset}>
          <legend className={styles.fieldLegend}>Fechas de la estancia</legend>

          <div className={styles.dateValues}>
            <div className={styles.dateValue}>
              <span className={styles.valueLabel}>Llegada</span>

              <time
                className={styles.valueText}
                dateTime={checkIn || undefined}
              >
                {formatCalendarDate(checkIn)}
              </time>
            </div>

            <div className={styles.dateValue}>
              <span className={styles.valueLabel}>Salida</span>

              <time
                className={styles.valueText}
                dateTime={checkOut || undefined}
              >
                {formatCalendarDate(checkOut)}
              </time>
            </div>
          </div>

          <p id={calendarHelpId} className={styles.helper}>
            Selecciona la llegada y después la salida. Una nueva selección
            permite cambiar el rango.
          </p>

          <div
            ref={calendarRef}
            className={styles.calendar}
            role="group"
            aria-label="Calendario de estancia"
            aria-describedby={[
              calendarHelpId,
              attempted && validation.dateError ? dateErrorId : null,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={styles.calendarNavigation}>
              <button
                type="button"
                className={styles.calendarArrow}
                aria-label="Mes anterior"
                disabled={!canGoPrevious}
                onClick={() => changeMonth(-1)}
              >
                <CaretLeftIcon size={20} aria-hidden="true" />
              </button>

              <span className={styles.calendarNavigationLabel}>
                Selecciona tu estancia
              </span>

              <button
                type="button"
                className={styles.calendarArrow}
                aria-label="Mes siguiente"
                onClick={() => changeMonth(1)}
              >
                <CaretRightIcon size={20} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.months}>
              <CalendarMonth
                month={visibleMonth}
                focusedDay={focusedDay}
                checkIn={checkIn}
                checkOut={checkOut}
                today={today}
                onSelect={selectDay}
                onDayKeyDown={handleDayKeyDown}
              />

              <CalendarMonth
                month={nextMonth}
                focusedDay={focusedDay}
                checkIn={checkIn}
                checkOut={checkOut}
                today={today}
                secondMonth
                onSelect={selectDay}
                onDayKeyDown={handleDayKeyDown}
              />
            </div>
          </div>

          {attempted && validation.dateError && (
            <p id={dateErrorId} role="alert" className={styles.error}>
              {validation.dateError}
            </p>
          )}
        </fieldset>

        <div className={styles.sidePanel}>
          <div className={styles.guestSection}>
            <label htmlFor={guestInputId} className={styles.fieldLegend}>
              Huéspedes
            </label>

            <div className={styles.guestControl}>
              <button
                type="button"
                className={styles.guestButton}
                aria-label="Quitar huésped"
                disabled={guestInput === "1"}
                onClick={() => changeGuests(-1)}
              >
                <MinusIcon size={18} aria-hidden="true" />
              </button>

              <input
                ref={guestInputRef}
                id={guestInputId}
                className={styles.guestInput}
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_API_GUEST_COUNT}
                step={1}
                value={guestInput}
                placeholder="1"
                aria-invalid={attempted && Boolean(validation.guestError)}
                aria-describedby={
                  attempted && validation.guestError ? guestErrorId : undefined
                }
                onChange={(event) => {
                  invalidateConsultation();
                  setGuestInput(event.target.value);
                }}
              />

              <button
                type="button"
                className={styles.guestButton}
                aria-label="Añadir huésped"
                disabled={guestInput === String(MAX_API_GUEST_COUNT)}
                onClick={() => changeGuests(1)}
              >
                <PlusIcon size={18} aria-hidden="true" />
              </button>
            </div>

            <p className={styles.helper}>
              La capacidad de cada unidad se comprobará al consultar
              disponibilidad.
            </p>

            {attempted && validation.guestError && (
              <p id={guestErrorId} role="alert" className={styles.error}>
                {validation.guestError}
              </p>
            )}
          </div>

          <div className={styles.summary} aria-live="polite">
            <p className={styles.summaryLabel}>TU SELECCIÓN</p>

            {nights !== null && nights > 0 ? (
              <p className={styles.nightCount}>
                {nights} {nights === 1 ? "noche" : "noches"}
              </p>
            ) : (
              <p className={styles.nightPlaceholder}>
                Aún no has completado las fechas.
              </p>
            )}

            <p className={styles.summaryDetail}>
              {validation.guestCount !== null
                ? `${validation.guestCount} ${
                    validation.guestCount === 1 ? "huésped" : "huéspedes"
                  }`
                : "Huéspedes por indicar"}
            </p>
          </div>

          {/* M26.3: acción conectada a disponibilidad */}
          <button
            type="submit"
            className={styles.primaryAction}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading
              ? "Consultando disponibilidad..."
              : "Consultar disponibilidad"}

            {!isLoading && <CaretRightIcon size={20} aria-hidden="true" />}
          </button>

          <p className={styles.disclaimer}>
            Consultar disponibilidad no confirma un precio definitivo ni crea
            una reserva.
          </p>
        </div>
      </div>

      {/* M26.3: feedback y resultados reales */}
      <AvailabilityResults
        criteria={consultation?.criteria ?? null}
        result={consultation?.result ?? null}
        loading={isLoading}
      />
    </form>
  );
}
