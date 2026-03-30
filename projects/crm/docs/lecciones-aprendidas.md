# Lecciones Aprendidas — CRM Ciudad Moto

**Proyecto**: CRM Ciudad Moto
**Fecha**: 2026-03-30
**Sprints**: 1–4 + Deploy

---

## 1. Deploy en Vercel (Frontend)

### SPA Routing — vercel.json obligatorio
**Problema**: Vercel devuelve 404 en todas las rutas que no sean `/` porque busca archivos estáticos.
**Solución**: Crear `vercel.json` en la raíz del frontend ANTES del primer deploy:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
**Regla**: Todo proyecto SPA (React, Vue, Angular) necesita este archivo desde el día 1.

### Variables de entorno VITE_
**Problema**: La env var se guardó con el formato `VITE_API_URL=https://...` como valor (incluyendo el nombre de la variable), generando una URL relativa inválida.
**Solución**: Al usar `vercel env add`, el valor debe ser SOLO la URL, sin el nombre de la variable:
```bash
# CORRECTO:
vercel env add VITE_API_URL production --value "https://mi-api.onrender.com/api/v1" --yes

# INCORRECTO (el nombre queda como parte del valor):
echo "VITE_API_URL=https://..." | vercel env add VITE_API_URL production
```
**Regla**: Siempre verificar con `vercel env ls` y luego buscar la URL en el bundle compilado:
```bash
curl -s https://mi-frontend.vercel.app/assets/index-*.js | grep -o 'mi-api[^"]*'
```

### Build cache puede ocultar cambios en env vars
**Problema**: Vercel cachea builds anteriores. Si agregás una env var nueva, el build cacheado no la incluye.
**Solución**: Usar `--force` para forzar rebuild sin cache:
```bash
vercel deploy --prod --yes --force
```

---

## 2. Deploy en Render (Backend + PostgreSQL)

### render.yaml debe estar en la raíz del repo
**Problema**: Render busca `render.yaml` en la raíz del repositorio, no dentro de subcarpetas.
**Solución**: Siempre colocar `render.yaml` en la raíz, sin importar dónde esté el código del backend. Usar `rootDir` para apuntar al subdirectorio:
```yaml
services:
  - type: web
    rootDir: projects/crm/backend
```

### Prisma: usar `db push` si no hay migraciones
**Problema**: `prisma migrate deploy` no hace nada si no existen archivos de migración en `prisma/migrations/`. Las tablas nunca se crean.
**Solución**: Para proyectos nuevos sin migraciones generadas, usar `prisma db push`:
```yaml
startCommand: npx prisma db push --accept-data-loss && node dist/server.js
```
**Regla**: Para producción real, generar migraciones con `prisma migrate dev` localmente y commitearlas. `db push` es para prototipos y demos.

### Seed: usar JavaScript puro, no TypeScript
**Problema**: `tsx` es una devDependency. En producción, `npm ci` no la instala (o `npm ci --include=dev` agrega peso innecesario). El seed falla silenciosamente si usa `npx tsx prisma/seed.ts`.
**Solución**: Crear `prisma/seed.js` con `require()` (CommonJS) que funciona con `node` directamente:
```javascript
// prisma/seed.js — NO necesita compilación
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
// ...
```
```json
// package.json
"prisma": {
  "seed": "node prisma/seed.js"
}
```
**Regla**: Los scripts de seed y utilidades de infraestructura deben ser `.js` puro, nunca `.ts` que dependa de herramientas de compilación en runtime.

### Seed debe ser idempotente
**Problema**: Si el seed se ejecuta más de una vez (re-deploys), puede fallar por duplicados.
**Solución**: Siempre verificar existencia antes de crear:
```javascript
const existing = await prisma.user.findUnique({ where: { email } });
if (!existing) { /* crear */ }
```
Y hacer el seed resiliente en el startCommand:
```yaml
startCommand: npx prisma db push && (node prisma/seed.js || echo "Seed skipped") && node dist/server.js
```

---

## 3. Autenticación Cross-Origin (Frontend ↔ Backend en dominios distintos)

### CORS debe configurarse con la URL exacta del frontend
**Problema**: Si `CORS_ORIGIN` no coincide exactamente con el dominio del frontend, las requests fallan silenciosamente.
**Solución**: Usar variable de entorno para CORS origin:
```typescript
await app.register(fastifyCors, {
  origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
  credentials: true,
});
```
**Verificación**: Testear el preflight manualmente:
```bash
curl -s -D - -X OPTIONS https://backend/api/v1/auth/login \
  -H "Origin: https://frontend-url" \
  -H "Access-Control-Request-Method: POST"
# Debe devolver: access-control-allow-origin: https://frontend-url
# Y: access-control-allow-credentials: true
```

### Cookies SameSite=Strict no funcionan cross-origin
**Problema**: Con `sameSite: 'strict'`, el browser NO envía cookies a dominios diferentes. El refresh token nunca llega al backend.
**Nota**: En este proyecto no bloqueó el login (que no necesita cookie), pero el silent refresh en recargas de página no funciona cross-origin con `strict`. Para producción con dominios diferentes, usar `sameSite: 'none'` + `secure: true`, o usar un proxy reverso para que frontend y backend compartan dominio.

