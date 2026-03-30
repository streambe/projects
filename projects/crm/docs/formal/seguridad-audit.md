# Auditoria de Seguridad — CRM Ciudad Moto

**Documento**: SEC-AUDIT-001
**Proyecto**: CRM Ciudad Moto
**Fecha**: 2026-03-29
**Auditor**: Especialista en Seguridad — Equipo GEN
**Tipo de revision**: Estatica (code review + analisis de dependencias)
**Skills utilizados**: trail-of-bits/skills, guard-scanner, benlee-skillguard, azhua-skill-vetter

---

## 1. Resumen Ejecutivo

### Alcance

Se auditaron todos los modulos del backend y frontend del CRM Ciudad Moto, cubriendo la totalidad del codigo en produccion a traves de los Sprints 1 a 4 y la fase de deploy. La revision incluyo: autenticacion y gestion de sesiones, autorizacion en endpoints, validacion de inputs, proteccion contra inyeccion, headers de seguridad, rate limiting, configuracion CORS, almacenamiento de secretos, modelo de datos, y dependencias de terceros.

### Veredicto General

**GO** — El sistema aprueba la auditoria de seguridad para operacion en produccion. No se encontraron vulnerabilidades de severidad CRITICAL ni HIGH. Se identificaron hallazgos de severidad MEDIUM y LOW que quedan documentados como deuda tecnica con plan de remediacion.

### Hallazgos Clave

| Severidad | Cantidad |
|-----------|----------|
| CRITICAL  | 0        |
| HIGH      | 0        |
| MEDIUM    | 2        |
| LOW       | 3        |
| INFO      | 2        |

Los controles de seguridad implementados son solidos para un CRM de uso interno con pocos usuarios concurrentes. El sistema aplica defense-in-depth con multiples capas: autenticacion JWT dual-token, validacion Zod en todos los endpoints, Prisma ORM parametrizado, Helmet para headers, rate limiting, y encriptacion AES-256-GCM para tokens de integraciones externas.

---

## 2. Alcance de la Auditoria

### Modulos Auditados

| Modulo | Archivos Principales | Tipo |
|--------|---------------------|------|
| Auth | `auth.routes.ts`, `auth.service.ts`, `auth.schema.ts`, `jwt.plugin.ts` | Backend |
| Clients | `clients.routes.ts`, `clients.service.ts`, `clients.schema.ts` | Backend |
| Opportunities | `opportunities.routes.ts`, `opportunities.service.ts` | Backend |
| Activities | `activities.routes.ts`, `activities.service.ts` | Backend |
| Communications | `communications.routes.ts`, Gmail y WhatsApp services | Backend |
| Reports | `reports.routes.ts`, `reports.service.ts` | Backend |
| Shared/Security | `app.ts`, `encryption.ts`, `jwt.plugin.ts`, `auth.middleware.ts` | Backend |
| Prisma Schema | `schema.prisma` | Base de datos |
| Pipeline (Frontend) | KanbanBoard, KanbanColumn, KanbanCard, CloseOpportunityDialog | Frontend |
| Auth (Frontend) | LoginPage, useAuth, api.ts (interceptors) | Frontend |
| App Shell | App.tsx, routing, lib/api.ts | Frontend |

### Tipo de Revision

- **Revision estatica de codigo**: analisis manual linea por linea de todos los modulos criticos.
- **Analisis de dependencias**: `npm audit` en backend y frontend.
- **Revision de configuracion**: plugins de seguridad de Fastify, variables de entorno, esquema de base de datos.
- **NO incluido**: penetration testing dinamico, fuzzing, analisis de infraestructura cloud (Render/Vercel).

---

## 3. Metodologia

La auditoria se baso en el framework **OWASP Top 10 (2021)** como referencia primaria, complementado con las siguientes practicas:

### 3.1 Revision de Codigo

- Analisis manual de cada archivo de rutas (`*.routes.ts`) verificando presencia de `preHandler: [fastify.authenticate]` en cada endpoint protegido.
- Revision de schemas Zod para validacion de inputs en todos los endpoints.
- Busqueda de patrones peligrosos: `eval()`, `dangerouslySetInnerHTML`, `innerHTML`, `Function()`, SQL raw sin parametrizar, secrets hardcodeados.
- Verificacion de manejo de errores: que no se expongan stack traces ni detalles internos en produccion.

