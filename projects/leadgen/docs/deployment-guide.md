# Deployment Guide - LeadGen

**Responsable**: Tim Berners-Lee (Fullstack Developer) + Carl Sagan (Cloud) + Margaret Hamilton (DevOps)
**Fecha**: 2026-04-03
**Stack**: Next.js 16 + Prisma 7 + Supabase (PostgreSQL + Auth) + Vercel

---

## Paso 1: Crear proyecto en Supabase

1. Ir a https://supabase.com/dashboard
2. **New Project**:
   - Nombre: `leadgen`
   - Password: generar una segura (guardarla, se usa en CONNECTION STRING)
   - Region: **South America (Sao Paulo)** — `sa-east-1`
3. Esperar que el proyecto se cree (1-2 minutos)
4. Ir a **Settings > API** y copiar:
   - **Project URL** → sera `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → sera `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → sera `SUPABASE_SERVICE_ROLE_KEY`
5. Ir a **Settings > Database > Connection string**:
   - **Transaction mode (port 6543)** → sera `DATABASE_URL` (agregar `?pgbouncer=true` al final)
   - **Session mode (port 5432)** → sera `DIRECT_URL`

> Las connection strings de Supabase tienen el formato:
> `postgresql://postgres.[project-ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:[port]/postgres`

---

## Paso 2: Configurar .env local

```bash
cd projects/leadgen/app
cp .env.example .env
```

Editar `.env` con los valores copiados de Supabase:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.xxxx:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxx:[password]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## Paso 3: Ejecutar migraciones y seed

```bash
cd projects/leadgen/app

# Crear/sincronizar tablas en la base de datos
npx prisma db push

# Cargar datos iniciales (templates de mensajes + secuencias)
npx tsx prisma/seed.ts
```

Verificar que no haya errores. El seed es idempotente: si ya existen los registros, los saltea.

---

## Paso 4: Crear usuario en Supabase Auth

1. Ir al dashboard de Supabase > **Authentication > Users**
2. Click **Add User > Create new user**
3. Ingresar email y password del primer admin
4. Copiar el **User UID** que se genera

---

## Paso 5: Crear registro de usuario en la DB

Ejecutar en **Supabase > SQL Editor**:

```sql
INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES (
  'uuid-del-user-de-supabase',  -- pegar el UID del paso anterior
  'email@streambe.com',
  'Gaston',
  'ADMIN',
  NOW(),
  NOW()
);
```

> El `id` del User DEBE coincidir con el UUID del usuario en Supabase Auth.

---

## Paso 6: Deploy a Vercel

1. Ir a https://vercel.com/new
2. **Import Git Repository** → seleccionar el repositorio
3. Configurar:
   - **Root Directory**: `projects/leadgen/app`
   - **Framework Preset**: Next.js (autodetectado)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
4. **Environment Variables** — agregar TODAS:
   | Variable | Valor |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` |
   | `DATABASE_URL` | `postgresql://...?pgbouncer=true` |
   | `DIRECT_URL` | `postgresql://...:5432/postgres` |
5. Click **Deploy**

---

## Paso 7: Verificar

1. Abrir la URL de Vercel generada
2. Login con las credenciales creadas en el paso 4
3. Verificar:
   - [ ] Dashboard carga correctamente
   - [ ] Pipeline muestra los stages
   - [ ] Templates de mensajes aparecen (6 templates)
   - [ ] Secuencias aparecen (2 secuencias con sus pasos)
   - [ ] Se pueden crear leads

---

## Troubleshooting

### Error "relation does not exist"
Las migraciones no se ejecutaron. Correr `npx prisma db push` con `DIRECT_URL` configurado.

### Error de conexion a la DB en Vercel
Verificar que `DATABASE_URL` tenga `?pgbouncer=true` y que `DIRECT_URL` apunte al puerto 5432.

### Login no funciona
Verificar que el usuario existe tanto en Supabase Auth como en la tabla `User` con el mismo UUID.

### Build falla en Vercel
Verificar que el Root Directory sea `projects/leadgen/app` y que todas las env vars esten configuradas.

---

## URLs

| Ambiente | URL |
|----------|-----|
| Produccion | (pendiente post-deploy) |
| Supabase Dashboard | https://supabase.com/dashboard/project/[project-ref] |
| Vercel Dashboard | https://vercel.com/[team]/leadgen |

---

## Checklist pre-deploy

- [ ] `.env` con todas las variables configuradas
- [ ] `npx prisma db push` ejecutado sin errores
- [ ] `npx tsx prisma/seed.ts` ejecutado sin errores
- [ ] Usuario creado en Supabase Auth
- [ ] Registro de User en la DB con UUID correcto
- [ ] `npm run build` pasa sin errores
- [ ] Environment variables cargadas en Vercel
