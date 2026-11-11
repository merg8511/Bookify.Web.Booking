# Bookify — Frontend Architecture

## 1. Context

Repository: `merg8511/Bookify.Web.Booking`

Backend: `merg8511/Bookify.Services.Booking`

Module: 25.2 — Arquitectura

Bookify Web is an independent Next.js application.

It consumes the existing Booking Service contracts.
It does not own backend business invariants.

The backend remains authoritative for:

- Availability and inventory conflicts
- Pricing and booking price snapshots
- Booking lifecycle
- Payment reconciliation
- Authorization and ownership
- Idempotency and persistence

## 2. Technical baseline

- Next.js 16.4.5
- React 19.3.0
- TypeScript
- App Router
- pnpm 10.28.1
- CSS Modules
- CSS Custom Properties

No additional UI framework is required for the
foundation created in Module 25.2.

## 3. Application organization

Current and planned responsibilities:

### src/app

Owns routing, layouts and page composition.

Pages should remain thin. Business rules belong
to feature-specific code or to the backend.

### src/app/(public)

Public experience route group.

Route group names do not affect public URLs.

The temporary root page lives here during
Module 25.2.

### src/components/ui

Generic presentation primitives.

Examples:

- Button and ButtonLink
- ContentContainer
- StatusBadge
- Surface
- TextField

These components must not import business models
such as Booking, Property or Payment.

### src/styles

Shared visual foundations and semantic tokens.

Tokens define roles, not Bookify's final brand.

### src/features — planned

Each feature owns its specific UI and behavior.

When implemented, a feature may contain:

- components
- hooks
- schemas
- feature-specific types

Do not create empty features before their roadmap
module begins.

### src/lib/api — Module 25.3

Reserved for the typed OpenAPI client,
transport configuration and generated contracts.

No manual duplication of the backend DTOs.

### src/hooks — when needed

Shared React hooks only.

A hook used by one feature stays inside that
feature instead.

### src/lib/schemas — when needed

Schemas genuinely shared across features.

Feature-specific schemas belong with the feature.

Never invent backend contract properties merely
to establish this directory.

## 4. Rendering boundaries

Prefer Server Components for static presentation
and server-side composition.

Use Client Components when an actual interaction,
browser API, event handler or client state requires it.

Keep client boundaries small.

Do not pass secrets from Server Components to
Client Components.

## 5. API contract boundaries

Backend operations use `/api/v1`.

The backend OpenAPI 3.1 contract documents
33 operations at the Module 24 baseline.

The raw OpenAPI document is available in
Development and Testing, not Production.

Typed client generation belongs to Module 25.3.

Browser/server communication strategy will be
decided from actual authentication, token and
deployment requirements in Module 25.3.

Do not assume `/openapi/v1.json` will exist
on a Production backend.

## 6. Security

- Never embed backend secrets in Client Components.
- Do not expose tokens in URLs or logs.
- Never log Booking-Guest-Token.
- Do not assume hidden UI controls provide security.
- Use real backend authorization for protected actions.
- Preserve Idempotency-Key where required.
- Treat Booking and Payment states separately.
- Never mark Booking Paid without backend authority.

OIDC integration belongs to Module 25.5.

Guest credential lifecycle belongs to Module 25.6.

## 7. Design System foundations

### Status

The visual identity is not yet approved.

The current CSS values are neutral technical
placeholders, not Bookify brand decisions.

### Semantic colors

Shared tokens define:

- background
- surface
- foreground
- muted foreground
- border
- primary action
- focus
- success
- warning
- destructive

Components consume these roles.

### Typography

Current implementation uses system-ui.

Final font family, weights and hierarchy
require visual review and approval.

### Spacing and layout

Shared spacing scale, container width,
control height and border radii.

Public and administrative layouts may have
different information density but must share
the same foundations.

### Component states

Components must support relevant states:

- default
- hover
- focus-visible
- disabled
- loading
- error
- success
- empty

Only implement states that are meaningful
for the current component.

### Responsive

Review approximately:

- 360–390 px
- 768 px
- 1280–1440 px

No important action should disappear on mobile.

### Motion

Use short, purposeful transitions.

Honor prefers-reduced-motion.

No continuous decorative animations by default.

## 8. Visual references

These are documented UX references, not
inspected screenshots or imported source code.

### Refugio del Sol

Reusable pattern:
clear booking flow, hierarchy and restrained motion.

Do not copy its branding or Blazor components.

### DataTouch CRM

Reusable pattern:
consistent forms, readable states and careful contrast.

Do not introduce CRM or card-editor features.

### Global Code Group

Reusable pattern:
consistent navigation, editorial hierarchy and layout.

Do not copy menus or corporate identity.

### Rent a Car

Reusable pattern:
mobile-friendly operational UX, clear state and
efficient navigation.

Do not introduce vehicle or flight entities.

## 9. Pending visual approvals

The following decisions are not approved:

- Logo and visual identity
- Final HEX palette
- Final typography
- Light/dark theme policy
- Icons
- Photography and illustration language
- Advanced UI component libraries

Before approving these decisions, review
authentic available design references and
the rendered implementation.

Document the chosen alternatives and trade-offs.

## 10. Future module boundaries

25.3 — API client:
typed OpenAPI integration.

25.4 — Problem Details:
unified frontend error handling.

25.5 — Authentication:
OIDC, session, roles and protected routes.

25.6 — Guest booking credential:
secure anonymous booking access.

25.7 — Testing frontend:
unit/component, Playwright and frontend CI.

26 — Public booking experience.

27 — Administrative experience.

28 — Stripe frontend.

29.2 — Next.js runtime container.

29.4 — Full Docker Compose integration.

## 11. Review triggers

Reconsider the CSS Modules approach if actual
component complexity or repetition demonstrates
a maintainability problem.

Evaluate specialized accessible primitives when
dialogs, calendars or advanced overlays are needed.

Do not migrate styling or architecture solely
because another approach is popular.

## 12. Source of truth

1. Current local code and changes
2. Bookify guided-development rules
3. Updated project state and closure records
4. Official Bookify roadmap
5. Approved Bookify design decisions
6. Frontend design directives
7. External inspiration and technical documentation
