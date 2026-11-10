import { describe, expect, it, vi } from "vitest";

import { executeBookifyRequest } from "@/lib/api/errors/execute-api-request";

describe("Bookify API request adapter — M25.3/25.4", () => {
  it("conserva los datos y la respuesta de un 200", async () => {
    const response = new Response(null, {
      status: 200,
    });

    const request = vi.fn().mockResolvedValue({
      data: {
        items: [],
      },
      response,
    });

    const result = await executeBookifyRequest(request);

    expect(request).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.status).toBe(200);
      expect(result.data).toEqual({ items: [] });
      expect(result.response).toBe(response);
    }
  });

  it("admite 204 sin body", async () => {
    const result = await executeBookifyRequest(async () => ({
      response: new Response(null, {
        status: 204,
      }),
    }));

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.status).toBe(204);
      expect(result.data).toBeUndefined();
    }
  });

  it("normaliza un conflicto sin lanzar excepción", async () => {
    const result = await executeBookifyRequest(async () => ({
      error: {
        title: "Conflict",
        detail: "Invalid state transition",
        code: "Booking.Conflict",
      },
      response: new Response(null, {
        status: 409,
        headers: {
          "Content-Type": "application/problem+json",
        },
      }),
    }));

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.status).toBe(409);
      expect(result.error.kind).toBe("problem");
    }
  });

  it("convierte un rechazo de transporte en resultado de error", async () => {
    const result = await executeBookifyRequest(async () => {
      throw new TypeError("Private network information");
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.kind).toBe("network");
      expect(result.error.status).toBeNull();
    }
  });

  it("no reintenta automáticamente una solicitud", async () => {
    const request = vi.fn().mockResolvedValue({
      error: {
        title: "Too many requests",
        code: "RateLimit.Exceeded",
      },
      response: new Response(null, {
        status: 429,
        headers: {
          "Content-Type": "application/problem+json",
          "Retry-After": "60",
        },
      }),
    });

    const result = await executeBookifyRequest(request);

    expect(request).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.retryAfterSeconds).toBe(60);
    }
  });
});
