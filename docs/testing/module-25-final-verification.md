# Bookify — Module 25 Final Verification

## Scope

Module 25 — Next.js Foundations

Submodule 25.7 — Testing frontend

Frontend repository:

merg8511/Bookify.Web.Booking

Working branch:

feature/nextjs-frontend-foundations

## Historical baseline

25.1 — Project and environment
25.2 — Architecture and shared UI
25.3 — OpenAPI typed client
25.4 — Problem Details
25.5 — OIDC authentication
25.6 — Guest credential protection
25.7 — Consolidated testing

The Module 25 branch is the source of truth
for frontend implementation status.

Do not replace its state with an older snapshot
of backend main.

## Source verification

At preparation time, the inspected GitHub
commit was:

ca1036b5fccc20d842165fcaf05744acba59dd53

The remote snapshot contained 25.1–25.5.

Module 25.6 was confirmed complete by
the developer but was not present in
that published snapshot.

Before completing this document, reconcile
the 25.6 local files with the test suite.

## Test stack

- Vitest
- React Testing Library
- DOM Testing Library
- jest-dom
- jsdom
- Playwright
- GitHub Actions
- pnpm

## Unit coverage

API:

- Problem Details
- HTTP fallback handling
- Retry-After
- Transport errors
- No automatic retry
- Successful HTTP responses

Authentication:

- Role mapping
- Role casing
- Session guard
- Admin guard
- JWT issuer, audience and expiration

Guest:

- JWE encryption/decryption
- Credential format
- Booking ID binding
- Tampered ciphertext
- Wrong encryption key
- Cookie capture
- Cookie isolation
- Local deletion
- Guest HTTP headers

## Component coverage

- Buttons
- Link security
- Loading and disabled state
- Text field labels
- Error association
- Status badges
- Error notices

## Browser coverage

- Public route
- Login route
- Access denied page
- Anonymous /account protection
- Anonymous /admin protection
- Public session does not expose secrets
- Removed diagnostic routes
- Basic mobile overflow check

## Known boundaries

The baseline CI does not perform real OIDC
login or authenticate with live user accounts.

It does not create real bookings or payments.

Guest booking creation belongs to Module 26.6.

Complete public booking E2E belongs to 26.10.

Administrative E2E belongs to 27.11.

Stripe scenarios belong to Module 28.

The frontend uses the backend as the
authority for ownership and business rules.

## Design System

Approved:

Public P1 — Editorial Hospitality.

Admin A2 — Concierge Admin.

The approved color, typography, navigation,
feedback, responsive and Horizon decisions
must not be silently changed by tests.

A browser test of provisional styles does
not certify implementation of the approved
Design System.

Approved visual implementation must be
tested after integration into the application.

## Verification commands

pnpm install --frozen-lockfile

pnpm api:validate
pnpm api:check

pnpm lint
pnpm typecheck

pnpm test:coverage

pnpm build
pnpm test:e2e

## Execution evidence

Complete only after running the commands:

Node version:
PENDING

pnpm version:
PENDING

Unit/component tests passed:
PENDING

Unit/component tests failed:
PENDING

Coverage summary:
PENDING

Playwright passed:
PENDING

Playwright failed:
PENDING

ESLint:
PENDING

TypeScript:
PENDING

Production build:
PENDING

OpenAPI validation:
PENDING

Frontend CI URL:
PENDING

Frontend CI conclusion:
PENDING

## Security review

- No real tokens in fixtures
- No real OIDC credentials in CI
- No guest credential in browser output
- No hardcoded production secrets
- No diagnostic Route Handlers committed
- No stored authenticated Playwright state
- Correct backend authorization boundaries
- No automatic mutating request retries

## Completion criteria

Do not mark Module 25 complete until:

1. All relevant tests are implemented.
2. The local full verification is green.
3. The latest frontend CI is green.
4. The 25.6 files are reconciled.
5. No module-25 DEFERRED remains unresolved.
6. The entire module has been audited.
7. Atomic commits are reviewed.
8. The Pull Request is ready for review.

## Proposed Pull Request

feat(frontend): establish nextjs foundations and secure booking access

The title covers the whole Module 25,
not only its final testing submodule.

## Next module

26.1 — Property

A fresh audit of the appropriate baseline
is required at the beginning of Module 26.
