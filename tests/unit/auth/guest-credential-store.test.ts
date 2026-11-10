import { beforeEach, describe, expect, it, vi } from "vitest";

import { cookies } from "next/headers";

import {
  captureGuestCredential,
  clearGuestCredential,
  readGuestCredential,
} from "@/lib/auth/guest-credential-store";

/*
 * MÓDULO 25.7 — COOKIE STORE
 *
 * El navegador no interviene en estas pruebas.
 * Comprobamos las operaciones servidor.
 */

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const bookingA = "11111111-1111-4111-8111-111111111111";

const bookingB = "22222222-2222-4222-8222-222222222222";

const tokenA = Buffer.alloc(32, 1).toString("base64url");

const tokenB = Buffer.alloc(32, 2).toString("base64url");

type CookieSetOptions = {
  name: string;
  value: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
  path?: string;
};

const storedCookies = new Map<string, string>();

const setCookie = vi.fn((options: CookieSetOptions) => {
  if (options.maxAge === 0) {
    storedCookies.delete(options.name);
    return;
  }

  storedCookies.set(options.name, options.value);
});

const getCookie = vi.fn((name: string) => {
  const value = storedCookies.get(name);

  return value === undefined ? undefined : { name, value };
});

function creationResponse(token?: string): Response {
  return new Response(null, {
    status: 201,
    headers: token ? { "Booking-Guest-Token": token } : {},
  });
}

describe("Guest credential cookie store — M25.6", () => {
  beforeEach(() => {
    storedCookies.clear();
    setCookie.mockClear();
    getCookie.mockClear();

    vi.stubEnv(
      "BOOKIFY_GUEST_COOKIE_KEY",
      Buffer.alloc(32, 7).toString("base64"),
    );

    vi.mocked(cookies).mockResolvedValue({
      set: setCookie,
      get: getCookie,
    } as unknown as Awaited<ReturnType<typeof cookies>>);
  });

  it("captura la credencial desde HTTP 201", async () => {
    const result = await captureGuestCredential(
      creationResponse(tokenA),
      bookingA,
    );

    expect(result).toBe("set-cookie-issued");
    expect(setCookie).toHaveBeenCalledOnce();

    const cookie = setCookie.mock.calls[0][0];

    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("lax");
    expect(cookie.path).toBe("/");
    expect(cookie.value).not.toContain(tokenA);
  });

  it("recupera la credencial de su reserva", async () => {
    await captureGuestCredential(creationResponse(tokenA), bookingA);

    expect(await readGuestCredential(bookingA)).toBe(tokenA);
  });

  it("aísla dos reservas Guest diferentes", async () => {
    await captureGuestCredential(creationResponse(tokenA), bookingA);

    await captureGuestCredential(creationResponse(tokenB), bookingB);

    expect(await readGuestCredential(bookingA)).toBe(tokenA);

    expect(await readGuestCredential(bookingB)).toBe(tokenB);
  });

  it("no inventa una credencial si falta el header", async () => {
    const result = await captureGuestCredential(creationResponse(), bookingA);

    expect(result).toBe("not-issued");
    expect(setCookie).not.toHaveBeenCalled();
  });

  it("rechaza capturar una respuesta diferente de 201", async () => {
    await expect(
      captureGuestCredential(new Response(null, { status: 200 }), bookingA),
    ).rejects.toThrow();

    expect(setCookie).not.toHaveBeenCalled();
  });

  it("elimina solamente la credencial solicitada", async () => {
    await captureGuestCredential(creationResponse(tokenA), bookingA);

    await captureGuestCredential(creationResponse(tokenB), bookingB);

    await clearGuestCredential(bookingA);

    expect(await readGuestCredential(bookingA)).toBeNull();

    expect(await readGuestCredential(bookingB)).toBe(tokenB);
  });
});
