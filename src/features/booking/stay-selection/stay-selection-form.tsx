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
 * M26.2 — RESERVATION JOURNEY F1
 *
 * P-CAL1: calendario de rango conectado.
 * FB-P1: validación contextual.
 *
 * NO consulta disponibilidad ni precios.
 */

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

type StaySelectionFormProps = {
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
              tabIndex={date === focusedDay ? 0 : -1}
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

export function StaySelectionForm({
  todayInPropertyTimeZone,
}: StaySelectionFormProps) {
  const calendarHelpId = useId();
  const dateErrorId = useId();
  const guestHelpId = useId();
  const guestErrorId = useId();

  const [visibleMonth, setVisibleMonth] = useState(
    todayInPropertyTimeZone.slice(0, 7),
  );

  const [focusedDay, setFocusedDay] = useState(todayInPropertyTimeZone);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestInput, setGuestInput] = useState("");

  const [attempted, setAttempted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const guestInputRef = useRef<HTMLInputElement>(null);
  const pendingCalendarFocusRef = useRef(false);

  const nextMonth = addCalendarMonths(visibleMonth, 1);

  const validation = validateStaySelection(checkIn, checkOut, guestInput);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : null;

  /*
   * Cuando se navega por teclado o por mes,
   * trasladar el foco al día correspondiente.
   */
  useEffect(() => {
    if (!pendingCalendarFocusRef.current) {
      return;
    }

    const day = calendarRef.current?.querySelector<HTMLButtonElement>(
      `[data-calendar-day="${focusedDay}"]`,
    );

    if (day) {
      day.focus();
      pendingCalendarFocusRef.current = false;
    }
  }, [visibleMonth, focusedDay]);

  function revealDay(date: string, moveFocus: boolean) {
    if (moveFocus) {
      pendingCalendarFocusRef.current = true;
    }

    setFocusedDay(date);

    // El mes con foco siempre pasa a ser el primero.
    // Así el foco nunca queda oculto en móvil.
    if (date.slice(0, 7) !== visibleMonth) {
      setVisibleMonth(date.slice(0, 7));
    }
  }

  function selectDay(date: string) {
    revealDay(date, true);
    setConfirmed(false);

    if (!checkIn || checkOut || date <= checkIn) {
      setCheckIn(date);
      setCheckOut("");
    } else {
      setCheckOut(date);
    }
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

    revealDay(newDate, true);
  }

  function changeMonth(amount: number) {
    const month = addCalendarMonths(visibleMonth, amount);

    if (month === visibleMonth) {
      return;
    }

    setVisibleMonth(month);

    const firstDay = `${month}-01`;

    pendingCalendarFocusRef.current = true;
    setFocusedDay(firstDay);
  }

  function changeGuests(amount: number) {
    const parsed = Number(guestInput);

    const current =
      Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_API_GUEST_COUNT
        ? parsed
        : 1;

    const next = Math.max(1, Math.min(MAX_API_GUEST_COUNT, current + amount));

    setGuestInput(String(next));
    setConfirmed(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);

    const result = validateStaySelection(checkIn, checkOut, guestInput);

    if (result.dateError) {
      pendingCalendarFocusRef.current = true;

      const focused = calendarRef.current?.querySelector<HTMLButtonElement>(
        `[data-calendar-day="${focusedDay}"]`,
      );

      focused?.focus();
      setConfirmed(false);
      return;
    }

    if (result.guestError) {
      guestInputRef.current?.focus();
      setConfirmed(false);
      return;
    }

    // Confirmación LOCAL de criterios.
    // No se envía una reserva ni una consulta de API.
    setConfirmed(true);
  }

  const minusDisabled = guestInput === "1";

  const plusDisabled = guestInput === String(MAX_API_GUEST_COUNT);

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

              <output className={styles.valueText}>
                {formatCalendarDate(checkIn)}
              </output>
            </div>

            <div className={styles.dateValue}>
              <span className={styles.valueLabel}>Salida</span>

              <output className={styles.valueText}>
                {formatCalendarDate(checkOut)}
              </output>
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
                today={todayInPropertyTimeZone}
                onSelect={selectDay}
                onDayKeyDown={handleDayKeyDown}
              />

              <CalendarMonth
                month={nextMonth}
                focusedDay={focusedDay}
                checkIn={checkIn}
                checkOut={checkOut}
                today={todayInPropertyTimeZone}
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
            <label htmlFor={guestHelpId} className={styles.fieldLegend}>
              Huéspedes
            </label>

            <div className={styles.guestControl}>
              <button
                type="button"
                className={styles.guestButton}
                aria-label="Quitar huésped"
                disabled={minusDisabled}
                onClick={() => changeGuests(-1)}
              >
                <MinusIcon size={18} aria-hidden="true" />
              </button>

              <input
                ref={guestInputRef}
                id={guestHelpId}
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
                  setGuestInput(event.target.value);
                  setConfirmed(false);
                }}
              />

              <button
                type="button"
                className={styles.guestButton}
                aria-label="Añadir huésped"
                disabled={plusDisabled}
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

          <button type="submit" className={styles.primaryAction}>
            Revisar selección
            <CaretRightIcon size={20} aria-hidden="true" />
          </button>

          <p className={styles.disclaimer}>
            Esta selección no confirma disponibilidad, precio ni reserva.
          </p>
        </div>
      </div>

      {confirmed && (
        <div className={styles.confirmation} role="status">
          <strong>Selección revisada.</strong>
          <span>
            Elegiste {formatCalendarDate(checkIn)} al{" "}
            {formatCalendarDate(checkOut)}, con {validation.guestCount}{" "}
            {validation.guestCount === 1 ? "huésped" : "huéspedes"}. Los
            criterios son válidos para continuar con la futura consulta de
            disponibilidad.
          </span>
        </div>
      )}
    </form>
  );
}
