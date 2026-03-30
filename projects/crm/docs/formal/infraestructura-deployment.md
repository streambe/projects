# Infraestructura y Despliegue — CRM Ciudad Moto

**Proyecto**: CRM Ciudad Moto
**Fecha**: 2026-03-29
**Version**: 1.0

---

## 1. Resumen de Infraestructura

El CRM Ciudad Moto opera sobre una arquitectura cloud moderna compuesta por tres servicios principales:

- **Frontend**: Single Page Application (SPA) construida con React + Vite, desplegada en **Vercel** como sitio estatico con rewrite rules para SPA routing.
- **Backend**: API REST construida con Fastify + TypeScript sobre Node.js 20, desplegada como **Web Service en Render**.
- **Base de datos**: PostgreSQL 16 gestionada por **Render Managed Database** (plan free).
- **Redis**: Previsto para uso futuro con BullMQ (colas de trabajo). Disponible en entorno local via Docker.

La comunicacion entre frontend y backend se realiza via HTTPS. El frontend consume la API a traves de la URL configurada en la variable de entorno `VITE_API_URL`. En entorno local (Docker), nginx actua como reverse proxy para enrutar `/api` al backend.

---

## 2. Arquitectura Cloud

```
                         INTERNET
                            |
                            v
                   +------------------+
                   |   Vercel CDN     |
                   |   (Edge Network) |
                   +--------+---------+
                            |
                            v
                   +------------------+
                   |  Frontend SPA    |
                   |  React + Vite    |
                   |  (Static Build)  |
                   +--------+---------+
                            |
                            | HTTPS (VITE_API_URL)
                            v
                   +------------------+
                   |  Render Web Svc  |
                   |  ciudadmoto-api  |
                   |  Fastify/Node 20 |
                   |  Port 3000       |
                   +--------+---------+
                            |
                            | Internal connection
                            v
                   +------------------+
                   |  Render Postgres |
                   |  ciudadmoto-db   |
                   |  PostgreSQL 16   |
                   |  (Managed, Free) |
                   +------------------+
```

### Flujo de datos

1. El usuario accede a la URL de Vercel (HTTPS).
2. Vercel sirve los assets estaticos desde su CDN global (JS, CSS, HTML).
3. El SPA se carga en el navegador y realiza llamadas API al backend en Render.
4. El backend Fastify procesa las requests, consulta PostgreSQL y devuelve JSON.
5. CORS esta configurado para permitir solo el origen del frontend en Vercel.

---

## 3. Diagrama de Despliegue

```
+==============================================================================+
|                           PRODUCCION / STAGING                                |
+==============================================================================+
|                                                                              |
|  +----------------------------+     +-----------------------------------+    |
|  |        VERCEL              |     |           RENDER                  |    |
|  |                            |     |                                   |    |
|  |  Site: frontend-two-mu-94  |     |  Web Service: ciudadmoto-api     |    |
|  |  Framework: Vite           |     |  Runtime: Node.js 20             |    |
|  |  Build: npm run build      |     |  Port: 3000                      |    |
|  |  Output: dist/             |     |  Root: projects/crm/backend      |    |
|  |  Routing: SPA rewrite      |     |  Build: npm ci + prisma generate |    |
|  |                            |     |         + npm run build           |    |
|  |  URL:                      |     |  Start: prisma db push + seed    |    |
|  |  https://frontend-two-     |     |         + node dist/server.js    |    |
|  |  mu-94.vercel.app          |     |                                   |    |
|  +----------------------------+     |  Database: ciudadmoto-db          |    |
|                                     |  Engine: PostgreSQL 16            |    |
|                                     |  Plan: Free                       |    |
|                                     |  User: crm                        |    |
|                                     |  DB Name: ciudadmoto              |    |
|                                     +-----------------------------------+    |
|                                                                              |
+==============================================================================+

+==============================================================================+
|                         LOCAL (Docker Compose)                                |
+==============================================================================+
|                                                                              |
|  +----------+    +----------+    +----------+    +----------+                |
|  | frontend |    | backend  |    |    db    |    |  redis   |                |
|  | nginx    |    | node:20  |    | pg:16   |    | redis:7  |                |
|  | :80      |--->| :3000    |--->| :5432   |    | :6379    |                |
|  +----------+    +----------+    +----------+    +----------+                |
|                                                                              |
|  nginx proxies /api -> backend:3000                                          |
|  backend depends_on: db (healthy), redis (started)                           |
+==============================================================================+
```