### 3.2 Analisis de Dependencias

- Ejecucion de `npm audit` en ambos proyectos (backend y frontend).
- Revision manual de dependencias criticas: `@fastify/jwt`, `bcryptjs`, `jsonwebtoken`, `@prisma/client`, `@dnd-kit`.
- Verificacion de versiones contra CVEs publicados en NVD y GitHub Security Advisories.

### 3.3 Analisis de Configuracion

- Revision de configuracion de Helmet (CSP, HSTS, X-Content-Type-Options, X-Frame-Options).
- Revision de configuracion de CORS (origin, credentials, methods).
- Revision de configuracion de rate limiting (max, timeWindow).
- Revision de cookies de sesion (HttpOnly, Secure, SameSite, Path, MaxAge).

### 3.4 Herramientas y Skills

- **trail-of-bits/skills**: metodologia de auditoria de seguridad, checklists de revision.
- **guard-scanner**: analisis estatico automatizado de patrones inseguros.
- **benlee-skillguard**: auditoria de skills del repositorio VoltAgent utilizados en el proyecto.
- **azhua-skill-vetter**: vetting de skills de fuentes externas.

---

## 4. Controles de Seguridad Implementados

### 4.1 Autenticacion: JWT Dual-Token

**Implementacion**: `jwt.plugin.ts`, `auth.routes.ts`, `auth.service.ts`

| Control | Detalle |
|---------|---------|
| Access Token | JWT firmado con `JWT_SECRET`, expiracion configurable (default `1h`) |
| Refresh Token | JWT firmado con `JWT_REFRESH_SECRET` (secreto independiente), expiracion `7d` |
| Almacenamiento access token | En memoria del cliente (Zustand store), nunca en localStorage |
| Almacenamiento refresh token | Cookie HttpOnly + Secure (produccion) + SameSite=Strict |
| Hashing de passwords | bcryptjs con 12 rounds (`BCRYPT_ROUNDS = 12`) |
| Prevencion de enumeracion | Mensaje identico para usuario inexistente y password incorrecto: `"Invalid email or password"` |
| Validacion de secretos al startup | El plugin lanza error fatal si `JWT_SECRET` o `JWT_REFRESH_SECRET` no estan definidos |
| Logout | Limpia cookie de refresh token via `clearCookie` |

**Evaluacion**: ROBUSTO. La separacion de secretos entre access y refresh tokens es una buena practica. El uso de HttpOnly cookies para el refresh token previene acceso desde JavaScript (XSS). bcrypt con 12 rounds es adecuado para el volumen de usuarios esperado.

### 4.2 Autorizacion: preHandler authenticate

**Implementacion**: decorador `fastify.authenticate` aplicado como `preHandler` en cada ruta protegida.

**Cobertura verificada**:

| Modulo | Endpoints | preHandler authenticate |
|--------|-----------|------------------------|
| Auth — login | POST `/auth/login` | No (publico, correcto) |
| Auth — refresh | POST `/auth/refresh` | `authenticateRefresh` (cookie) |
| Auth — logout | POST `/auth/logout` | Si |
| Auth — register | POST `/auth/register` | Si |
| Auth — me | GET `/auth/me` | Si |
| Auth — users | GET `/auth/users` | Si |
| Auth — update user | PUT `/auth/users/:id` | Si |
| Auth — delete user | DELETE `/auth/users/:id` | Si |
| Clients | Todos los endpoints | Si |
| Opportunities | Todos los endpoints | Si |
| Activities | Todos los endpoints | Si |
| Communications | Todos los endpoints | Si |
| Reports | Todos los endpoints | Si |
| Health | GET `/health` | No (publico, correcto) |

**Evaluacion**: COMPLETO. Todos los endpoints de negocio estan protegidos. Los unicos endpoints publicos son `/auth/login`, `/auth/refresh` (protegido por cookie) y `/health`.

### 4.3 Validacion de Inputs: Zod

**Implementacion**: schemas Zod definidos en `*.schema.ts` por modulo, validados via `safeParse()` en cada endpoint.

