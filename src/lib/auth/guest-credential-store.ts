import "server-only";
import { cookies } from "next/headers";
import {
  decryptGuestCredential,
  encryptGuestCredential,
  GUEST_COOKIE_TTL_SECONDS,
  normalizeGuestBookingId,
} from "./guest-credential-crypto";

const GUEST_HEADER_NAME = "Booking-Guest-Token";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function getCookieName(bookingId: string): string {
  const normalizedId = normalizeGuestBookingId(bookingId);

  const prefix = isProduction() ? "__Host-bookify-guest-" : "bookify-guest-";

  return `${prefix}${normalizedId}`;
}

export type GuestCredentialCaptureResult = "set-cookie-issued" | "not-issued";

export async function captureGuestCredential(
  response: Response,
  bookingId: string,
): Promise<GuestCredentialCaptureResult> {
  if (response.status !== 201) {
    throw new Error("Guest credential capture requires HTTP 201.");
  }

  const normalizedId = normalizeGuestBookingId(bookingId);
  const guestToken = response.headers.get(GUEST_HEADER_NAME);

  if (guestToken === null) {
    return "not-issued";
  }

  const encrypted = await encryptGuestCredential(normalizedId, guestToken);
  const cookieStore = await cookies();

  cookieStore.set({
    name: getCookieName(normalizedId),
    value: encrypted,
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_COOKIE_TTL_SECONDS,
  });

  return "set-cookie-issued";
}

export async function readGuestCredential(
  bookingId: string,
): Promise<string | null> {
  const normalizedId = normalizeGuestBookingId(bookingId);
  const cookieStore = await cookies();
  const encrypted = cookieStore.get(getCookieName(normalizedId))?.value;

  if (!encrypted) {
    return null;
  }

  return decryptGuestCredential(normalizedId, encrypted);
}

export async function clearGuestCredential(bookingId: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: getCookieName(bookingId),
    value: "",
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
