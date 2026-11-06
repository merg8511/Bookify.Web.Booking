# Bookify — Frontend Error Handling

## Module

25.4 — Problem Details

## Architecture

The frontend uses a shared error model:

`src/lib/api/errors/bookify-api-error.ts`

HTTP error normalization:

`src/lib/api/errors/normalize-api-error.ts`

Typed request adapter:

`src/lib/api/errors/execute-api-request.ts`

Reusable presentation:

`src/components/ui/api-error-notice.tsx`

## Source of truth

The Booking API owns its error contracts.

The frontend follows RFC 9457 Problem Details.

Backend error responses may contain:

- type
- title
- status
- detail
- instance
- code
- traceId
- correlationId

Not every extension is required on every response.

The HTTP response status is authoritative.

## Error categories

### problem

HTTP failure with a recognized
application/problem+json response.

### http

HTTP failure without recognized Problem Details.

### network

Transport failure without an HTTP response.

### aborted

Cancelled request.

### unexpected

Unexpected failure while processing a request.

## Standard behavior

HTTP 400:
validation or invalid input.

HTTP 401:
authentication required.

HTTP 403:
access denied.

HTTP 404:
resource unavailable.

HTTP 409:
resource state conflict.

HTTP 429:
rate limit exceeded.

HTTP 500:
unexpected server failure.

HTTP 504:
request or upstream timeout.

## Error information

The normalized error contains:

- kind
- status
- type
- title
- detail
- instance
- code
- traceId
- correlationId
- retryAfterSeconds

It does not retain the original thrown exception,
request body, authentication headers or tokens.

## Privacy

Never expose technical exception messages
directly to end users.

Do not display arbitrary details from 5xx errors.

Use generic descriptions for 401 and 403.

Do not log or expose:

- Bearer tokens
- Booking-Guest-Token
- Stripe client_secret
- Provider secrets
- Request bodies with sensitive information

## Retry-After

The backend may include Retry-After for HTTP 429.

The value may contain:

- Seconds
- An HTTP date

The frontend converts it into seconds.

This is informational only.

Module 25.4 does not implement automatic retries.

Payment and booking idempotency must remain intact.

## Typed request adapter

Use executeBookifyRequest around
openapi-fetch operations when a normalized
application result is needed.

HTTP success produces:

- ok: true
- status
- data
- response

HTTP or transport failure produces:

- ok: false
- error

Successful Response objects remain available
on the server for future handling of required
HTTP response headers.

Do not serialize Response or raw credentials
to browser components.

## UI

Use ApiErrorNotice to present a normalized error.

The component uses the Design System tokens
introduced in Module 25.2.

No additional UI library or brand palette is
introduced by this module.

The calling screen determines whether an
error should be displayed.

## Testing

A minimal local verification belongs to 25.4.

Consolidated unit, component and integration
coverage belongs to:

25.7 — Testing frontend

Required future scenarios include:

- Valid Problem Details
- Malformed or absent Problem Details
- HTTP 400, 401, 403, 404, 409, 429, 500, 504
- Retry-After seconds and HTTP dates
- Network failures
- Request cancellation
- Unexpected parsing failures
- No sensitive data in user-visible errors
- Correct success results
- No automatic retries

## Future modules

25.5 — Authentication

25.6 — Guest booking credential

25.7 — Testing frontend

26 — Public booking experience

27 — Administrative experience

28 — Stripe frontend
