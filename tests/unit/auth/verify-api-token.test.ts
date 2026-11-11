import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { exportJWK, generateKeyPair, SignJWT } from "jose";

import { verifyBookifyApiToken } from "@/lib/auth/verify-api-token";

/*
 * MÓDULO 25.7 — JWT VERIFICATION
 *
 * Firmas reales creadas mediante jose.
 * No se utiliza ninguna credencial real
 * ni se consulta un proveedor externo.
 */

const issuer = "https://identity.example.invalid/realms/bookify";

const audience = "bookify-booking-api";

const jwksUri = `${issuer}/protocol/openid-connect/certs`;

const keyId = "bookify-test-key";

let signingKeys: Awaited<ReturnType<typeof generateKeyPair>>;

let publicJwk: Awaited<ReturnType<typeof exportJWK>>;

type TokenOptions = {
  tokenIssuer?: string;
  tokenAudience?: string;
  subject?: string;
  roles?: unknown;
  expiresAt?: number;
};

async function signTestToken(options: TokenOptions = {}): Promise<string> {
  const expiresAt = options.expiresAt ?? Math.floor(Date.now() / 1000) + 300;

  return new SignJWT({
    roles: options.roles ?? ["Customer"],
  })
    .setProtectedHeader({
      alg: "RS256",
      kid: keyId,
    })
    .setIssuer(options.tokenIssuer ?? issuer)
    .setAudience(options.tokenAudience ?? audience)
    .setSubject(options.subject ?? "customer-test-001")
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(signingKeys.privateKey);
}

describe("Bookify OIDC API token — M25.5", () => {
  beforeAll(async () => {
    signingKeys = await generateKeyPair("RS256", { extractable: true });

    publicJwk = await exportJWK(signingKeys.publicKey);

    publicJwk.kid = keyId;
    publicJwk.alg = "RS256";
    publicJwk.use = "sig";
  });

  beforeEach(() => {
    vi.stubEnv("BOOKIFY_OIDC_ISSUER", issuer);

    vi.stubEnv("BOOKIFY_API_AUDIENCE", audience);

    /*
     * CAMBIO 25.7:
     * Simulamos exclusivamente los documentos
     * HTTP del proveedor OIDC de pruebas.
     *
     * La validación JWT sí utiliza la firma
     * criptográfica y la clave pública real
     * generadas para este archivo.
     */
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const requestUrl =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;

        if (requestUrl === `${issuer}/.well-known/openid-configuration`) {
          return Response.json({
            issuer,
            jwks_uri: jwksUri,
          });
        }

        if (requestUrl === jwksUri) {
          return Response.json({
            keys: [publicJwk],
          });
        }

        throw new Error("Unexpected OIDC test URL");
      }),
    );
  });

  it("acepta un JWT firmado para Bookify", async () => {
    const accessToken = await signTestToken({
      roles: ["Owner", "Customer"],
    });

    const identity = await verifyBookifyApiToken(accessToken);

    expect(identity.subject).toBe("customer-test-001");

    expect(identity.roles).toEqual(["Owner", "Customer"]);

    expect(identity.expiresAt).toBeGreaterThan(Date.now() / 1000);
  });

  it("rechaza un JWT de otra audiencia", async () => {
    const accessToken = await signTestToken({
      tokenAudience: "other-api",
    });

    await expect(verifyBookifyApiToken(accessToken)).rejects.toThrow();
  });

  it("rechaza un JWT de otro issuer", async () => {
    const accessToken = await signTestToken({
      tokenIssuer: "https://untrusted.example.invalid",
    });

    await expect(verifyBookifyApiToken(accessToken)).rejects.toThrow();
  });

  it("rechaza un JWT expirado", async () => {
    const accessToken = await signTestToken({
      expiresAt: Math.floor(Date.now() / 1000) - 60,
    });

    await expect(verifyBookifyApiToken(accessToken)).rejects.toThrow();
  });

  it("descarta roles desconocidos y diferencias de mayúsculas", async () => {
    const accessToken = await signTestToken({
      roles: ["Owner", "owner", "Support", "Owner"],
    });

    const identity = await verifyBookifyApiToken(accessToken);

    expect(identity.roles).toEqual(["Owner"]);
  });
});
