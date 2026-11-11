import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

import type { BookifyRole } from "@/lib/auth/roles";

export type BookifyAuthError = "invalid_api_token" | "expired_api_token";

declare module "next-auth" {
  interface Session {
    user: {
      subject: string;
      roles: BookifyRole[];
    } & DefaultSession["user"];

    bookifyAuthError?: BookifyAuthError;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    bookifyApiAccessToken?: string;
    bookifyApiExpiresAt?: number;
    bookifySubject?: string;
    bookifyRoles?: BookifyRole[];
    bookifyAuthError?: BookifyAuthError;
  }
}
