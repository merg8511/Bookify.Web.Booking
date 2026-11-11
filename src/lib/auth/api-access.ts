import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getToken } from "next-auth/jwt";
import { createBookifyServerClient } from "@/lib/api/server-client";
import { verifyBookifyApiToken } from "./verify-api-token";
import { requireSession } from "./session";

async function getBookifyBearerHeaders() {
  const session = await requireSession();
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  const requestHeaders = await headers();
  const token = await getToken({
    req: {
      headers: requestHeaders,
    },
    secret,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (typeof token?.bookifyApiAccessToken !== "string") {
    redirect("/login");
  }

  try {
    const identity = await verifyBookifyApiToken(token.bookifyApiAccessToken);

    if (identity.subject !== session.user.subject) {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  return {
    Authorization: `Bearer ${token.bookifyApiAccessToken}`,
  };
}

export async function getAuthenticatedBookifyClient() {
  const headers = await getBookifyBearerHeaders();

  return {
    client: createBookifyServerClient(),
    headers,
  };
}