---

## 4. Servicios

### 4.1 Frontend — Vercel

| Atributo | Valor |
|----------|-------|
| **Plataforma** | Vercel |
| **Framework** | Vite + React + TypeScript |
| **Build command** | `npm run build` |
| **Output directory** | `dist/` |
| **Routing** | SPA — todas las rutas reescritas a `/index.html` via `vercel.json` |
| **URL produccion** | `https://frontend-two-mu-94.vercel.app` |

**Configuracion de vercel.json:**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Esto garantiza que cualquier ruta del SPA (por ejemplo `/clientes`, `/actividades`, `/pipeline`) sea manejada por React Router en el cliente, sin devolver 404 del servidor.

### 4.2 Backend — Render Web Service

| Atributo | Valor |
|----------|-------|
| **Plataforma** | Render |
| **Nombre del servicio** | `ciudadmoto-api` |
| **Plan** | Free |
| **Runtime** | Node.js |
| **Root directory** | `projects/crm/backend` |
| **Framework** | Fastify |
| **ORM** | Prisma |
| **Puerto** | 3000 |

**Build command:**
```bash
npm ci --include=dev && npx prisma generate && npm run build
```

**Start command:**
```bash
npx prisma db push --accept-data-loss && (node prisma/seed.js || echo "Seed skipped") && node dist/server.js
```

El start command ejecuta en secuencia:
1. `prisma db push` — sincroniza el schema con la base de datos.
2. `node prisma/seed.js` — ejecuta el seed (si falla, continua sin error).
3. `node dist/server.js` — inicia el servidor Fastify.

### 4.3 Base de Datos — PostgreSQL (Render)

| Atributo | Valor |
|----------|-------|
| **Plataforma** | Render Managed Database |
| **Nombre** | `ciudadmoto-db` |
| **Plan** | Free |
| **Engine** | PostgreSQL 16 |
| **Database name** | `ciudadmoto` |
| **User** | `crm` |
| **Conexion** | Via `DATABASE_URL` (connection string interna de Render) |

### 4.4 Redis (Futuro — BullMQ)

Redis esta configurado en el entorno local (`docker-compose.yml`) con la imagen `redis:7-alpine`. Actualmente no se utiliza en produccion. Esta previsto para uso futuro con BullMQ para procesamiento de colas (envio masivo de emails, tareas programadas, etc.).

| Atributo | Valor (local) |
|----------|--------------|
| **Imagen** | `redis:7-alpine` |
| **Puerto** | No expuesto externamente |
| **Persistencia** | Volumen `redisdata` |

---

## 5. Pipeline CI/CD

### 5.1 GitHub Actions — Workflow CI

El pipeline de integracion continua se ejecuta en GitHub Actions y esta definido en `.github/workflows/ci.yml`.

**Triggers:**
- `push` a la rama `project-crm`
- `pull_request` hacia la rama `gen`

**Jobs (en paralelo):**

```
+===========================+     +============================+
|   Job: backend            |     |   Job: frontend            |
|   "Backend - Type-check   |     |   "Frontend - Type-check   |
|    & Test"                |     |    & Test"                 |
|                           |     |                            |
|   1. Checkout             |     |   1. Checkout              |
|   2. Setup Node.js 20    |     |   2. Setup Node.js 20      |
|   3. npm ci               |     |   3. npm ci                |
|   4. prisma generate      |     |   4. Lint (ESLint)         |
|   5. Lint (ESLint)        |     |   5. Type-check (tsc -b)   |
|   6. Type-check (tsc)     |     |   6. Tests (vitest run)    |
|   7. Tests (vitest, si    |     |                            |
|      existen archivos)    |     |                            |
+===========================+     +============================+
```

