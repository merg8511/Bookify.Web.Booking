import { describe, expect, it } from "vitest";
import {
  normalizeHttpError,
  normalizeThrownError,
  parseRetryAfter,
} from "@/lib/api/errors/normalize-api-error";

function problemResponse(
  status: number,
  headers: Record<string, string> = {},
): Response {
  return new Response(null, {
    status,
    headers: {
      "Content-Type": "application/problem+json",
      ...headers,
    },
  });
}

describe("Problem Details - M25.4", () => {
  it("preserva el código semántico de validación", () => {
    const error = normalizeHttpError(
      {
        type: "urn:bookify:problem-type:validation",
        title: "Validation error",
        status: 400,
        detail: "Page number must be greater than zero.",
        code: "Pagination.InvalidPageNumber",
        traceId: "trace-example",
      },
      problemResponse(400),
    );
    expect(error.kind).toBe("problem");
    expect(error.status).toBe(400);
    expect(error.code).toBe("Pagination.InvalidPageNumber");
    expect(error.traceId).toBe("trace-example");
    expect(error.detail).toContain("Page number");
  });

  it("considera autoritativo el status HTTP", () => {
    const error = normalizeHttpError(
      {
        title: "Conflict",
        status: 200,
        detail: "Conflict",
        code: "Booking.Conflict",
      },
      problemResponse(409),
    );

    expect(error.status).toBe(409);
    expect(error.kind).toBe("problem");
  });

  it("no muestra detalles internos de un 500", () => {
    const error = normalizeHttpError(
      {
        title: "Internal error",
        detail: "Sensitive internal server information",
        code: "Server.Unexpected",
      },
      problemResponse(500),
    );

    expect(error.status).toBe(500);
    expect(error.detail).not.toContain("Sensitive");
    expect(error.title).toBe("Error del servidor");
  });

  it.each([401, 403])("oculta detalles arbitrarios en HTTP %i", (status) => {
    const error = normalizeHttpError(
      {
        title: "Access error",
        detail: "Private authorization information",
      },
      problemResponse(status),
    );

    expect(error.detail).not.toContain("Private");
  });

  it("utiliza un fallback si la respuesta no es Problem Details", () => {
    const response = new Response("<html>error</html>", {
      status: 502,
      headers: {
        "Content-Type": "text/html",
      },
    });

    const error = normalizeHttpError("<html>error</html>", response);

    expect(error.kind).toBe("http");
    expect(error.status).toBe(502);
    expect(error.detail).not.toContain("<html>");
  });

  it("conserva correlationId del header", () => {
    const error = normalizeHttpError(
      {
        title: "Conflict",
        code: "Booking.Conflict",
      },
      problemResponse(409, {
        "X-Correlation-ID": "request-123",
      }),
    );

    expect(error.correlationId).toBe("request-123");
  });

  it("interpreta Retry-After expresado en segundos", () => {
    expect(parseRetryAfter("45")).toBe(45);
    expect(parseRetryAfter("0")).toBe(0);
  });

  it("interpreta Retry-After expresado como fecha", () => {
    const now = Date.parse("2026-11-10T12:00:00Z");

    expect(parseRetryAfter("Tue, 10 Nov 2026 12:01:00 GMT", now)).toBe(60);
  });

  it("rechaza un Retry-After inválido", () => {
    expect(parseRetryAfter("not-a-date")).toBeNull();
    expect(parseRetryAfter("-3")).toBeNull();
    expect(parseRetryAfter(null)).toBeNull();
  });

  it("distingue un fallo de conexión", () => {
    const error = normalizeThrownError(
      new TypeError("Connection failed: private host"),
    );

    expect(error.kind).toBe("network");
    expect(error.status).toBeNull();
    expect(error.detail).not.toContain("private host");
  });

  it("distingue una solicitud cancelada", () => {
    const aborted = new Error("The operation was aborted");
    aborted.name = "AbortError";

    const error = normalizeThrownError(aborted);

    expect(error.kind).toBe("aborted");
    expect(error.status).toBeNull();
  });

  it("no expone el mensaje de una excepción inesperada", () => {
    const error = normalizeThrownError(
      new Error("Internal secret information"),
    );

    expect(error.kind).toBe("unexpected");
    expect(error.detail).not.toContain("secret");
  });
});
