import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  decryptGuestCredential,
  encryptGuestCredential,
  normalizeGuestBookingId,
} from "@/lib/auth/guest-credential-crypto";

/*
 * MÓDULO 25.7 — SEGURIDAD GUEST
 *
 * Todas las credenciales son sintéticas.
 * No se consulta el backend y no se utilizan
 * reservas reales.
 */

const bookingA = "11111111-1111-4111-8111-111111111111";

const bookingB = "22222222-2222-4222-8222-222222222222";

// Simula el formato de 32 bytes Base64Url
// del backend, pero NO es un token real.
const syntheticGuestToken = Buffer.alloc(32, 9).toString("base64url");

const testEncryptionKey = Buffer.alloc(32, 7).toString("base64");

describe("Guest credential cryptography — M25.6", () => {
  beforeEach(() => {
    vi.stubEnv("BOOKIFY_GUEST_COOKIE_KEY", testEncryptionKey);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cifra y recupera una credencial válida", async () => {
    const encrypted = await encryptGuestCredential(
      bookingA,
      syntheticGuestToken,
    );

    expect(encrypted).not.toBe(syntheticGuestToken);
    expect(encrypted).not.toContain(syntheticGuestToken);

    const decrypted = await decryptGuestCredential(bookingA, encrypted);

    expect(decrypted).toBe(syntheticGuestToken);
  });

  it("vincula la credencial al Booking ID correcto", async () => {
    const encrypted = await encryptGuestCredential(
      bookingA,
      syntheticGuestToken,
    );

    const wrongBooking = await decryptGuestCredential(bookingB, encrypted);

    expect(wrongBooking).toBeNull();
  });

  it("rechaza una credencial cifrada manipulada", async () => {
    const encrypted = await encryptGuestCredential(
      bookingA,
      syntheticGuestToken,
    );

    const segments = encrypted.split(".");

    // Alteramos el ciphertext del JWE compacto
    // sin generar una nueva firma o autenticación.
    const ciphertext = segments[3];

    const position = Math.floor(ciphertext.length / 2);

    segments[3] =
      ciphertext.slice(0, position) +
      (ciphertext[position] === "A" ? "B" : "A") +
      ciphertext.slice(position + 1);

    const tampered = segments.join(".");

    expect(await decryptGuestCredential(bookingA, tampered)).toBeNull();
  });

  it("rechaza una credencial con formato inválido", async () => {
    await expect(
      encryptGuestCredential(bookingA, "invalid-token"),
    ).rejects.toThrow("Invalid guest credential format");
  });

  it("rechaza un Booking ID vacío", () => {
    expect(() =>
      normalizeGuestBookingId("00000000-0000-0000-0000-000000000000"),
    ).toThrow();
  });

  it("normaliza mayúsculas del Booking ID", () => {
    expect(normalizeGuestBookingId(bookingA.toUpperCase())).toBe(bookingA);
  });

  it("no permite descifrar con una clave diferente", async () => {
    const encrypted = await encryptGuestCredential(
      bookingA,
      syntheticGuestToken,
    );

    vi.stubEnv(
      "BOOKIFY_GUEST_COOKIE_KEY",
      Buffer.alloc(32, 8).toString("base64"),
    );

    expect(await decryptGuestCredential(bookingA, encrypted)).toBeNull();
  });

  it("rechaza una credencial expirada", async () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    const encrypted = await encryptGuestCredential(
      bookingA,
      syntheticGuestToken,
    );

    // Avanzamos más allá de los 30 días
    // definidos en la política inicial 25.6.
    vi.setSystemTime(new Date("2026-02-02T00:00:00Z"));

    expect(await decryptGuestCredential(bookingA, encrypted)).toBeNull();
  });
});
