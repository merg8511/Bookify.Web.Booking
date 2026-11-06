import NextAuth from "next-auth";
import { verifyBookifyApiToken } from "./lib/auth/verify-api-token";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "bookify-oidc",
      name: "Bookify Identity",
      type: "oidc",

      issuer: process.env.BOOKIFY_OIDC_ISSUER,
      clientId: process.env.AUTH_BOOKIFY_ID,
      clientSecret: process.env.AUTH_BOOKIFY_SECRET,

      authorization: {
        params: {
          scope: "openid profile email",
        },
      },

      checks: ["pkce", "state", "nonce"],
    },
  ],

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        try {
          if (!account.access_token) {
            throw new Error("OIDC provider did not supply an access token.");
          }

          const identity = await verifyBookifyApiToken(account.access_token);

          if (token.sub && token.sub !== identity.subject) {
            throw new Error("OIDC subject does not match Bookify API subject.");
          }

          return {
            ...token,
            bookifyApiAccessToken: account.access_token,
            bookifyApiExpiresAt: identity.expiresAt,
            bookifySubject: identity.subject,
            bookifyRoles: identity.roles,
            bookifyAuthError: undefined,
          };
        } catch {
          return {
            ...token,
            bookifyApiAccessToken: undefined,
            bookifyApiExpiresAt: undefined,
            bookifySubject: undefined,
            bookifyRoles: [],
            bookifyAuthError: "invalid_api_token" as const,
          };
        }
      }

      if (!token.bookifyApiAccessToken || !token.bookifyApiExpiresAt) {
        return {
          ...token,
          bookifyRoles: [],
          bookifyAuthError:
            token.bookifyAuthError ?? ("invalid_api_token" as const),
        };
      }

      if (Date.now() + 30_000 >= token.bookifyApiExpiresAt * 1000) {
        return {
          ...token,
          bookifyApiAccessToken: undefined,
          bookifyRoles: [],
          bookifyAuthError: "expired_api_token" as const,
        };
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        subject: token.bookifySubject ?? "",
        roles: token.bookifyRoles ?? [],
      };

      session.bookifyAuthError = token.bookifyAuthError;
      return session;
    },
  },
});
