import "server-only";
import { createBookifyServerClient } from "../api/server-client";
import { readGuestCredential } from "./guest-credential-store";

export async function getGuestBookingApiAccess(bookingId: string) {
  const guestToken = await readGuestCredential(bookingId);

  if (guestToken === null) {
    return null;
  }

  return {
    client: createBookifyServerClient(),

    headers: {
      "Booking-Guest-Token": guestToken,
    },
  };
}
