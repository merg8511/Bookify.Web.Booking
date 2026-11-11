import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { isBookifyRole, type BookifyRole } from "./roles";

type IdentitySettings = {
  issuer: string;
  audience: string;
};

export type VerifiedBookifyIdentity = {
  subject: string;
  roles: BookifyRole[];
  expiresAt: number;
};

type RemoteJwks = ReturnType<typeof createRemoteJWKSet>;
let cachedJwks: RemoteJwks | null = null;
let cachedIssuer: string | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAllowedIdentityUrl(url: URL): boolean {
  if (url.username || url.password || url.search || url.hash) {
    return false;
  }

  if (url.protocol === "https:") {
    return true;
  }

  const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

  return (
    process.env.NODE_ENV === "development" &&
    url.protocol === "http:" &&
    isLoopback
  );
}

function getIdentitySettings(): IdentitySettings {
  const issuer = process.env.BOOKIFY_OIDC_ISSUER?.trim();
  const audience = process.env.BOOKIFY_API_AUDIENCE?.trim();

  if (!issuer || !audience) {
    throw new Error("Bookify OIDC issuer and API audience must be configured.");
  }

  const issuerUrl = new URL(issuer);

  if (!isAllowedIdentityUrl(issuerUrl)) {
    throw new Error(
      "Bookify OIDC issuer must use HTTPS, except HTTP loopack in Development.",
    );
  }

  return { issuer, audience };
}

async function getJwks(issuer: string): Promise<RemoteJwks> {
  if (cachedJwks && cachedIssuer === issuer) {
    return cachedJwks;
  }

  const metadataUrl =
    `${issuer.replace(/\/$/, "")}` + "/.well-known/openid-configuration";

  const response = await fetch(metadataUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to obtain OIDC discovery metadata.");
  }

  const metadata: unknown = await response.json();

  if (
    !isRecord(metadata) ||
    metadata.issuer !== issuer ||
    typeof metadata.jwks_uri !== "string"
  ) {
    throw new Error("Invalid OIDC discovery metadata.");
  }

  const jwksUrl = new URL(metadata.jwks_uri);

  if (!isAllowedIdentityUrl(jwksUrl)) {
    throw new Error("OIDC JWKS endpoint must use an allowe secure URL.");
  }

  const jwks = createRemoteJWKSet(jwksUrl);

  cachedIssuer = issuer;
  cachedJwks = jwks;

  return jwks;
}

export async function verifyBookifyApiToken(
  accessToken: string,
): Promise<VerifiedBookifyIdentity> {
  const { issuer, audience } = getIdentitySettings();
  const jwks = await getJwks(issuer);
  const { payload } = await jwtVerify(accessToken, jwks, {
    issuer,
    audience,
    algorithms: ["RS256", "PS256", "ES256"],
    clockTolerance: 30,
  });

  if (
    typeof payload.sub !== "string" ||
    payload.sub.trim().length === 0 ||
    typeof payload.exp !== "number"
  ) {
    throw new Error("Bookify API token requires sub and exp claims.");
  }

  if (payload.exp * 1000 <= Date.now() + 30_000) {
    throw new Error("Bookify API token has expired or is about to expire.");
  }

  const rawRoles: unknown[] = Array.isArray(payload.roles)
    ? payload.roles
    : typeof payload.roles === "string"
      ? [payload.roles]
      : [];

  const roles = Array.from(new Set(rawRoles.filter(isBookifyRole)));

  return {
    subject: payload.sub,
    roles,
    expiresAt: payload.exp,
  };
}
