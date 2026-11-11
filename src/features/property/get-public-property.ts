import "server-only";
import { cache } from "react";
import type { components } from "@/lib/api/generated/booking-v1";
import { createBookifyServerClient } from "@/lib/api/server-client";
import { executeBookifyRequest } from "@/lib/api/errors/execute-api-request";

/*
 * MÓDULO 26.1 — PROPERTY READ
 *
 * Reutilizamos el contrato OpenAPI.
 * No duplicamos manualmente el response del backend.
 */
export type PublicProperty = components["schemas"]["GetPropertyByIdResponse"];

export const getPublicProperty = cache(async (propertyId: string) => {
  return executeBookifyRequest<PublicProperty>(() =>
    createBookifyServerClient().GET("/api/v1/properties/{propertyId}", {
      params: {
        path: {
          propertyId,
        },
      },
    }),
  );
});