| Schema | Validaciones Clave |
|--------|--------------------|
| `LoginBodySchema` | email: `z.string().email().toLowerCase()`, password: `z.string().min(1)` |
| `RegisterBodySchema` | fullName: `min(2).max(150)`, email: `email().toLowerCase()`, password: `min(8).max(128)` |
| `UpdateUserBodySchema` | Todos opcionales, mismas validaciones que Register |
| Client schemas | DNI unico, phone unico, email formato, longitudes max |
| Opportunity schemas | Stage como enum, result como enum, campos requeridos tipados |
| Activity schemas | Type como enum, status como enum, fechas como ISO 8601 |

**Evaluacion**: SOLIDO. La normalizacion de email con `.toLowerCase()` previene duplicados por capitalizacion. Los limites de longitud previenen ataques de payload oversize. La validacion de enums restringe valores a los permitidos.

### 4.4 Proteccion contra Injection: Prisma ORM

**Implementacion**: todas las queries a PostgreSQL pasan por Prisma Client, que usa consultas parametrizadas internamente.

- No se encontro uso de `$queryRaw` ni `$executeRaw` en ningun modulo.
- No se encontro concatenacion de strings en queries SQL.
- Los filtros de busqueda usan el API tipado de Prisma (`where`, `contains`, `equals`).

**Evaluacion**: ROBUSTO. Prisma elimina la posibilidad de SQL injection en el uso actual del proyecto. El riesgo solo existiria si se introduce `$queryRaw` en el futuro sin parametrizacion.

### 4.5 Headers de Seguridad: Helmet

**Implementacion**: `@fastify/helmet` registrado en `app.ts`.

```typescript
await app.register(fastifyHelmet, {
  contentSecurityPolicy: process.env['NODE_ENV'] === 'production',
});
```

| Header | Comportamiento |
|--------|---------------|
| Content-Security-Policy | Activo solo en produccion (default estricto de Helmet) |
| X-Content-Type-Options | `nosniff` (default Helmet) |
| X-Frame-Options | `SAMEORIGIN` (default Helmet) |
| X-XSS-Protection | Deshabilitado (correcto, deprecado en favor de CSP) |
| Strict-Transport-Security | Habilitado en produccion (HSTS) |
| X-DNS-Prefetch-Control | `off` (default Helmet) |
| X-Download-Options | `noopen` (default Helmet) |
| X-Permitted-Cross-Domain-Policies | `none` (default Helmet) |
| Referrer-Policy | `no-referrer` (default Helmet) |

**Evaluacion**: ADECUADO. CSP deshabilitado en desarrollo es correcto para DX. Los defaults de Helmet son apropiados para una API REST.

### 4.6 Rate Limiting

**Implementacion**: `@fastify/rate-limit` en `app.ts`.

```typescript
await app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
});
```

- 100 requests por minuto por IP.
- Respuesta personalizada con codigo 429 y mensaje claro.
- `trustProxy: true` habilitado en Fastify para respetar `X-Forwarded-For` detras de Render/Vercel.

**Evaluacion**: ADECUADO para el volumen de usuarios esperado. Ver recomendacion MEDIUM-01 sobre rate limiting diferenciado para `/auth/login`.

### 4.7 CORS

**Implementacion**: `@fastify/cors` en `app.ts`.

```typescript
await app.register(fastifyCors, {
  origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
```

- Origin restringido a una URL especifica (configurable via env var).
- `credentials: true` permite envio de cookies cross-origin.
- Metodos limitados a los necesarios.

**Evaluacion**: CORRECTO. El origin no es wildcard (`*`), lo cual es critico para la seguridad de cookies con `credentials: true`.

### 4.8 Almacenamiento de Secrets

| Secret | Mecanismo |
|--------|-----------|
| JWT_SECRET | Variable de entorno |
| JWT_REFRESH_SECRET | Variable de entorno (independiente de JWT_SECRET) |
| DATABASE_URL | Variable de entorno |
| ENCRYPTION_KEY | Variable de entorno (64 hex chars = 32 bytes para AES-256) |
| Tokens OAuth Gmail | Encriptados con AES-256-GCM en BD (`access_token_enc`, `refresh_token_enc`) |
| Token API WhatsApp | Encriptado con AES-256-GCM en BD (`api_token_enc`) |

- No se encontraron secrets hardcodeados en el codigo fuente.
- `.env.example` existe como template sin valores reales.
- `.env.local` esta en `.gitignore`.

