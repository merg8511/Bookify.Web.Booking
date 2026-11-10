import "server-only";

import { EncryptJWT, jwtDecrypt } from "jose";

/*
 * MÓDULO 25.6 — CRIPTOGRAFÍA GUEST
 *
 * La credencial del backend es un secreto
 * de 32 bytes representado en Base64Url.
 *
 * Aquí NO generamos credenciales válidas
 * para el backend. Solo protegemos las
 * credenciales que la API ya emitió.
 */

// Retención técnica propuesta: 30 días.
// No representa el vencimiento de la reserva.
export const GUEST_COOKIE_TTL_SECONDS = 30 * 24 * 60 * 60;

const COOKIE_ISSUER = "bookify-web";
const COOKIE_AUDIENCE = "bookify-guest";

const BOOKING_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

const GUEST_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/*
 * CAMBIO 25.6:
 * Normalizamos identificadores para que
 * una reserva tenga siempre el mismo nombre
 * de cookie y la misma identidad cifrada.
 *
 * BookingId no es un secreto de acceso.
 */
export function normalizeGuestBookingId(bookingId: string): string {
  if (typeof bookingId !== "string" || !BOOKING_ID_PATTERN.test(bookingId)) {
    throw new Error("A valid Booking ID is required.");
  }

  const normalized = bookingId.toLowerCase();

  if (normalized === EMPTY_GUID) {
    throw new Error("An empty Booking ID is not allowed.");
  }

  return normalized;
}

/*
 * Comprobación basada en el contrato real
 * del backend: 32 bytes en Base64Url
 * sin padding, equivalentes a 43 caracteres.
 */
function isValidGuestToken(value: unknown): value is string {
  return typeof value === "string" && GUEST_TOKEN_PATTERN.test(value);
}

/*
 * CAMBIO 25.6:
 * Una clave independiente de AUTH_SECRET.
 *
 * Exigimos exactamente 32 bytes aleatorios
 * representados en Base64 estándar.
 *
 * La configuración real pertenece únicamente
 * al entorno servidor.
 */
function getGuestEncryptionKey(): Uint8Array {
  const configured = process.env.BOOKIFY_GUEST_COOKIE_KEY;

  if (!configured || !/^[A-Za-z0-9+/]{43}=$/.test(configured)) {
    throw new Error(
      "BOOKIFY_GUEST_COOKIE_KEY must be a Base64-encoded 32-byte secret.",
    );
  }

  const decoded = Buffer.from(configured, "base64");

  if (decoded.length !== 32 || decoded.toString("base64") !== configured) {
    throw new Error("BOOKIFY_GUEST_COOKIE_KEY is invalid.");
  }

  return new Uint8Array(decoded);
}

/*
 * CAMBIO 25.6:
 * Ciframos y autenticamos la credencial
 * usando JWE con AES-256-GCM.
 *
 * El subject del JWE es el BookingId.
 * Esto impide intercambiar accidentalmente
 * cookies de reservas diferentes.
 */
export async function encryptGuestCredential(
  bookingId: string,
  guestToken: string,
): Promise<string> {
  const normalizedId = normalizeGuestBookingId(bookingId);

  if (!isValidGuestToken(guestToken)) {
    throw new Error("Invalid guest credential format.");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + GUEST_COOKIE_TTL_SECONDS;

  return new EncryptJWT({
    guestCredential: guestToken,
  })
    .setProtectedHeader({
      alg: "dir",
      enc: "A256GCM",
    })
    .setIssuer(COOKIE_ISSUER)
    .setAudience(COOKIE_AUDIENCE)
    .setSubject(normalizedId)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .encrypt(getGuestEncryptionKey());
}

/*
 * CAMBIO 25.6:
 * Desencriptar no significa autorizar.
 *
 * Solo recuperamos una credencial local
 * que luego deberá validar el backend.
 *
 * Un valor corrupto, manipulado o vencido
 * se trata como credencial no disponible.
 *
 * Nunca registramos el valor cifrado,
 * la credencial ni la excepción original.
 */
export async function decryptGuestCredential(
  bookingId: string,
  encryptedValue: string,
): Promise<string | null> {
  const normalizedId = normalizeGuestBookingId(bookingId);

  // Un error de configuración es distinto
  // de una cookie inválida y no debe ocultarse.
  const key = getGuestEncryptionKey();

  try {
    const { payload, protectedHeader } = await jwtDecrypt(encryptedValue, key, {
      issuer: COOKIE_ISSUER,
      audience: COOKIE_AUDIENCE,
    });

    if (
      protectedHeader.alg !== "dir" ||
      protectedHeader.enc !== "A256GCM" ||
      payload.sub !== normalizedId ||
      !isValidGuestToken(payload.guestCredential)
    ) {
      return null;
    }

    return payload.guestCredential;
  } catch {
    return null;
  }
}
