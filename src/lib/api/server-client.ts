import "server-only";
import createClient from "openapi-fetch";
import type { paths } from "@/lib/api/generated/booking-v1";

export function createBookifyServerClient() {
  const baseUrl = process.env.BOOKIFY_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("BOOKIFY_API_BASE_URL is not configured.");
  }

  return createClient<paths>({
    baseUrl,
    cache: "no-store",
  });
}