**Caracteristicas:**
- Ambos jobs corren en `ubuntu-latest` con Node.js 20.
- Se usa `npm ci` para instalacion determinista de dependencias.
- Cache de npm habilitado via `cache-dependency-path` apuntando al `package-lock.json` de cada modulo.
- El backend genera el cliente Prisma antes de lint/typecheck.
- Los tests del backend se ejecutan condicionalmente: solo si vitest esta instalado y existen archivos `.test.ts` o `.spec.ts`.
- Los tests del frontend se ejecutan siempre con `npx vitest run`.

### 5.2 Deploy automatico

- **Vercel**: Deploy automatico en cada push a la rama conectada. Genera preview URLs para cada branch/PR.
- **Render**: Deploy automatico configurado via `render.yaml` (Infrastructure as Code). Cada push al branch configurado dispara un nuevo deploy.

---

## 6. Docker

### 6.1 docker-compose.yml

El archivo `docker-compose.yml` define cuatro servicios para el entorno de desarrollo local:

| Servicio | Imagen/Build | Puerto | Dependencias |
|----------|-------------|--------|-------------|
| **db** | `postgres:16-alpine` | 5432:5432 | Ninguna |
| **redis** | `redis:7-alpine` | No expuesto | Ninguna |
| **backend** | Build desde `./backend/Dockerfile` | 3000:3000 | db (healthy), redis (started) |
| **frontend** | Build desde `./frontend/Dockerfile` | 80:80 | backend |

**Volumenes persistentes:**
- `pgdata` — datos de PostgreSQL
- `redisdata` — datos de Redis

**Health check de la base de datos:**
```
pg_isready -U crm -d ciudadmoto (cada 10s, timeout 5s, 5 reintentos)
```

**Secuencia de inicio del backend:**
```bash
npx prisma migrate deploy && npx prisma db seed && node dist/server.js
```

### 6.2 Dockerfile del Backend (Multi-stage)

El Dockerfile del backend utiliza tres etapas para minimizar el tamano de la imagen final:

| Etapa | Base | Proposito |
|-------|------|-----------|
| **deps** | `node:20-alpine` | Instala solo dependencias de produccion + genera Prisma client |
| **builder** | `node:20-alpine` | Instala todas las dependencias, compila TypeScript |
| **runner** | `node:20-alpine` | Imagen final minima: node_modules de prod + dist compilado + prisma schema |

**Imagen final expone:** Puerto 3000
**Comando:** `node dist/server.js`

### 6.3 Dockerfile del Frontend (Multi-stage)

El Dockerfile del frontend utiliza dos etapas:

| Etapa | Base | Proposito |
|-------|------|-----------|
| **builder** | `node:20-alpine` | Instala dependencias y ejecuta `npm run build` (Vite) |
| **runner** | `nginx:1.27-alpine` | Sirve los assets estaticos con nginx |

**Configuracion de nginx:**
- Sirve archivos estaticos desde `/usr/share/nginx/html`
- Proxy reverso: `/api` redirige a `http://backend:3000`
- SPA fallback: `try_files $uri $uri/ /index.html`
- Cache agresivo de assets estaticos (1 ano, `immutable`)
- Headers de seguridad: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`

---

## 7. Variables de Entorno

### 7.1 Backend

| Variable | Descripcion | Requerida | Generacion |
|----------|-------------|-----------|------------|
| `NODE_ENV` | Entorno de ejecucion (`production`, `development`) | Si | Manual |
| `PORT` | Puerto del servidor Fastify | Si (default: 3000) | Manual |
| `DATABASE_URL` | Connection string de PostgreSQL | Si | Render (automatica) / Manual (local) |
| `JWT_SECRET` | Clave secreta para firma de access tokens JWT | Si | Render (auto-generada) / Manual (local) |
| `JWT_REFRESH_SECRET` | Clave secreta para firma de refresh tokens JWT | Si | Render (auto-generada) / Manual (local) |
| `CORS_ORIGIN` | URL del frontend permitida en CORS | Si | Manual |

### 7.2 Frontend

| Variable | Descripcion | Requerida |
|----------|-------------|-----------|
| `VITE_API_URL` | URL base de la API del backend (ej: `https://ciudadmoto-api.onrender.com/api/v1`) | Si |

### 7.3 Base de Datos (Local — docker-compose)

