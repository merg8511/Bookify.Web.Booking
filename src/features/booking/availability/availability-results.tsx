import { ApiErrorNotice } from "@/components/ui/api-error-notice";

import { formatCalendarDate } from "@/features/booking/stay-selection/stay-dates";

import type {
  AvailabilityCriteria,
  AvailabilityResult,
  AvailableRentableUnit,
} from "./availability-contract";

import styles from "./availability-results.module.css";

/*
 * M26.3 — AVAILABILITY RESULTS
 *
 * FORM-001: Reservation Journey F1.
 * FEEDBACK-001: Calm & Contextual FB-P1.
 *
 * Solo muestra datos reales de API.
 * No selecciona unidades (M26.4).
 */

type AvailabilityResultsProps = {
  criteria: AvailabilityCriteria | null;
  result: AvailabilityResult | null;
  loading: boolean;
};

function formatMoney(value: number | string, currency: string): string {
  const amount = Number(value);

  if (
    !Number.isFinite(amount) ||
    typeof currency !== "string" ||
    currency.length !== 3
  ) {
    return "Importe no disponible";
  }

  try {
    // Respeta los decimales propios de cada moneda.
    // No calculamos ni recalculamos el precio.
    return new Intl.NumberFormat("es-SV", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return "Importe no disponible";
  }
}

function getUnitType(unit: AvailableRentableUnit): string {
  if (unit.isEntireProperty || unit.type === "EntireProperty") {
    return "Propiedad completa";
  }

  if (unit.type === "Room") {
    return "Habitación";
  }

  return unit.type;
}

function AvailabilityCard({ unit }: { unit: AvailableRentableUnit }) {
  return (
    <li className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIdentity}>
          <p className={styles.cardEyebrow}>OPCIÓN DISPONIBLE</p>

          <h4 className={styles.cardTitle}>{unit.name}</h4>
        </div>

        <span className={styles.unitType}>{getUnitType(unit)}</span>
      </div>

      <p className={styles.capacity}>
        Capacidad máxima: <strong>{unit.maximumCapacity} huéspedes</strong>
      </p>

      <div className={styles.quote}>
        <p className={styles.quoteEyebrow}>COTIZACIÓN INFORMATIVA</p>

        <dl className={styles.breakdown}>
          <div>
            <dt>Alojamiento</dt>
            <dd>
              {formatMoney(unit.quote.accommodationPrice, unit.quote.currency)}
            </dd>
          </div>

          <div>
            <dt>Huéspedes adicionales</dt>
            <dd>
              {formatMoney(unit.quote.extraGuestPrice, unit.quote.currency)}
            </dd>
          </div>
        </dl>

        <div className={styles.total}>
          <span>Total de la estancia</span>

          <div className={styles.totalValue}>
            <strong>
              {formatMoney(unit.quote.totalPrice, unit.quote.currency)}
            </strong>

            <span className={styles.currency}>{unit.quote.currency}</span>
          </div>
        </div>
      </div>
    </li>
  );
}

function AvailabilityLoading() {
  return (
    <div
      className={styles.loading}
      role="status"
      aria-label="Cargando disponibilidad"
    >
      <p className={styles.loadingText}>
        Consultando disponibilidad y cotizaciones...
      </p>

      <div className={styles.loadingCards} aria-hidden="true">
        <div className={styles.loadingCard}>
          <span className={styles.skeletonTitle} />
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonLineShort} />
          <span className={styles.skeletonTotal} />
        </div>

        <div className={styles.loadingCard}>
          <span className={styles.skeletonTitle} />
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonLineShort} />
          <span className={styles.skeletonTotal} />
        </div>
      </div>
    </div>
  );
}

export function AvailabilityResults({
  criteria,
  result,
  loading,
}: AvailabilityResultsProps) {
  if (!loading && !result) {
    return null;
  }

  return (
    <section
      id="availability-results"
      className={styles.results}
      aria-label="Resultados de disponibilidad"
      aria-busy={loading}
    >
      {loading ? (
        <AvailabilityLoading />
      ) : result && !result.ok ? (
        <div className={styles.feedback}>
          <ApiErrorNotice error={result.error} />

          <p className={styles.feedbackHint}>
            {result.error.status === 429
              ? "Se alcanzó el límite de consultas. Respeta el tiempo indicado antes de volver a consultar."
              : result.error.status === 409
                ? "La propiedad o sus condiciones pueden haber cambiado. Conservamos tus criterios para que puedas revisarlos."
                : "Tus fechas y huéspedes se han conservado. Puedes revisarlos y volver a consultar."}
          </p>
        </div>
      ) : result && result.ok && criteria ? (
        <>
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>RESULTADO DE TU CONSULTA</p>

              <h3 className={styles.title}>Opciones para tu estancia</h3>
            </div>

            <p className={styles.consultedCriteria}>
              {formatCalendarDate(criteria.checkInDate)} —{" "}
              {formatCalendarDate(criteria.checkOutDate)}
              {" · "}
              {criteria.guestCount}{" "}
              {criteria.guestCount === 1 ? "huésped" : "huéspedes"}
            </p>
          </div>

          {result.data.availableUnits.length === 0 ? (
            <div className={styles.empty}>
              <h4>Sin opciones para esta estancia</h4>

              <p>
                No encontramos unidades disponibles para las fechas y la
                cantidad de huéspedes consultadas. Puedes cambiar tus criterios
                y realizar otra consulta.
              </p>
            </div>
          ) : (
            <>
              <p className={styles.resultCount}>
                {result.data.availableUnits.length}{" "}
                {result.data.availableUnits.length === 1
                  ? "opción disponible"
                  : "opciones disponibles"}
                {" · "}
                {result.data.numberOfNights}{" "}
                {Number(result.data.numberOfNights) === 1 ? "noche" : "noches"}
              </p>

              <ul className={styles.cards}>
                {result.data.availableUnits.map((unit) => (
                  <AvailabilityCard key={unit.id} unit={unit} />
                ))}
              </ul>

              <p className={styles.informativeNote}>
                Los importes corresponden a la estancia consultada. Son
                cotizaciones informativas: todavía no se ha seleccionado una
                unidad ni creado una reserva.
              </p>
            </>
          )}
        </>
      ) : null}
    </section>
  );
}
