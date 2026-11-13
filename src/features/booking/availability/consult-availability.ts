"use server";

import type { BookifyApiError } from "@/lib/api/errors/bookify-api-error";
import { executeBookifyRequest } from "@/lib/api/errors/execute-api-request";
import { normalizeThrownError } from "@/lib/api/errors/normalize-api-error";
import { createBookifyServerClient } from "@/lib/api/server-client";

import {
  MAX_API_GUEST_COUNT,
  nightsBetween,
  parseCalendarDate,
} from "@/features/booking/stay-selection/stay-dates";

import type {
  AvailabilityCriteria,
  AvailabilityResponse,
  AvailabilityResult,
} from "./availability-contract";

/*
 * BOOKIFY — M26.3
 * Consulta pública de disponibilidad.
 *
 * Backend real:
 * GET /api/v1/properties/{propertyId}/availability
 *
 * Seguridad:
 * - Solo consulta pública de lectura.
 * - No reenvía cookies ni tokens del navegador.
 * - No expone BOOKIFY_API_BASE_URL.
 * - No crea reservas.
 * - No calcula cotizaciones en el frontend.
 */

const PROPERTY_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

function validationError(detail: string): AvailabilityResult {
  const error: BookifyApiError = {
    kind: "http",
    status: 400,
    type: null,
    title: "Revisa tu selección",
    detail,
    instance: null,
    code: null,
    traceId: null,
    correlationId: null,
    retryAfterSeconds: null,
  };

  return {
    ok: false,
    error,
  };
}

function validateCriteria(
  criteria: AvailabilityCriteria,
): AvailabilityResult | null {
  /*
   * Las Server Functions pueden invocarse
   * fuera de nuestro formulario.
   * Sus argumentos NO son confiables.
   */
  if (!criteria || typeof criteria !== "object") {
    return validationError(
      "No recibimos los datos necesarios para consultar disponibilidad.",
    );
  }

  const { propertyId, checkInDate, checkOutDate, guestCount } = criteria;

  if (
    typeof propertyId !== "string" ||
    !PROPERTY_ID_PATTERN.test(propertyId) ||
    propertyId.toLowerCase() === EMPTY_GUID
  ) {
    return validationError("El identificador del alojamiento no es válido.");
  }

  if (typeof checkInDate !== "string" || !parseCalendarDate(checkInDate)) {
    return validationError("Selecciona una fecha de llegada válida.");
  }

  if (typeof checkOutDate !== "string" || !parseCalendarDate(checkOutDate)) {
    return validationError("Selecciona una fecha de salida válida.");
  }

  const nights = nightsBetween(checkInDate, checkOutDate);

  if (nights === null || nights <= 0) {
    return validationError("La salida debe ser posterior a la llegada.");
  }

  if (
    !Number.isSafeInteger(guestCount) ||
    guestCount < 1 ||
    guestCount > MAX_API_GUEST_COUNT
  ) {
    return validationError("Indica una cantidad válida de huéspedes.");
  }

  return null;
}

/*
 * Es una Server Function pública:
 * el endpoint backend también es público.
 *
 * Nunca añadir aquí un bypass de autorización
 * para operaciones privadas.
 */
export async function consultAvailability(
  criteria: AvailabilityCriteria,
): Promise<AvailabilityResult> {
  const invalid = validateCriteria(criteria);

  if (invalid) {
    return invalid;
  }

  const { propertyId, checkInDate, checkOutDate, guestCount } = criteria;

  const result = await executeBookifyRequest<AvailabilityResponse>(() =>
    createBookifyServerClient().GET(
      "/api/v1/properties/{propertyId}/availability",
      {
        params: {
          path: {
            propertyId,
          },
          query: {
            checkInDate,
            checkOutDate,
            guestCount,
          },
        },
      },
    ),
  );

  /*
   * Conservamos Problem Details normalizado:
   * 400, 404, 409, 429 y errores de red.
   */
  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
    };
  }

  /*
   * Una respuesta HTTP exitosa debe contener
   * el read model esperado.
   *
   * No presentar datos parciales como cotización.
   */
  if (!result.data || !Array.isArray(result.data.availableUnits)) {
    return {
      ok: false,
      error: normalizeThrownError(
        new Error("Availability response was incomplete."),
      ),
    };
  }

  return {
    ok: true,
    data: result.data,
  };
}
