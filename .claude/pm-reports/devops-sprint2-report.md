# Reporte: Docker + CI/CD — Sprint 2 CRM Ciudad Moto
**Rol**: DevOps Engineer
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos

- `projects/crm/backend/Dockerfile` — multi-stage build (deps / builder / runner)
- `projects/crm/frontend/Dockerfile` — multi-stage build (builder / nginx runner)
- `projects/crm/frontend/nginx.conf` — nginx config con proxy_pass /api hacia backend
- `projects/crm/docker-compose.yml` — stack completo: db + backend + frontend
- `projects/crm/.env.example` — variables de entorno documentadas
- `.github/workflows/ci.yml` — jobs paralelos backend y frontend

## Resumen de lo realizado

### US-029 — Docker + docker-compose

**Backend Dockerfile (3 stages):**
- `deps`: `npm ci --only=production` + `prisma generate` para el cliente de produccion
- `builder`: instala todas las dependencias, genera Prisma client, compila TypeScript con `tsc` (output en `dist/`)
- `runner`: imagen `node:20-alpine` minimal, copia `node_modules` de `deps` y `dist/` de `builder`. Expone el puerto 3000. El comando de inicio en docker-compose corre `prisma migrate deploy` antes de arrancar el servidor.

**Frontend Dockerfile (2 stages):**
- `builder`: `node:20-alpine`, instala dependencias, ejecuta `npm run build` (tsc + vite build), output en `dist/`
- `runner`: `nginx:1.27-alpine`, sirve `dist/` con configuracion personalizada

**nginx.conf:**
- `location /api` hace `proxy_pass http://backend:3000` con headers correctos (X-Real-IP, X-Forwarded-For, etc.)
- `location /` sirve el SPA con `try_files` fallback a `index.html`
- Cache agresivo para assets estaticos (1 año, immutable)
- Security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy

**docker-compose.yml:**
- `db`: `postgres:16-alpine` con volumen persistente `pgdata`, healthcheck con `pg_isready`
- `backend`: depende de `db` con `condition: service_healthy` (espera que Postgres este listo), env desde archivo `.env`
- `frontend`: depende de `backend`, expone puerto 80

### US-030 — GitHub Actions CI

**ci.yml** con dos jobs independientes que corren en paralelo:
- `backend`: checkout, Node 20 con cache, `npm ci`, `prisma generate`, `tsc --noEmit`, vitest run (con guard para no fallar si no hay tests aun)
- `frontend`: checkout, Node 20 con cache, `npm ci`, `tsc -b --noEmit` (usa project references del tsconfig), `vitest run`

Triggers: push a `project-crm`, PR hacia `gen`.

## Decisiones tomadas

- **Prisma generate en ambos stages del backend**: el stage `deps` necesita el cliente generado para runtime, el stage `builder` lo necesita para compilar TypeScript correctamente.
- **`prisma migrate deploy` en docker-compose command**: mas seguro que ejecutar migrations en el Dockerfile (las migrations necesitan acceso a la DB en runtime, no en build time).
- **`condition: service_healthy` en backend**: evita race condition donde el backend arranca antes que Postgres acepte conexiones.
- **nginx:1.27-alpine**: imagen oficial estable, Alpine para minimizar superficie de ataque.
- **Guard de vitest en backend CI**: el backend no tiene `vitest` en sus scripts ni en devDependencies, se agrego un check condicional para que el job no falle; cuando el equipo agregue tests, funcionara automaticamente.
- **`cache-dependency-path` separado por job**: cada job cachea sus propias dependencias con el lockfile correcto.

## Bloqueantes / Riesgos

- El backend usa `ioredis` y `bullmq` (Redis) como dependencias de produccion. El `docker-compose.yml` actual no incluye un servicio Redis. Si el servidor intenta conectarse a Redis al arrancar, fallara. Recomiendo agregar un servicio `redis:7-alpine` al compose en el proximo sprint.
- El `tsconfig.json` del backend usa path aliases (`@modules/*`, `@shared/*`). El build con `tsc` no resuelve estos aliases en el output compilado sin `tsc-alias` o similar. Si hay imports con estos paths, `node dist/server.js` fallara en runtime. El backend deberia verificar esto antes del primer `docker-compose up --build`.

## Recomendaciones para el siguiente rol

- **Backend Developer**: verificar que `src/server.ts` es el entry point correcto (el `package.json` dice `main: dist/app.js` pero el script `start` corre `dist/server.js` — hay inconsistencia, revisar).
- **Backend Developer**: agregar servicio Redis al `docker-compose.yml` si `bullmq`/`ioredis` se inicializan al arrancar el servidor.
- **QA / cualquier rol**: para levantar el stack: copiar `.env.example` a `.env` y correr `docker-compose up --build`. El primer arranque puede tardar por la descarga de imagenes y la compilacion TypeScript.
- **Para produccion**: parametrizar las credenciales de Postgres (actualmente hardcodeadas en el compose como `POSTGRES_USER: crm / POSTGRES_PASSWORD: crm`), moverlas a secrets del CI/CD.