| Variable | Descripcion | Valor local |
|----------|-------------|-------------|
| `POSTGRES_DB` | Nombre de la base de datos | `ciudadmoto` |
| `POSTGRES_USER` | Usuario de PostgreSQL | `crm` |
| `POSTGRES_PASSWORD` | Password de PostgreSQL | (definido en `.env`) |

### 7.4 Archivo .env.example

El proyecto incluye un `.env.example` con las siguientes variables base:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV`
- `PORT`

> **Nota de seguridad**: Los archivos `.env` con valores reales nunca se versionan. Estan incluidos en `.gitignore`. En Render, las variables se configuran via el dashboard o `render.yaml` con `generateValue: true` para secrets.

---

## 8. Proceso de Deploy

### 8.1 Deploy del Frontend (Vercel)

1. **Desarrollo**: El desarrollador trabaja en una rama `feature/TASK-N-descripcion`.
2. **Push**: Al hacer push, Vercel genera automaticamente una **Preview URL** para esa rama.
3. **QA**: El tester valida los criterios de aceptacion en la Preview URL.
4. **Code Review**: El lider tecnico revisa el PR en GitHub.
5. **Merge a develop/main**: Al hacer merge, Vercel despliega automaticamente a produccion.

**Configuracion necesaria en Vercel:**
- Root directory: `projects/crm/frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite

### 8.2 Deploy del Backend (Render)

1. **Configuracion**: El archivo `render.yaml` en la raiz del repositorio define la infraestructura completa (IaC).
2. **Push**: Al hacer push a la rama configurada, Render detecta cambios en `projects/crm/backend`.
3. **Build**: Render ejecuta `npm ci --include=dev && npx prisma generate && npm run build`.
4. **Start**: Render ejecuta `npx prisma db push --accept-data-loss && (node prisma/seed.js || echo "Seed skipped") && node dist/server.js`.
5. **Health check**: Render verifica que el servicio responda en el puerto 3000.

**render.yaml como IaC:**
```yaml
databases:
  - name: ciudadmoto-db
    plan: free
    databaseName: ciudadmoto
    user: crm

services:
  - type: web
    name: ciudadmoto-api
    plan: free
    runtime: node
    rootDir: projects/crm/backend
```

### 8.3 Deploy Local (Docker)

```bash
# 1. Clonar el repositorio
git clone <repo-url> && cd projects/crm

# 2. Crear archivo .env con las variables necesarias
cp .env.example .env
# Editar .env con los valores correctos

# 3. Levantar todos los servicios
docker-compose up --build

# 4. Acceder
# Frontend: http://localhost:80
# Backend:  http://localhost:3000
# DB:       localhost:5432
```

---

## 9. Monitoreo y Health Checks

### 9.1 Health Check del Backend

El servidor Fastify expone un endpoint `/health` que permite verificar el estado del servicio. Este endpoint es utilizado por Render para determinar si el servicio esta operativo.

### 9.2 Health Check de la Base de Datos (Local)

En el entorno Docker, PostgreSQL tiene un healthcheck configurado:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U crm -d ciudadmoto"]
  interval: 10s
  timeout: 5s
  retries: 5
```

El backend no inicia hasta que la base de datos reporte `healthy`.

### 9.3 Logs

- **Render**: Los logs del backend se visualizan en el dashboard de Render en tiempo real. Incluyen logs de Fastify (requests, errores) y de Prisma (queries en modo debug).
- **Vercel**: Los logs de build y de funciones se visualizan en el dashboard de Vercel.
- **Local**: Los logs de todos los servicios se ven via `docker-compose logs -f`.

### 9.4 Headers de Seguridad (nginx — entorno local)

El frontend servido por nginx en Docker incluye los siguientes headers de seguridad:

| Header | Valor |
|--------|-------|
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

### 9.5 Recomendaciones de Monitoreo Futuro

- Integrar **Sentry** para tracking de errores en frontend y backend.
- Configurar **Uptime Robot** o similar para monitoreo de disponibilidad del endpoint `/health`.
- Implementar **structured logging** (JSON) en el backend para facilitar busqueda y analisis de logs.
- Agregar metricas de performance (tiempo de respuesta, tasa de errores) cuando el volumen de trafico lo justifique.

---

*Documento generado por: DevOps Engineer (GEN)*
*Ultima actualizacion: 2026-03-29*
