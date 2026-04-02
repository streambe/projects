# Reporte de Testing — Sprint 1

**Responsable**: Richard Feynman (QA Lead)
**Proyecto**: POC Encuestas Streambe
**Fecha**: 2026-04-01
**Sprint**: 1

---

## 1. Plan de Tests

| Tipo | Herramienta | Alcance |
|------|-------------|---------|
| Unit tests | Vitest | Validaciones de API, logica de rutas |
| Auth tests | Vitest | Authorize, JWT, session callback, middleware |
| Build verification | Next.js build | Compilacion completa sin errores |
| Deploy verification | Vercel | Preview y produccion funcionales |

---

## 2. Resultados de Ejecucion

### Tests API (46 tests) — PASANDO

| Grupo | Tests | Estado |
|-------|-------|--------|
| Validaciones de entrada (titulo, preguntas) | 18 | PASS |
| Rutas CRUD encuestas | 14 | PASS |
| Respuestas de error (400, 401, 404) | 10 | PASS |
| Serializacion y formato de respuesta | 4 | PASS |

### Tests Auth (20 tests) — PASANDO

| Grupo | Tests | Estado |
|-------|-------|--------|
| Funcion authorize (credenciales validas/invalidas) | 6 | PASS |
| JWT callback (token con userId) | 4 | PASS |
| Session callback (session con userId) | 4 | PASS |
| Middleware proteccion de rutas | 6 | PASS |

### Build y Deploy

| Verificacion | Estado |
|-------------|--------|
| `next build` exitoso | PASS |
| Deploy Vercel preview | PASS |
| Deploy Vercel produccion | PASS |

---

## 3. Cobertura

| Area | Cobertura | Notas |
|------|-----------|-------|
| API routes y validaciones | Alta | 46 tests cubren todos los endpoints |
| Autenticacion | Alta | 20 tests cubren authorize, JWT, session, middleware |
| Frontend (e2e) | Pendiente | Planificado para Sprint 2 con Playwright |
| Flujo publico de encuesta | Pendiente | Sprint 2 |

---

## 4. Bugs Encontrados

### BUG-001 — Prisma client no se genera en Vercel build

| Campo | Valor |
|-------|-------|
| Severidad | P3 (Medio) |
| Estado | RESUELTO |
| Descripcion | Vercel build falla porque Prisma client no esta generado |
| Causa raiz | Prisma 7 requiere `prisma generate` explicito antes del build |
| Resolucion | Agregado script `postinstall: prisma generate` en package.json |

### BUG-002 — Middleware deprecation warning en Next.js 16

| Campo | Valor |
|-------|-------|
| Severidad | P4 (Bajo) |
| Estado | ABIERTO (cosmetico) |
| Descripcion | Warning en consola sobre middleware deprecado en Next.js 16 |
| Impacto | Ninguno funcional, solo warning en logs |
| Plan | Migrar a nuevo sistema "proxy" cuando se estabilice la API |

---

## 5. Pendiente Sprint 2

- Tests e2e con Playwright para flujo completo de encuesta publica
- Tests de rate limiting en endpoint publico
- Tests de exportacion CSV
- Validacion de resultados (conteos, porcentajes)
