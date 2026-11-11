import type { BookifyApiError } from "./bookify-api-error";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }
  return value;
}

function getDefaultMessage(status: number): {
  title: string;
  detail: string;
} {
  switch (status) {
    case 400:
      return {
        title: "Solicitud inválida",
        detail: "Revisa la información enviada e inténtalo nuevamente.",
      };

    case 401:
      return {
        title: "Autenticación requerida",
        detail: "Necesitas una sesión válida para realizar esta operación.",
      };

    case 403:
      return {
        title: "Acceso denegado",
        detail: "No tienes permiso para realizar esta operación.",
      };

    case 404:
      return {
        title: "Recurso no encontrado",
        detail: "El recurso solicitado no está disponible.",
      };

    case 409:
      return {
        title: "Conflicto",
        detail:
          "La operación entra en conflicto con el estado actual del recurso.",
      };

    case 429:
      return {
        title: "Demasiadas solicitudes",
        detail: "Se alcanzó el límite de solicitudes. Inténtalo más tarde.",
      };

    case 504:
      return {
        title: "Tiempo de espera agotado",
        detail: "La operación superó el tiempo de espera permitido.",
      };

    default:
      if (status >= 500) {
        return {
          title: "Error del servidor",
          detail: "No pudimos completar la operación. Inténtalo más tarde.",
        };
      }

      return {
        title: "No se pudo completar la solicitud",
        detail: "La solicitud no se completó correctamente.",
      };
  }
}

export function parseRetryAfter(
  value: string | null,
  nowMilliseconds: number = Date.now(),
): number | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  // Retry-After expresado en segundos.
  // Solo se permiten enteros decimales no negativos.
  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed);

    return Number.isSafeInteger(seconds) ? seconds : null;
  }

  // Impedir que Date.parse interprete valores
  // numéricos inválidos como fechas.
  if (/^[+-]?\d/.test(trimmed)) {
    return null;
  }

  // Retry-After expresado como fecha.
  const dateMilliseconds = Date.parse(trimmed);

  if (!Number.isFinite(dateMilliseconds)) {
    return null;
  }

  const seconds = Math.max(
    0,
    Math.ceil((dateMilliseconds - nowMilliseconds) / 1000),
  );

  return Number.isSafeInteger(seconds) ? seconds : null;
}

export function normalizeHttpError(
  payload: unknown,
  response: Response,
): BookifyApiError {
  const status = response.status;
  const fallback = getDefaultMessage(status);

  const contentType = response.headers
    .get("content-type")
    ?.split(";")[0]
    .trim()
    .toLowerCase();

  const isProblemDetails =
    contentType === "application/problem+json" &&
    isRecord(payload) &&
    (readString(payload.type) !== null || readString(payload.title) !== null);

  const problem = isProblemDetails ? payload : null;

  const correlationId =
    readString(problem?.correlationId) ??
    readString(response.headers.get("X-Correlation-ID"));

  const retryAfterSeconds = parseRetryAfter(
    response.headers.get("Retry-After"),
  );

  const exposeBusinessDetail =
    status >= 400 && status < 500 && status !== 401 && status !== 403;

  const title =
    isProblemDetails && exposeBusinessDetail
      ? (readString(problem?.title) ?? fallback.title)
      : fallback.title;

  const detail =
    isProblemDetails && exposeBusinessDetail
      ? (readString(problem?.detail) ?? fallback.detail)
      : fallback.detail;

  return {
    kind: isProblemDetails ? "problem" : "http",
    status,
    type: readString(problem?.type),
    title,
    detail,
    instance: readString(problem?.instance),
    code: readString(problem?.code),
    traceId: readString(problem?.traceId),
    correlationId,
    retryAfterSeconds,
  };
}

export function normalizeThrownError(error: unknown): BookifyApiError {
  let kind: BookifyApiError["kind"];
  let title: string;
  let detail: string;

  if (error instanceof Error && error.name === "AbortError") {
    kind = "aborted";
    title = "Solicitud cancelada";
    detail = "La solicitud fue cancelada.";
  } else if (
    error instanceof TypeError ||
    (error instanceof Error && error.name === "TimeoutError")
  ) {
    kind = "network";
    title = "Error de conexión";
    detail = "No fue posible comunicarse con el servidor.";
  } else {
    kind = "unexpected";
    title = "Error inesperado";
    detail = "No fue posible procesar la respuesta de la operación.";
  }

  return {
    kind,
    status: null,
    type: null,
    title,
    detail,
    instance: null,
    code: null,
    traceId: null,
    correlationId: null,
    retryAfterSeconds: null,
  };
}
