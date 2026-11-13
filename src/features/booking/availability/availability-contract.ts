import type { components } from "@/lib/api/generated/booking-v1";
import type { BookifyApiError } from "@/lib/api/errors/bookify-api-error";

/*
 * BOOKIFY — M26.3
 * Availability + quote.
 *
 * El response proviene del OpenAPI real.
 * No duplicar manualmente propiedades de API.
 */

export type AvailabilityResponse =
  components["schemas"]["GetAvailabilityResponse"];

export type AvailableRentableUnit =
  components["schemas"]["AvailableRentableUnitResponse"];

export type AvailabilityQuote =
  components["schemas"]["AvailabilityQuoteResponse"];

export type AvailabilityCriteria = {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
};

/*
 * Resultado serializable de una Server Function.
 *
 * No incluir Response, Headers u objetos
 * internos de fetch en la transferencia
 * hacia el Client Component.
 */
export type AvailabilityResult =
  | {
      ok: true;
      data: AvailabilityResponse;
    }
  | {
      ok: false;
      error: BookifyApiError;
    };
