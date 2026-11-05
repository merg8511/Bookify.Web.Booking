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