### El endpoint /auth/refresh debe devolver datos del usuario
**Problema**: Si `/auth/refresh` solo devuelve `{ accessToken }`, después de un refresh silencioso el frontend no sabe quién es el usuario.
**Solución**: Siempre devolver `{ accessToken, user }` en el refresh:
```typescript
return reply.code(200).send({
  accessToken,
  user: { id: decoded.sub, email: decoded.email, fullName: decoded.fullName },
});
```

### Token en memoria, NUNCA en localStorage
**Regla**: El access token se guarda en una variable/ref de React, nunca en localStorage ni sessionStorage. Se pierde al cerrar la pestaña — eso es intencional (seguridad). La persistencia de sesión se maneja con el refresh token en HttpOnly cookie.

---

## 4. Bugs Recurrentes en el Código

### Frontend hooks que usan el método HTTP incorrecto
**Problema recurrente**: Hooks que usan `api.patch()` pero el backend solo tiene `PUT`. Zod en el backend hace `safeParse` y silenciosamente descarta campos no definidos en el schema, haciendo que la operación "funcione" pero no haga nada.
**Ejemplos**:
- `useMarkActivityDone`: usaba PATCH, el backend tiene PUT `/activities/:id/complete`
- `useChangeStage`: usaba PATCH, el backend tiene PUT `/opportunities/:id/stage`
**Regla**: Al crear un hook de mutación, siempre verificar el método HTTP exacto en el archivo de rutas del backend.

### Frontend hooks que llaman endpoints incorrectos
**Problema recurrente**: Hooks que inventan endpoints con query params cuando el backend tiene rutas anidadas.
**Ejemplos**:
- `useClientMessages`: llamaba `/communications?clientId=...` → correcto: `/clients/:id/messages`
- `useClientActivities`: llamaba `/activities?clientId=...` → correcto: `/clients/:id/activities`
**Regla**: Los hooks del frontend deben mapear 1:1 con las rutas del backend. Verificar en `*.routes.ts` antes de escribir el hook.

### Enums desalineados entre frontend y backend
**Problema**: El frontend definía `CommDirection` como `sent/received` pero Prisma almacena `outbound/inbound`.
**Regla**: Los tipos del frontend deben derivarse del schema de Prisma, no inventarse independientemente. Ante la duda, verificar el schema.prisma.

### Reportes sin filtros correctos
**Problema**: Los reportes incluían datos que no correspondían (clientes eliminados lógicamente, actividades pendientes en reporte de "realizadas").
**Regla**: Todo query de reportes debe inicializar el `where` con los filtros base:
```typescript
const where: Prisma.XWhereInput = { isActive: true }; // o status: 'realizada', etc.
```

---

## 5. TypeScript / Build

### vite.config.ts con Vitest necesita la referencia de tipos
**Problema**: `vite.config.ts` con la propiedad `test` da error TS2769 porque `defineConfig` de Vite no conoce ese campo.
**Solución**: Agregar la referencia al inicio del archivo:
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
```

### `tsc -b --noEmit` falla con project references
**Problema**: `tsconfig.json` con `references` a `tsconfig.node.json` (que tiene `composite: true`) no es compatible con `--noEmit` en build mode.
**Solución**: Para CI usar `tsc --noEmit` (sin `-b`). Para el build de Vite, tsc se ejecuta sin `-b` automáticamente.

---

## 6. Proceso / Metodología

### QA debe ejecutarse POR TAREA, no al final del sprint
**Lección**: Esperar al final del sprint para QA genera acumulación de bugs que son más costosos de arreglar. El tester debe ejecutar su plan de tests en paralelo con el desarrollo, tarea por tarea.

### Code Review es gate obligatorio antes de cada commit
**Lección**: Sin code review, pasan bugs como métodos HTTP incorrectos, endpoints mal referenciados, y enums desalineados. El Líder Técnico debe revisar antes del merge.

### La auditoría de seguridad debe ser por sprint, no opcional
**Lección**: Bugs de seguridad como endpoints sin autenticación (`/register` sin `preHandler`) pasan desapercibidos sin auditoría formal. El entregable es un .docx con pruebas y veredicto.

### El módulo de auth del frontend NO es opcional
**Lección**: Debe implementarse en el Sprint 1, no como "después". Sin AuthContext, LoginPage y ProtectedRoute, las rutas quedan abiertas y el deploy público expone toda la app sin login.

---

## 7. Checklist Pre-Deploy

Antes de deployar cualquier proyecto, verificar:

- [ ] `vercel.json` con rewrites para SPA
- [ ] `render.yaml` en la raíz del repo
- [ ] Migraciones o `db push` configurado
- [ ] Seed en `.js` puro (no `.ts`)
- [ ] Seed idempotente (verifica existencia antes de crear)
- [ ] `VITE_API_URL` como env var en Vercel (solo el valor, sin el nombre)
- [ ] `CORS_ORIGIN` en el backend apuntando al frontend
- [ ] `withCredentials: true` en axios
- [ ] Cookie `sameSite` compatible con cross-origin si aplica
- [ ] `/auth/refresh` devuelve `user` además del token
- [ ] Auth module completo: AuthContext + LoginPage + ProtectedRoute
- [ ] Build limpio: `tsc --noEmit` + `vite build` sin errores
- [ ] `--force` en el primer deploy para evitar cache
