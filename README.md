# Bookify Web Booking

Frontend Next.js de la plataforma Bookify.

## Estado del proyecto

Módulo 25 — Fundamentos de Next.js.

Implementación completada en la branch:

`feature/nextjs-frontend-foundations`

Submódulos implementados:

- 25.1 — Proyecto
- 25.2 — Arquitectura
- 25.3 — API client
- 25.4 — Problem Details
- 25.5 — Authentication
- 25.6 — Guest booking credential
- 25.7 — Testing frontend

Regresión local y CI de la branch verificados.

La integración definitiva en main requiere
revisión y merge del Pull Request.

El frontend aún no implementa los recorridos
funcionales de reservas, administración o pagos.

## Stack

- Next.js 16.4.5
- React 19.3.0
- TypeScript
- App Router
- CSS Modules
- CSS Custom Properties
- pnpm 10.28.1
- openapi-typescript
- openapi-fetch
- Auth.js / NextAuth
- jose
- Vitest
- React Testing Library
- Playwright

## Repositorios

Frontend:

https://github.com/merg8511/Bookify.Web.Booking

Backend:

https://github.com/merg8511/Bookify.Services.Booking

El backend es una API .NET 10 con PostgreSQL,
Clean Architecture y endpoints bajo `/api/v1`.

## Requisitos

- Node.js 24 actualizado, recomendado para CI
- pnpm 10.28.1
- Git

## Instalación

```powershell
pnpm install --frozen-lockfile
```

Crear la configuración local:

```powershell
Copy-Item .env.example .env.local
```

No versionar `.env.local`.

La aplicación necesita un origen HTTP/HTTPS
válido en `BOOKIFY_API_BASE_URL`.

Ejemplo de desarrollo:

```dotenv
BOOKIFY_API_BASE_URL=https://localhost:7071
```

## Desarrollo

```powershell
pnpm dev
```

Abrir:

http://localhost:3000

## Arquitectura

Documentación:

`docs/architecture/frontend-architecture.md`

Organización:

- `src/app`: App Router, layouts y páginas.
- `src/components/ui`: componentes visuales.
- `src/styles`: tokens y estilos.
- `src/lib/api`: cliente y errores HTTP.
- `src/lib/auth`: sesiones y credenciales.
- `src/features`: funcionalidades futuras cuando
  sus módulos correspondientes comiencen.

No crear scaffolding vacío sin un uso concreto.

## Design System

La identidad visual aprobada de Bookify establece:

**Experiencia pública:**
Editorial Hospitality P1,
Olive & Ivory,
EB Garamond + Cabin.

**Experiencia administrativa:**
Concierge Admin A2,
Ice & Navy,
Inter.

**Marca:**
Horizon L2.3 y wordmark `bookify.`.

Las referencias de diseño representan direcciones
visuales aprobadas, no contratos funcionales.

El frontend actual conserva tokens y componentes
fundacionales provisionales.

La integración visual completa de P1 y A2,
sus activos maestros y el QA de navegador
deben realizarse dentro de los módulos
funcionales correspondientes.

No inventar funcionalidades a partir de mockups.

## Backend y seguridad

El backend es autoritativo para:

- Disponibilidad
- Precios
- Reservas
- Pagos
- Roles
- Ownership
- Transiciones de estado

La UI no marca una reserva como Paid por sí misma.

Los tokens y secretos no deben exponerse
en logs, URLs, analytics o assets públicos.

## API tipada

Contrato versionado:

`contracts/booking-v1.openapi.json`

Tipos generados:

`src/lib/api/generated/booking-v1.d.ts`

Cliente HTTP:

`src/lib/api/server-client.ts`

Verificación:

```powershell
pnpm api:validate
pnpm api:check
```

Generación:

```powershell
pnpm api:generate
```

Documentación:

`docs/architecture/api-client.md`

## Problem Details

El modelo unificado maneja:

- Errores HTTP
- Problem Details
- Errores de transporte
- Cancelaciones
- Retry-After

Archivos:

`src/lib/api/errors/`

Componente visual:

`src/components/ui/api-error-notice.tsx`

Documentación:

`docs/architecture/api-errors.md`

No se implementan reintentos automáticos
para operaciones sensibles.

## Autenticación OIDC

El frontend integra Auth.js y consume
access tokens del proveedor OIDC.

Variables principales:

- BOOKIFY_OIDC_ISSUER
- BOOKIFY_API_AUDIENCE
- AUTH_BOOKIFY_ID
- AUTH_BOOKIFY_SECRET
- AUTH_SECRET

Callback local:

`http://localhost:3000/api/auth/callback/bookify-oidc`

Rutas:

- `/login`
- `/account`
- `/admin`
- `/access-denied`

Los roles reconocidos son:

- Admin
- Owner
- Customer

La autorización definitiva pertenece al backend.

La sesión pública no debe incluir access tokens.

Documentación:

`docs/architecture/authentication.md`

## Guest booking credential

El backend emite `Booking-Guest-Token`
en la creación inicial de una reserva anónima.

La infraestructura frontend utiliza cookies
HttpOnly cifradas mediante JWE.

Archivos:

- `src/lib/auth/guest-credential-crypto.ts`
- `src/lib/auth/guest-credential-store.ts`
- `src/lib/auth/guest-api-access.ts`

Variable de entorno:

`BOOKIFY_GUEST_COOKIE_KEY`

No reutilizar `AUTH_SECRET`.

La credencial es independiente de OIDC.

No puede recuperarse del backend si se pierde.

La captura durante la creación funcional
de reservas corresponde a 26.6.

Documentación:

`docs/architecture/guest-booking-credential.md`

## Testing frontend

Tests unitarios y de componentes:

```powershell
pnpm test:unit
```

Cobertura:

```powershell
pnpm test:coverage
```

Tests de navegador:

```powershell
pnpm build
pnpm test:e2e
```

Regresión completa:

```powershell
pnpm test:all
```

Resultados verificados en M25:

- 69 pruebas Vitest aprobadas
- 8 pruebas Playwright aprobadas
- Build de producción aprobado
- OpenAPI 3.1.1 validado
- 33 operaciones documentadas

Los tests E2E iniciales cubren rutas base
y acceso anónimo, no el flujo público completo.

## CI

Workflow:

`.github/workflows/frontend-ci.yml`

Ejecución aprobada:

https://github.com/merg8511/Bookify.Web.Booking/actions/runs/42922778777

El CI utiliza credenciales sintéticas y
no necesita emitir reservas ni pagos reales.

La ejecución definitiva del PR debe aprobarse
también después de los ajustes de cierre.

## Documentación de cierre

`docs/testing/module-25-final-verification.md`

## Próximo módulo

Módulo 26 — Flujo público de reserva.

Primer submódulo:

26.1 — Property

No iniciar M26 antes de verificar la
integración de M25 a main.
