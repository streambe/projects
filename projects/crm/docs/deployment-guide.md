# Guia de Deployment — CRM Ciudad Moto

**Proyecto**: CRM Ciudad Moto
**Fecha**: 2026-03-30
**URLs de produccion**:
- Frontend: https://frontend-two-mu-94.vercel.app
- Backend: https://ciudadmoto-api.onrender.com
- Health check: https://ciudadmoto-api.onrender.com/health

---

## Arquitectura de Deploy

```
[Vercel]                          [Render]
Frontend (React SPA)  ──API──►  Backend (Fastify + Node.js)
                                     │
                                     ├──► PostgreSQL (Render managed)
                                     └──► Redis (Docker / no deploy aun)
```

- **Frontend**: Vercel (build: `tsc && vite build`)
- **Backend**: Render Web Service (Docker o Node.js native)
- **Base de datos**: PostgreSQL en Render (free tier)
- **Repositorio**: https://github.com/streambe/projects.git
- **Branch**: `project-crm`

---

## 1. Backend — Render

### 1.1 Configuracion inicial (una sola vez)

1. **render.yaml** debe estar en la raiz del repositorio (NO dentro de la carpeta del proyecto):
   - Path: `/render.yaml`
   - Contenido actual:

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
    buildCommand: npm ci --include=dev && npx prisma generate && npm run build
    startCommand: npx prisma db push --accept-data-loss && (node prisma/seed.js || echo "Seed skipped") && node dist/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3000"
      - key: DATABASE_URL
        fromDatabase:
          name: ciudadmoto-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: CORS_ORIGIN
        value: https://frontend-two-mu-94.vercel.app
```

2. **En Render Dashboard** (https://dashboard.render.com):
   - New > Blueprint > Conectar repo `streambe/projects`
   - Render lee `render.yaml` y crea el servicio + la DB automaticamente
   - Verificar que el branch este seteado a `project-crm`

3. **Variables de entorno** (se generan automaticamente desde render.yaml):
   - `DATABASE_URL`: auto-generada desde la DB de Render
   - `JWT_SECRET`: auto-generada
   - `JWT_REFRESH_SECRET`: auto-generada
   - `CORS_ORIGIN`: URL exacta del frontend en Vercel
   - `NODE_ENV`: production
   - `PORT`: 3000

### 1.2 Que sucede en cada deploy

```
npm ci --include=dev          # Instala dependencias (incluyendo dev para tsc)
npx prisma generate           # Genera el Prisma Client
npm run build                 # Compila TypeScript (tsc)
npx prisma db push            # Sincroniza schema con la DB (sin migraciones)
node prisma/seed.js           # Seed idempotente (crea usuario admin si no existe)
node dist/server.js           # Arranca el servidor Fastify
```

### 1.3 Redeploy manual

```bash
# Desde Render Dashboard: Manual Deploy > Deploy latest commit
# O forzar con push:
git push origin project-crm
```

### 1.4 Verificar que funciona

```bash
curl https://ciudadmoto-api.onrender.com/health
# Respuesta esperada: {"status":"ok"}
```

### 1.5 Notas importantes

- **Free tier de Render**: el servicio se duerme despues de 15 min sin trafico. La primera request tarda ~30 segundos en despertar.
- **prisma db push**: NO usa migraciones. Para produccion real, usar `prisma migrate deploy` con migraciones commiteadas.
- **Seed en .js**: el seed es `prisma/seed.js` (JavaScript puro), no TypeScript, para no depender de tsx en produccion.
- **Seed idempotente**: verifica existencia antes de crear, puede ejecutarse multiples veces sin error.

---

## 2. Frontend — Vercel

### 2.1 Configuracion inicial (una sola vez)

1. **vercel.json** en la raiz del frontend (`projects/crm/frontend/vercel.json`):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Esto es obligatorio para SPA routing (React Router). Sin esto, cualquier ruta que no sea `/` devuelve 404.

2. **Linkear el proyecto con Vercel**:

```bash
cd projects/crm/frontend
npx vercel link
# Seleccionar el scope y proyecto existente, o crear uno nuevo
```

3. **Variable de entorno en Vercel**:

```bash
npx vercel env add VITE_API_URL production
# Valor: https://ciudadmoto-api.onrender.com/api/v1
# IMPORTANTE: solo el valor, sin el nombre de la variable
```

Verificar:
```bash
npx vercel env ls
# Debe mostrar: VITE_API_URL    Encrypted    Production
```

### 2.2 Deploy a produccion

```bash
cd projects/crm/frontend
npx vercel --prod
```

Output esperado:
```
Building...
tsc && vite build
built in ~4s
Production: https://frontend-xxx.vercel.app
```

### 2.3 Deploy forzado (sin cache)

Si cambiaste variables de entorno o necesitas un build limpio:

```bash
npx vercel --prod --force
```

### 2.4 Verificar que funciona

1. Abrir https://frontend-two-mu-94.vercel.app
2. Debe mostrar la pagina de login con branding Ciudad Moto
3. Verificar en DevTools > Network que las requests van a `ciudadmoto-api.onrender.com`

### 2.5 Notas importantes

- **Vercel no autodeploya** desde el branch `project-crm` — el auto-deploy esta configurado solo para `master`. Hay que hacer `npx vercel --prod` manualmente.
- **VITE_ prefix**: solo las env vars que empiezan con `VITE_` son accesibles en el frontend. Esto es por diseno de Vite.
- **Build cache**: Vercel cachea builds. Si un cambio de env var no toma efecto, usar `--force`.

---

## 3. Flujo completo de deploy (paso a paso)

```bash
# 1. Verificar que compila
cd projects/crm/frontend && npx tsc --noEmit
cd projects/crm/backend && npx tsc --noEmit

# 2. Build local de prueba
cd projects/crm/frontend && npx vite build

# 3. Commit y push
cd /ruta/al/repo
git add .
git commit -m "feat(crm): descripcion del cambio"
git push origin project-crm

# 4. Backend se redeploya automaticamente en Render
# Verificar en: https://dashboard.render.com
# Health check: curl https://ciudadmoto-api.onrender.com/health

# 5. Frontend — deploy manual a Vercel
cd projects/crm/frontend
npx vercel --prod

# 6. Verificar
# Frontend: https://frontend-two-mu-94.vercel.app
# Backend: https://ciudadmoto-api.onrender.com/health
```

---

## 4. Troubleshooting

| Problema | Solucion |
|----------|----------|
| Frontend 404 en rutas | Verificar que `vercel.json` con rewrites existe |
| API devuelve CORS error | Verificar `CORS_ORIGIN` en Render = URL exacta de Vercel |
| Login no funciona | Verificar `VITE_API_URL` en Vercel apunta al backend correcto |
| Backend tarda 30s en responder | Normal en Render free tier (cold start), esperar |
| Seed falla | Verificar que `prisma/seed.js` existe (no .ts) |
| DB schema desactualizado | Render ejecuta `prisma db push` en cada deploy |
| Cambio de env var no toma efecto | Usar `npx vercel --prod --force` |
| Build cache viejo | `npx vercel --prod --force` |

---

## 5. URLs y Accesos

| Recurso | URL |
|---------|-----|
| Frontend produccion | https://frontend-two-mu-94.vercel.app |
| Backend API | https://ciudadmoto-api.onrender.com/api/v1 |
| Health check | https://ciudadmoto-api.onrender.com/health |
| Render Dashboard | https://dashboard.render.com |
| Vercel Dashboard | https://vercel.com/gastongugliotta-7454s-projects/frontend |
| Repositorio | https://github.com/streambe/projects |
| Branch | project-crm |
