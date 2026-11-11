import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * CAMBIO 25.7:
 * Mockeamos únicamente las dependencias
 * externas a la función bajo prueba.
 */
const mocks = vi.hoisted(() => ({
  readGuestCredential: vi.fn(),
  createBookifyServerClient: vi.fn(),
}));

vi.mock("@/lib/auth/guest-credential-store", () => ({
  readGuestCredential: mocks.readGuestCredential,
}));

vi.mock("@/lib/api/server-client", () => ({
  createBookifyServerClient: mocks.createBookifyServerClient,
}));

import { getGuestBookingApiAccess } from "@/lib/auth/guest-api-access";

const bookingId = "11111111-1111-4111-8111-111111111111";

describe("Guest API access — M25.6", () => {
  beforeEach(() => {
    mocks.readGuestCredential.mockReset();
    mocks.createBookifyServerClient.mockReset();
  });

  it("devuelve null sin credencial", async () => {
    mocks.readGuestCredential.mockResolvedValue(null);

    const access = await getGuestBookingApiAccess(bookingId);

    expect(access).toBeNull();

    expect(mocks.createBookifyServerClient).not.toHaveBeenCalled();
  });

  it("crea headers por petición sin Bearer", async () => {
    mocks.readGuestCredential.mockResolvedValue("synthetic-test-token");

    const client = { source: "test-client" };

    mocks.createBookifyServerClient.mockReturnValue(client);

    const access = await getGuestBookingApiAccess(bookingId);

    expect(access).not.toBeNull();

    expect(access?.client).toBe(client);

    expect(access?.headers).toEqual({
      "Booking-Guest-Token": "synthetic-test-token",
    });

    expect(access?.headers).not.toHaveProperty("Authorization");

    expect(mocks.readGuestCredential).toHaveBeenCalledWith(bookingId);
  });
});
