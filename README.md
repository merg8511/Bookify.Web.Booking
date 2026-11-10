# Bookify Web Booking

Frontend Next.js para la plataforma Bookify.

## Estado del proyecto

Módulo 25 — Fundamentos de Next.js.

- 25.1 Proyecto: scaffold inicial existente.
- 25.2 Arquitectura: implementación en curso.
- 25.3–25.7: pendientes.

Este repositorio no implementa todavía el
flujo completo de reservas.

## Stack

- Next.js 16.4.5
- React 19.3.0
- TypeScript
- App Router
- CSS Modules
- CSS Custom Properties
- pnpm 10.28.1

## Repositorios

Frontend:

https://github.com/merg8511/Bookify.Web.Booking

Backend:

https://github.com/merg8511/Bookify.Services.Booking

El backend es una API .NET 10 con PostgreSQL,
Clean Architecture y endpoints `/api/v1`.

## Requisitos

- Node.js compatible con la versión de Next.js
- pnpm 10.28.1
- Git

La versión de pnpm está indicada en el campo
`packageManager` de `package.json`.

## Instalación

```powershell
pnpm install --frozen-lockfile
```

Crear el archivo de configuración local:

```powershell
Copy-Item .env.example .env.local
```

Contenido de ejemplo:

```dotenv
BOOKIFY_API_BASE_URL=https://localhost:7071
```

La URL corresponde al perfil HTTPS local
del backend Bookify.

No versionar `.env.local`, credenciales ni tokens.

## Desarrollo

```powershell
pnpm dev
```

Abrir:

http://localhost:3000

## Verificación

```powershell
pnpm lint
pnpm typecheck
pnpm build
```

Para ejecutar el build:

```powershell
pnpm start
```

## Arquitectura

La documentación arquitectónica se encuentra en:

`docs/architecture/frontend-architecture.md`

### Organización

`src/app`

App Router, layouts y páginas.

`src/components/ui`

Componentes visuales compartidos.

`src/styles`

Tokens y fundamentos globales.

`src/features`

Funcionalidades de negocio cuando sus módulos
correspondientes sean implementados.

`src/lib/api`

Cliente OpenAPI tipado a partir de 25.3.

Los directorios futuros se crearán al contener
código real, sin scaffolding vacío.

## Design System

La base visual utiliza CSS Modules y tokens
semánticos.

Los colores y la tipografía actuales son
provisionales. No representan una identidad
de marca aprobada.

La experiencia final debe ser profesional,
minimalista, coherente, accesible y responsive.

## Backend y seguridad

El backend proporciona las operaciones,
contratos y reglas autoritativas.

La UI no debe inventar:

- Disponibilidad
- Precios
- Estados de reservas
- Estados de pagos
- Permisos

OIDC y Guest booking credentials se integrarán
en sus submódulos respectivos.

Los tokens y secretos nunca deben exponerse
en logs, URLs ni assets públicos.

## Pruebas

La cobertura consolidada del Módulo 25
corresponde a 25.7 — Testing frontend.

Los pasos de verificación técnica de 25.2
se ejecutan localmente antes de su cierre.

## Cliente API tipado

El cliente HTTP utiliza `openapi-fetch` y tipos
generados mediante `openapi-typescript`.

El contrato OpenAPI del backend se conserva en:

`contracts/booking-v1.openapi.json`

Generación y verificación:

```powershell
pnpm api:validate
pnpm api:generate
pnpm api:check
```

## Modelo unificado de errores

Bookify utiliza un modelo compartido para interpretar
respuestas Problem Details, errores HTTP y fallos
de conexión.

Archivos principales:

- `src/lib/api/errors/bookify-api-error.ts`
- `src/lib/api/errors/normalize-api-error.ts`
- `src/lib/api/errors/execute-api-request.ts`

Componente visual:

`src/components/ui/api-error-notice.tsx`

Documentación:

`docs/architecture/api-errors.md`

Los errores se normalizan antes de presentarse.
El modelo conserva los códigos semánticos y
respeta la información de Retry-After cuando existe.

No se ejecutan reintentos automáticos.

## Autenticación OIDC

El frontend utiliza Auth.js para iniciar sesión
mediante un proveedor OpenID Connect externo.

La API Bookify sigue siendo responsable de
validar los JWT y autorizar el acceso a los
recursos.

### Configuración local

Crear o actualizar `.env.local` a partir de
`.env.example`.

Configurar:

- `BOOKIFY_OIDC_ISSUER`
- `BOOKIFY_API_AUDIENCE`
- `AUTH_BOOKIFY_ID`
- `AUTH_BOOKIFY_SECRET`
- `AUTH_SECRET`

La audiencia debe coincidir con la configurada
en el backend Bookify.

Registrar en el proveedor OIDC el callback:

`http://localhost:3000/api/auth/callback/bookify-oidc`

El proveedor debe emitir access tokens con
`sub`, audiencia correcta y roles Bookify
en el claim `roles`.

### Rutas

- `/login` — Inicio de sesión OIDC
- `/account` — Sesión autenticada
- `/admin` — Acceso Admin o Owner
- `/access-denied` — Acceso restringido

### Seguridad

La sesión se almacena mediante Auth.js en
una cookie cifrada y HttpOnly.

Los access tokens no se exponen en el JSON
público de sesión.

La autorización por recurso permanece en el
backend.

No existen reintentos automáticos ni renovación
silenciosa de access tokens.

Al vencer el access token debe iniciarse
una nueva autenticación.

### Documentación

`docs/architecture/authentication.md`

## Acceso a reservas anónimas

Bookify permite acceder a una reserva Guest
mediante una credencial emitida por el backend.

El token se recibe exclusivamente en el header
`Booking-Guest-Token` de la creación inicial.

La infraestructura frontend utiliza:

- `src/lib/auth/guest-credential-crypto.ts`
- `src/lib/auth/guest-credential-store.ts`
- `src/lib/auth/guest-api-access.ts`

Las credenciales se conservan cifradas en
cookies HttpOnly y no forman parte de la
sesión OIDC.

### Configuración

Agregar a `.env.local`:

`BOOKIFY_GUEST_COOKIE_KEY`

Utilizar una clave aleatoria de 32 bytes
codificados en Base64 estándar.

No reutilizar `AUTH_SECRET`.

### Limitaciones

La credencial Guest no puede recuperarse
desde el backend si se pierde.

Su captura real durante la creación de
reservas pertenece al módulo 26.6.

La gestión del token no constituye una
implementación del flujo público de reservas.

### Documentación

`docs/architecture/guest-booking-credential.md`

## Testing frontend

La suite del Módulo 25 utiliza Vitest,
React Testing Library y Playwright.

### Tests unitarios y de componentes

```powershell
pnpm test:unit
```

Modo interactivo:

```powershell
pnpm test:watch
```

Cobertura:

```powershell
pnpm test:coverage
```

El reporte HTML se genera en:

`coverage/index.html`

### Tests E2E

Compilar primero:

```powershell
pnpm build
```

Ejecutar Chromium:

```powershell
pnpm test:e2e
```

Interfaz de Playwright:

```powershell
pnpm test:e2e:ui
```

### Regresión completa

```powershell
pnpm test:all
```

### CI

Workflow:

`.github/workflows/frontend-ci.yml`

La configuración de CI usa credenciales sintéticas
y verifica rutas anónimas.

No reemplaza la autenticación real contra
el proveedor OIDC ni las pruebas E2E de
los módulos funcionales posteriores.

### Documentación

`docs/testing/module-25-final-verification.md`
