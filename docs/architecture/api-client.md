# Bookify — Typed API Client

## Module

25.3 — API client

## Source of truth

Backend repository:

merg8511/Bookify.Services.Booking

Initial backend baseline:

670d5b5773a42864d3dd37cc7b506dc6768e5cee

The backend owns the HTTP contracts.

The frontend must not maintain manually duplicated
versions of the backend request and response DTOs.

## OpenAPI

The backend exposes OpenAPI 3.1 in:

- Development
- Testing

Endpoint:

`/openapi/v1.json`

This endpoint is not available in Production.

The Module 24 baseline defines 33 API operations.

## Contract snapshot

Versioned contract:

`contracts/booking-v1.openapi.json`

This file must come from a real Bookify backend.

It must not contain credentials, guest tokens,
Stripe secrets or runtime user information.

## Dependencies

- openapi-typescript 7.13.0
- openapi-fetch 0.17.0
- server-only 0.0.1

## Updating the contract

Start the backend in Development.

From the frontend repository root:

1. Export `/openapi/v1.json`.
2. Replace `contracts/booking-v1.openapi.json`.
3. Run `pnpm api:validate`.
4. Run `pnpm api:generate`.
5. Run `pnpm api:check`.
6. Run lint, typecheck and build.
7. Review the contract diff.

If the backend changes its endpoints legitimately,
review the validation baseline instead of bypassing
the contract checks.

## Generated types

Output:

`src/lib/api/generated/booking-v1.d.ts`

Generated files must not be edited manually.

Both the snapshot and generated types are versioned.

Production builds do not require a live backend
OpenAPI endpoint.

## HTTP client

Implementation:

`src/lib/api/server-client.ts`

The first client is restricted to server-side code.

It uses the complete paths from OpenAPI, including
the `/api/v1` prefix.

Do not append `/api/v1` to the configured origin.

## Environment

Variable:

`BOOKIFY_API_BASE_URL`

Development example:

`https://localhost:7071`

The variable contains an origin, not an API path.

## HTTP behavior

- Native fetch through openapi-fetch
- Typed paths, parameters and responses
- No automatic retries
- No global authentication headers
- Conservative no-store caching
- Fresh client instance per invocation

An unsuccessful HTTP status is distinct from
a network failure.

Unified error handling belongs to Module 25.4.

## Security

Do not log or expose:

- Bearer tokens
- Booking-Guest-Token
- Stripe client_secret
- Provider secrets

Authentication is implemented in Module 25.5.

Guest access is implemented in Module 25.6.

The server remains authoritative for authorization,
ownership, payment state and booking invariants.

## Verification

Commands:

- pnpm api:validate
- pnpm api:generate
- pnpm api:check
- pnpm lint
- pnpm typecheck
- pnpm build

The typed client requires a live API only when
an actual HTTP operation is executed.

## Future work

25.4 — Problem Details

25.5 — Authentication

25.6 — Guest booking credential

25.7 — Testing frontend

26 — Public booking experience

27 — Administrative experience

28 — Stripe frontend
