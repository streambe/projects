# Security Audit - LeadGen MVP

**Auditor**: Hedy Lamarr (Especialista en Seguridad)
**Fecha**: 2026-04-03
**Alcance**: Todas las API routes, middleware, configuracion Next.js, templates
**Veredicto**: GO (con fixes aplicados)

---

## Resumen Ejecutivo

Se auditaron 16 API route handlers en 11 archivos. Se encontraron 2 vulnerabilidades CRITICAL, 1 HIGH, y 3 MEDIUM. Las CRITICAL y HIGH fueron corregidas directamente en el codigo.

---

## Vulnerabilidades Encontradas y Corregidas

### SEC-001: Missing Authentication on 6 API Routes [CRITICAL] - CORREGIDO

**Rutas afectadas:**
- `GET/POST/PATCH /api/leads`
- `GET/PATCH /api/leads/[id]`
- `GET/POST /api/leads/[id]/activities`
- `GET /api/dashboard/stats`
- `POST /api/scoring/recalculate`
- `POST /api/import`

**Impacto:** Cualquier usuario no autenticado podia leer, crear y modificar leads, ver estadisticas del dashboard y disparar recalculos de scoring. Acceso total a los datos de negocio sin sesion.

**Fix aplicado:** Se agrego `requireAuth()` check al inicio de cada handler. Se creo `src/lib/auth.ts` como helper reutilizable.

### SEC-002: Missing Next.js Middleware [CRITICAL] - CORREGIDO

**Descripcion:** El archivo `src/lib/supabase/middleware.ts` existia con la funcion `updateSession`, pero NO habia un `src/middleware.ts` raiz que lo invocara. Esto significaba que la proteccion de rutas a nivel de Next.js middleware no estaba activa.

**Fix aplicado:** Se creo `src/middleware.ts` que importa y ejecuta `updateSession` para todas las rutas excepto assets estaticos.

### SEC-003: Mass Assignment en Leads API [HIGH] - CORREGIDO

**Rutas afectadas:**
- `POST /api/leads` - pasaba `body` directo a `prisma.lead.create`
- `PATCH /api/leads/[id]` - pasaba `body` directo a `prisma.lead.update`
- `PATCH /api/leads` (query param) - idem
- `POST /api/leads/[id]/activities` - spread de `...body`

**Impacto:** Un atacante podia enviar campos arbitrarios como `score`, `scoreDemographic`, `scoreBehavioral`, `createdAt`, o cualquier campo del modelo, sobrescribiendo valores que deberian ser controlados por el sistema.

**Fix aplicado:** Se implemento whitelist de campos permitidos en cada endpoint POST/PATCH. Solo se aceptan los campos explicitamente listados.

---

## Vulnerabilidades Documentadas (MEDIUM/LOW)

### SEC-004: No Rate Limiting [MEDIUM]

**Descripcion:** No hay rate limiting en ningun endpoint, incluyendo login (manejado por Supabase client-side). Un atacante podria hacer brute-force o abusar de endpoints como `/api/scoring/recalculate` o `/api/import/csv`.

**Recomendacion:** Implementar rate limiting con `next-rate-limit` o Vercel Edge Config. Priorizar `/api/import/*` y `/api/scoring/recalculate`.

### SEC-005: No Security Headers [MEDIUM] - CORREGIDO

**Descripcion:** `next.config.ts` estaba vacio, sin headers de seguridad.

**Fix aplicado:** Se agregaron X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, y Permissions-Policy.

### SEC-006: Scoring Recalculate sin Limite [MEDIUM]

**Descripcion:** `POST /api/scoring/recalculate` carga TODOS los leads en memoria con `findMany` sin paginacion. En una base de datos con muchos leads, esto podria causar OOM o timeout.

**Recomendacion:** Implementar procesamiento por batches (ej: 100 leads por iteracion).

---

## Areas Sin Vulnerabilidades

| Area | Estado | Notas |
|------|--------|-------|
| SQL Injection | SAFE | Prisma usa queries parametrizadas por defecto |
| XSS | SAFE | React escapa output por defecto, no se usa dangerouslySetInnerHTML |
| Secrets hardcodeados | SAFE | No se encontraron API keys ni secrets en el codigo fuente |
| Supabase auth | SAFE | Usa `getUser()` (server-side verification), no `getSession()` |
| CORS | SAFE | Next.js maneja CORS por defecto sin abrir origenes extra |
| Template rendering | SAFE | Templates usan `{{variable}}` pero se renderizan en React, no con innerHTML |

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/middleware.ts` | NUEVO - Wiring de Supabase middleware |
| `src/lib/auth.ts` | NUEVO - Helper requireAuth() |
| `src/app/api/leads/route.ts` | Auth + whitelist |
| `src/app/api/leads/[id]/route.ts` | Auth + whitelist |
| `src/app/api/leads/[id]/activities/route.ts` | Auth + whitelist |
| `src/app/api/dashboard/stats/route.ts` | Auth |
| `src/app/api/scoring/recalculate/route.ts` | Auth |
| `src/app/api/import/route.ts` | Auth |
| `next.config.ts` | Security headers |