**Evaluacion**: ROBUSTO. La encriptacion AES-256-GCM con IV aleatorio de 96 bits y auth tag de 128 bits es el estandar de la industria. La clave de encriptacion se valida al startup (debe ser exactamente 64 hex chars).

---

## 5. Pruebas Ejecutadas — OWASP Top 10

| ID | Categoria OWASP | Descripcion | Resultado | Detalle |
|----|-----------------|-------------|-----------|---------|
| A01-01 | A01: Broken Access Control | Todos los endpoints de negocio tienen `preHandler: [fastify.authenticate]` | **PASS** | Verificado en 6 modulos de rutas. Solo `/auth/login`, `/auth/refresh` y `/health` son publicos. |
| A01-02 | A01: Broken Access Control | Verificacion de IDOR (Insecure Direct Object References) | **PASS (con nota)** | Los endpoints usan UUID como identificador, lo que dificulta la enumeracion. Sin embargo, no hay verificacion de propiedad (ownership) — cualquier usuario autenticado puede acceder a cualquier recurso. Aceptable para MVP donde todos los usuarios son del mismo negocio. Ver MEDIUM-02. |
| A01-03 | A01: Broken Access Control | Proteccion de rutas frontend | **WARN** | Las rutas del frontend no tienen componente `ProtectedRoute` en el router. La proteccion real esta en el backend. Ver LOW-01. |
| A02-01 | A02: Cryptographic Failures | Passwords hasheadas con bcrypt (12 rounds) | **PASS** | `bcryptjs` con `BCRYPT_ROUNDS = 12`. El hash nunca se expone en responses (select explicito excluye `passwordHash`). |
| A02-02 | A02: Cryptographic Failures | Tokens OAuth/WhatsApp encriptados con AES-256-GCM | **PASS** | Implementacion en `encryption.ts` con IV aleatorio de 96 bits, auth tag de 128 bits, clave de 256 bits validada al startup. |
| A02-03 | A02: Cryptographic Failures | JWT con secretos separados para access y refresh | **PASS** | `JWT_SECRET` y `JWT_REFRESH_SECRET` son variables independientes. El plugin valida su existencia al startup. |
| A02-04 | A02: Cryptographic Failures | Cookie refresh token con flags de seguridad | **PASS** | HttpOnly=true, Secure=true (produccion), SameSite=strict, MaxAge=7 dias. |
| A03-01 | A03: Injection (SQL) | Todas las queries usan Prisma ORM parametrizado | **PASS** | No se encontro uso de `$queryRaw`, `$executeRaw`, ni concatenacion de strings en queries. |
| A03-02 | A03: Injection (XSS) | Frontend: busqueda de `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `Function()` | **PASS** | No se encontro ningun uso. React escapa automaticamente contenido en JSX. |
| A03-03 | A03: Injection (XSS) | Frontend: verificacion de href/src dinamicos | **PASS** | No existen links ni imagenes con URLs construidas desde input de usuario. |
| A03-04 | A03: Injection (NoSQL) | No aplica — el sistema usa PostgreSQL | **N/A** | La base de datos es relacional (PostgreSQL via Prisma). No hay motores NoSQL. |
| A04-01 | A04: Insecure Design | Soft delete en vez de hard delete para datos de negocio | **PASS** | Clientes y usuarios usan `isActive: false` para eliminacion logica. Preserva integridad referencial y auditoria. |
| A04-02 | A04: Insecure Design | Traceability de cambios de oportunidades | **PASS** | Modelo `OpportunityHistory` registra cada cambio de stage con usuario y timestamp. |
| A04-03 | A04: Insecure Design | Error handler no expone internals en produccion | **PASS** | El error handler global devuelve `"An unexpected error occurred"` en produccion para errores no operacionales. Stack traces solo en desarrollo. |
| A05-01 | A05: Security Misconfiguration | Swagger/OpenAPI deshabilitado en produccion | **PASS** | `if (process.env['NODE_ENV'] !== 'production')` protege el registro de Swagger y SwaggerUI. |
| A05-02 | A05: Security Misconfiguration | Helmet con defaults seguros | **PASS** | Headers de seguridad configurados correctamente. CSP activo en produccion. |
| A05-03 | A05: Security Misconfiguration | Rate limiting activo globalmente | **PASS** | 100 req/min por IP. Respuesta 429 personalizada. |
| A05-04 | A05: Security Misconfiguration | Variables de entorno validadas al startup | **PASS** | `JWT_SECRET`, `JWT_REFRESH_SECRET`, y `ENCRYPTION_KEY` se validan antes de arrancar el servidor. Fallo = crash inmediato, no arranque silencioso. |
| A06-01 | A06: Vulnerable Components | `npm audit` backend | **PASS** | Sin vulnerabilidades criticas ni altas en dependencias de produccion. |
| A06-02 | A06: Vulnerable Components | `npm audit` frontend | **PASS (con nota)** | 5 vulnerabilidades moderate en `esbuild <=0.24.2` (dependencia transitiva de Vite). Solo afecta dev server local. No impacta produccion. Ver INFO-01. |
| A06-03 | A06: Vulnerable Components | Revision de @dnd-kit | **PASS** | Sin CVEs conocidos para @dnd-kit/core@^6.3.1 ni @dnd-kit/utilities@^3.2.2. |
| A07-01 | A07: Authentication Failures | Prevencion de enumeracion de usuarios | **PASS** | Login devuelve el mismo mensaje de error para usuario inexistente y password incorrecto. |
| A07-02 | A07: Authentication Failures | Password policy | **PASS** | Minimo 8 caracteres, maximo 128. Validado con Zod en `RegisterBodySchema` y `UpdateUserBodySchema`. |
| A07-03 | A07: Authentication Failures | Verificacion de usuario activo en login | **PASS** | `validateCredentials()` verifica `user.isActive` antes de comparar password. Usuarios desactivados no pueden autenticarse. |
| A07-04 | A07: Authentication Failures | Refresh token rotation | **WARN** | El refresh token no se rota en cada uso (se emite uno nuevo en login, el mismo se reutiliza hasta expiracion). Ver LOW-02. |
| A08-01 | A08: Data Integrity Failures | Validacion de inputs con Zod en todos los endpoints | **PASS** | Todos los endpoints de escritura validan el body con schemas Zod antes de procesar. |
| A08-02 | A08: Data Integrity Failures | Idempotencia en mensajes externos | **PASS** | Constraint `@@unique([channel, externalId])` en tabla `messages` previene duplicados de Gmail/WhatsApp. |
| A09-01 | A09: Logging Failures | Logger estructurado con Pino (via Fastify) | **PASS** | Logging configurado con nivel `info` por defecto, pretty-print en desarrollo. Errores loggeados en el error handler global. |
| A09-02 | A09: Logging Failures | Passwords y tokens no aparecen en logs | **PASS** | El payload de JWT solo contiene `sub`, `email`, `fullName`. Passwords nunca se loggean. Pino serializa objetos de forma segura. |
| A10-01 | A10: SSRF | Evaluacion de llamadas HTTP salientes | **PASS** | Las unicas llamadas salientes son a Gmail API y WhatsApp Cloud API, ambas a URLs fijas de Google y Meta. No hay endpoints que acepten URLs del usuario. |

---

## 6. Vulnerabilidades Encontradas

### Tabla Resumen

| ID | Severidad | Descripcion | Ubicacion | Estado | Recomendacion |
|----|-----------|-------------|-----------|--------|---------------|
| MEDIUM-01 | MEDIUM | Rate limiting no diferenciado en `/auth/login` | `app.ts` | Deuda tecnica | Agregar rate limit mas estricto (ej: 5 intentos / 15 min) especificamente para `/auth/login` para prevenir fuerza bruta. El rate limit global de 100/min es insuficiente para proteger el endpoint de login. |
| MEDIUM-02 | MEDIUM | Ausencia de verificacion de ownership (IDOR parcial) | Todos los `*.routes.ts` | Aceptado para MVP | Cualquier usuario autenticado puede ver/editar recursos de otros usuarios. Aceptable porque todos los usuarios pertenecen al mismo negocio (Ciudad Moto). Si se agrega multi-tenancy o roles, este control es obligatorio. |
| LOW-01 | LOW | Ausencia de componente ProtectedRoute en el router frontend | `App.tsx` | Deuda tecnica | Agregar `ProtectedRoute` que verifique token y redirija a `/login`. Impacto: UX degradada (usuario ve UI con errores 401 si no esta autenticado). No es vulnerabilidad real porque el backend rechaza requests sin token. |
| LOW-02 | LOW | Refresh token no se rota en cada uso | `auth.routes.ts` `/refresh` | Deuda tecnica | Implementar refresh token rotation: en cada `/refresh`, invalidar el token anterior y emitir uno nuevo. Reduce la ventana de exposicion si un refresh token es comprometido. |
| LOW-03 | LOW | Ausencia de blacklist de access tokens en logout | `auth.routes.ts` `/logout` | Aceptado para MVP | El logout limpia la cookie pero el access token sigue valido hasta su expiracion natural. En MVP con expiracion corta, el riesgo es bajo. Para produccion con multiples dispositivos, considerar blacklist en Redis. |
| INFO-01 | INFO | Vulnerabilidades moderate en esbuild (dev-only) | Dependencia transitiva `esbuild <=0.24.2` via Vite | Sin accion | GHSA-67mh-4wv8-2f99. Solo afecta dev server local. No existe en produccion. Actualizar Vite cuando haya version compatible. |
| INFO-02 | INFO | CSP deshabilitado en desarrollo | `app.ts` | Intencional | `contentSecurityPolicy: process.env['NODE_ENV'] === 'production'`. Correcto para DX. CSP activo en produccion. |

---

## 7. Analisis de Dependencias

### Backend — `npm audit`

| Paquete | Vulnerabilidad | Severidad | Impacta Produccion |
|---------|---------------|-----------|-------------------|
| (ninguna) | — | — | — |

**Resultado**: 0 vulnerabilidades en dependencias de produccion del backend.

### Frontend — `npm audit`

| Paquete | Vulnerabilidad | Severidad | Impacta Produccion |
|---------|---------------|-----------|-------------------|
| esbuild <=0.24.2 | GHSA-67mh-4wv8-2f99 — cross-origin requests al dev server | Moderate | NO (dev-only) |

**Resultado**: 5 hallazgos moderate, todos en `esbuild` (dependencia transitiva de Vite/Vitest). Esbuild no se incluye en el bundle de produccion. El riesgo es exclusivamente para el entorno de desarrollo local.

### Dependencias Criticas Revisadas Manualmente

| Dependencia | Version | CVEs Conocidos | Estado |
|-------------|---------|---------------|--------|
| @fastify/jwt | 8.x | Ninguno | OK |
| @fastify/helmet | latest | Ninguno | OK |
| @fastify/rate-limit | latest | Ninguno | OK |
| @fastify/cors | latest | Ninguno | OK |
| @fastify/cookie | latest | Ninguno | OK |
| bcryptjs | 5.x | Ninguno | OK |
| jsonwebtoken | latest | Ninguno | OK |
| @prisma/client | 5.x | Ninguno | OK |
| zod | 3.x | Ninguno | OK |
| @dnd-kit/core | 6.3.1 | Ninguno | OK |
| @dnd-kit/utilities | 3.2.2 | Ninguno | OK |
| axios | 1.x | Ninguno | OK |

---

## 8. Seguridad en el Modelo de Datos

### 8.1 Campos Sensibles y Encriptacion

| Tabla | Campo | Proteccion |
|-------|-------|-----------|
| `users` | `password_hash` | Hasheado con bcrypt (12 rounds). Nunca se selecciona en queries de lectura (select explicito). |
| `gmail_credentials` | `access_token_enc` | Encriptado con AES-256-GCM. IV aleatorio por registro. |
| `gmail_credentials` | `refresh_token_enc` | Encriptado con AES-256-GCM. IV aleatorio por registro. |
| `whatsapp_config` | `api_token_enc` | Encriptado con AES-256-GCM. IV aleatorio por registro. |

### 8.2 Eliminacion Logica (Soft Delete)

| Tabla | Campo | Comportamiento |
|-------|-------|---------------|
| `users` | `is_active` | Default `true`. Eliminacion via `isActive = false`. Login verifica `isActive`. |
| `clients` | `is_active` | Default `true`. Queries de listado filtran por `isActive = true`. |
| `gmail_credentials` | `is_active` | Permite desactivar integraciones sin perder configuracion. |
| `whatsapp_config` | `is_active` | Idem. |

**Evaluacion**: La eliminacion logica preserva la integridad referencial y permite auditoria. Las oportunidades y actividades no tienen soft delete, lo cual es correcto porque dependen de clientes activos.

### 8.3 Indices de Seguridad y Performance

| Tabla | Indice | Proposito de seguridad |
|-------|--------|----------------------|
| `clients` | `@@index([email])` | Busqueda rapida para vinculacion de mensajes Gmail. |
| `clients` | `@@index([whatsappNumber])` | Busqueda rapida para vinculacion de mensajes WhatsApp. |
| `clients` | `@@index([isActive])` | Filtro eficiente para excluir clientes eliminados logicamente. |
| `messages` | `@@unique([channel, externalId])` | Idempotencia: previene mensajes duplicados de fuentes externas. |
| `messages` | `@@index([channel, fromAddress])` | Vinculacion rapida de mensajes entrantes. |
| `users` | `email UNIQUE` | Previene cuentas duplicadas. |
| `clients` | `dni UNIQUE` | Previene clientes duplicados por documento. |
| `clients` | `phone_primary UNIQUE` | Previene clientes duplicados por telefono. |

### 8.4 Tipos de Datos y Restricciones

- Todos los IDs son `UUID v4` (no secuenciales, dificultan enumeracion).
- Campos de texto sensibles tienen `@db.VarChar(N)` con longitudes maximas definidas.
- Timestamps usan `@db.Timestamptz` (con timezone, evita ambiguedades).
- Enums de PostgreSQL (`OpportunityStage`, `ActivityType`, etc.) restringen valores a nivel de base de datos.

---

## 9. Seguridad Cross-Origin

### 9.1 Configuracion CORS

```typescript
origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173'
credentials: true
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
```

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Origin wildcard (`*`) | NO utilizado | Origin restringido a URL exacta del frontend. |
| Credentials | Habilitado | Necesario para envio de cookies HttpOnly cross-origin. |
| Origin via env var | Si | Configurable por entorno sin cambio de codigo. |
| Methods restringidos | Si | Solo los metodos HTTP usados por la aplicacion. |

**Evaluacion**: CORRECTO. La configuracion sigue las best practices de CORS para aplicaciones con autenticacion basada en cookies.

### 9.2 Cookies y SameSite

```typescript
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 dias
};
```

| Atributo | Valor | Evaluacion |
|----------|-------|-----------|
| HttpOnly | `true` | Correcto. Previene acceso desde JavaScript (XSS). |
| Secure | `true` en produccion | Correcto. Cookie solo viaja por HTTPS. |
| SameSite | `strict` | Previene CSRF. Nota: puede causar problemas si frontend y backend estan en dominios distintos (ver leccion aprendida documentada). |
| Path | `/` | La cookie se envia a todas las rutas. Podria restringirse a `/api/v1/auth/refresh` para minimizar exposicion. |
| MaxAge | 7 dias | Adecuado. Balance entre UX (no reloguear constantemente) y seguridad. |

### 9.3 Proteccion CSRF

- **SameSite=Strict**: el navegador no envia la cookie en requests cross-origin. Esto es la proteccion principal contra CSRF.
- **Bearer token en header**: el access token se envia como `Authorization: Bearer <token>`, lo cual no es susceptible a CSRF (los formularios HTML no pueden setear headers custom).
- **No se requiere token CSRF adicional**: la combinacion de SameSite=Strict + Bearer header proporciona proteccion suficiente.

**Evaluacion**: ADECUADO. La arquitectura de dual-token (access en header + refresh en cookie SameSite=Strict) tiene proteccion intrinseca contra CSRF.

---

## 10. Recomendaciones

Priorizadas por severidad y esfuerzo de implementacion.

### Prioridad Alta (MEDIUM — implementar en proximo sprint)

| # | Recomendacion | Esfuerzo | Impacto |
|---|--------------|----------|---------|
| R-01 | **Rate limiting diferenciado para `/auth/login`**: Configurar limite de 5 intentos cada 15 minutos por IP en el endpoint de login. Usar `{ config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } }` en la ruta. | Bajo (< 1h) | Previene ataques de fuerza bruta contra passwords. |
| R-02 | **Documentar aceptacion de riesgo IDOR**: Si se decide no implementar ownership checks en MVP, documentar formalmente la decision como ADR con plan de remediacion antes de agregar multi-tenancy o roles. | Bajo | Trazabilidad de decision de seguridad. |

### Prioridad Media (LOW — implementar cuando sea conveniente)

| # | Recomendacion | Esfuerzo | Impacto |
|---|--------------|----------|---------|
| R-03 | **Agregar ProtectedRoute en frontend**: Componente que verifique token en Zustand store y redirija a `/login`. Mejora UX y agrega defense-in-depth. | Bajo (2-3h) | UX mejorada. Capa adicional de seguridad visual. |
| R-04 | **Implementar refresh token rotation**: En cada `/auth/refresh`, emitir un nuevo refresh token y invalidar el anterior (guardar hash en BD con flag `revoked`). | Medio (4-6h) | Reduce ventana de exposicion de refresh tokens comprometidos. |
| R-05 | **Restringir cookie path a `/api/v1/auth`**: Cambiar `path: '/'` a `path: '/api/v1/auth'` en las opciones de la cookie de refresh. | Bajo (< 30min) | Minimiza superficie de exposicion de la cookie. |

### Prioridad Baja (INFO — mejora continua)

| # | Recomendacion | Esfuerzo | Impacto |
|---|--------------|----------|---------|
| R-06 | **Actualizar Vite** cuando haya version que resuelva vulnerabilidades de esbuild. | Bajo | Limpieza de `npm audit`. |
| R-07 | **Agregar logging de intentos de login fallidos** con IP, timestamp y email intentado (sin password). Util para deteccion de ataques. | Bajo (1-2h) | Mejora capacidad de deteccion. |
| R-08 | **Considerar access token blacklist via Redis** si se agregan multiples dispositivos o sesiones simultaneas. | Alto | Solo necesario si cambian los requerimientos de sesion. |
| R-09 | **Agregar password complexity rules** (al menos una mayuscula, un numero, un caracter especial) si el negocio lo requiere. Actualmente solo se valida longitud minima de 8. | Bajo (1h) | Mejora fortaleza de passwords. |

---

## 11. Veredicto Final

### **GO**

El CRM Ciudad Moto **aprueba la auditoria de seguridad** para operacion en produccion.

### Justificacion

1. **0 vulnerabilidades CRITICAL o HIGH**: No se encontraron fallos de seguridad que permitan acceso no autorizado, exfiltracion de datos, o ejecucion de codigo.

2. **Controles de seguridad solidos en todas las capas**:
   - Autenticacion JWT dual-token con secretos separados
   - Passwords hasheadas con bcrypt (12 rounds)
   - Cookies HttpOnly + Secure + SameSite=Strict
   - Validacion Zod en todos los endpoints
   - Prisma ORM parametrizado (sin SQL injection)
   - Helmet con headers de seguridad
   - Rate limiting global
   - CORS restringido
   - Encriptacion AES-256-GCM para tokens de integraciones
   - Error handler que no expone internals en produccion

3. **Hallazgos MEDIUM aceptables para MVP**: Los 2 hallazgos MEDIUM (rate limiting de login y IDOR) son riesgos conocidos y documentados, con plan de remediacion claro. No representan riesgo real para un sistema de uso interno con 2-5 usuarios del mismo negocio.

4. **Dependencias limpias**: 0 CVEs en dependencias de produccion. Las unicas vulnerabilidades reportadas afectan herramientas de desarrollo (esbuild).

5. **Buenas practicas de seguridad demostradas**: Prevencion de enumeracion de usuarios, soft delete, traceability de cambios, secretos en env vars, validacion de configuracion al startup, encriptacion at-rest de tokens sensibles.

### Condiciones

- Las recomendaciones R-01 (rate limiting para login) y R-02 (documentar IDOR) deben implementarse antes de agregar usuarios externos al sistema.
- Si se agrega multi-tenancy o roles con permisos diferenciados, se requiere una nueva auditoria de seguridad.
- Los tokens de integracion (Gmail OAuth, WhatsApp API) deben rotarse periodicamente segun las politicas de Google y Meta.

---

*Auditoria realizada por: Especialista en Seguridad — Equipo GEN*
*Skills utilizados: trail-of-bits/skills (metodologia de auditoria), guard-scanner (analisis estatico), benlee-skillguard (auditoria de skills), azhua-skill-vetter (vetting externo)*
*Fecha de emision: 2026-03-29*
*Proxima auditoria recomendada: Cuando se implementen integraciones Gmail/WhatsApp o se agreguen roles/permisos*
