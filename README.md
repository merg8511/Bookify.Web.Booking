# Bookify Web

Frontend del sistema de reservas Bookify.

## Stack

- Next.js
- React
- TypeScript
- App Router
- ESLint
- npm

## Backend

Repositorio independiente:

https://github.com/merg8511/Bookify.Services.Booking

El backend utiliza ASP.NET Core .NET 10,
PostgreSQL y Clean Architecture.

Los contratos HTTP están versionados
bajo `/api/v1`.

## Requisitos

- Node.js compatible con Next.js
- npm
- Git

Para integración futura:

- Backend Bookify en ejecución
- Entorno Development configurado

## Configuración

Crear el archivo local:

```powershell
Copy-Item .env.example .env.local
```

Configurar:

```dotenv
BOOKIFY_API_BASE_URL=https://localhost:7071
```

Esta variable debe contener únicamente
una origin HTTP o HTTPS válida.

Nunca versionar `.env.local` ni secretos.

## Desarrollo

```powershell
npm install
npm run dev
```

Abrir:

http://localhost:3000

## Verificación

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

## Alcance del Módulo 25.1

- Proyecto Next.js
- TypeScript
- App Router
- Validación de entorno
- Base técnica inicial

No incluye todavía:

- Cliente API
- Autenticación OIDC
- Credenciales Guest
- Pantallas de reserva
- Dashboard administrativo
- Stripe frontend

Estas funcionalidades pertenecen
a submódulos posteriores del roadmap.

## Diseño

La identidad visual definitiva se definirá
en el Módulo 25.2, respetando las directrices
de diseño frontend de Bookify.
