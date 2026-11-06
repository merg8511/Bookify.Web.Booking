# Bookify — Frontend Authentication

## Module

25.5 — Authentication

## Repositories

Frontend:
merg8511/Bookify.Web.Booking

Backend:
merg8511/Bookify.Services.Booking

## Identity model

Bookify Booking API consumes JWT access tokens
issued by an external OIDC provider.

The backend owns the final authentication and
resource authorization decisions.

The frontend must not create its own Bookify
API access tokens.

## Technical decision

Authentication library:
next-auth 5.0.0-beta.32

JWT verification:
jose 6.2.15

The chosen Auth.js version is prerelease software.
Review stability and compatibility before
production release.

## OIDC flow

- Authorization Code Flow
- PKCE, state and nonce checks
- External OIDC provider
- Server-side callback handling
- Auth.js encrypted JWT session cookie

Provider identifier:

bookify-oidc

Local callback:

http://localhost:3000/api/auth/callback/bookify-oidc

Production requires an approved HTTPS origin.

## Environment

BOOKIFY_OIDC_ISSUER:
must match backend Identity:Authority.

BOOKIFY_API_AUDIENCE:
must match backend Identity:Audience.

AUTH_BOOKIFY_ID:
the frontend OIDC client identifier.

AUTH_BOOKIFY_SECRET:
the confidential OIDC client secret.

AUTH_SECRET:
secret used by Auth.js for session protection.

BOOKIFY_API_BASE_URL:
existing backend API origin.

All real secrets must remain in .env.local
or an approved production secret store.

## Provider prerequisites

The provider must issue access tokens containing:

- iss
- sub
- aud
- exp
- roles, when assigned

The access token must be valid for the Booking API.

Bookify roles:

- Admin
- Owner
- Customer

Role names are case-sensitive.

No default Customer role is inferred.

Roles may be combined but are not hierarchical.

For Keycloak, configure the required audience
and role claim mapping in the identity provider.

Do not assume nested realm_access or
resource_access claims are consumed by Bookify.

## Session strategy

Auth.js JWT strategy.

Session cookie:
encrypted and HttpOnly.

The access token is retained in the encrypted
server-readable session cookie.

It is not exposed in the public Auth.js Session
object or in browser storage accessible to JS.

The public session may contain:

- subject
- recognized Bookify roles
- a safe authentication error indicator

The public session must not contain:

- API access token
- ID token
- refresh token
- OIDC client secret

Maximum Auth.js session age:
8 hours.

Access is denied as soon as the API access token
is expired or within 30 seconds of expiry.

No silent refresh or refresh token storage.

Reauthentication is required for a new
API access token.

## Authorization

/account:
requires a valid authenticated session.

/admin:
requires Admin or Owner.

/access-denied:
generic authorization feedback.

/login:
starts the OIDC sign-in flow.

Every protected Server Component, Server Action
and Route Handler must perform its own
authorization check.

Client-side navigation and hidden controls
must not be treated as authorization boundaries.

Backend resource ownership validation
remains mandatory.

Owner does not automatically own
all properties.

## API integration

The existing openapi-fetch client remains.

The server-only authentication bridge creates
a per-request Bearer Authorization header
from a validated API access token.

No global headers or shared user tokens.

Do not expose Authorization headers in
client props, logs, URLs or analytics.

Do not serialize authenticated Response objects
with sensitive headers.

## Guest credential

The Booking-Guest-Token credential belongs
to Module 25.6.

It is not an OIDC access token.

Do not store it in the Auth.js session model.

## Logout

Auth.js signOut terminates the application's
local session.

It does not guarantee provider-wide SSO logout.

Provider logout integration requires a separately
verified identity-provider capability.

## Security limitations

The session cookie contains encrypted OAuth
access token material.

Verify cookie size and deployment cookie behavior
with the real identity provider.

The client secret belongs exclusively to the server.

Use HTTPS outside local Development.

A compromised provider or incorrect audience
configuration cannot be corrected by UI roles.

## Testing

Minimal Module 25.5 checks:

- Anonymous /account redirect
- Anonymous /admin redirect
- Customer denied from /admin
- Admin allowed into /admin
- Owner allowed into /admin
- Unknown or missing role denied
- Expired access token rejected
- Invalid issuer or audience rejected
- Logout invalidates the local session
- Public session endpoint does not reveal tokens
- Backend rejects unauthorized API access

The complete automated security suite belongs to:

25.7 — Testing frontend

## Next modules

25.6 — Guest booking credential

25.7 — Testing frontend

26 — Public booking flow

27 — Administrative UI

28 — Stripe frontend

29.4 — Docker Compose, including the planned
local identity-provider demo environment.
