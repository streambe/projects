---
name: "Supabase y Vercel — credenciales y proceso de deploy"
type: reference
tags: [gen/reference, gen/workflow, gen/docs]
created: "2026-04-04"
updated: "2026-04-04"
related: [[deployment-docs]]
---

# Supabase y Vercel — Deploy de proyectos GEN

## Supabase

- **Dashboard**: https://supabase.com/dashboard
- **Cuenta**: stgugliotta@gmail.com
- **Región preferida**: South America (São Paulo) — `sa-east-1`
- **Crear usuario via API** (no requiere MCP): usar service_role key con curl a `/auth/v1/admin/users`

### Credenciales por proyecto

| Proyecto | Project Ref | URL |
|----------|------------|-----|
| LeadGen  | dsegzvsgyxvfdgnguayk | https://dsegzvsgyxvfdgnguayk.supabase.co |

### Connection strings
- **Pooler (runtime)**: `postgresql://postgres.[ref]:[pass]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- **Directa (migrations/seed)**: `postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres`
- IMPORTANTE: El pooler da "Tenant or user not found" para migrations y seed. Siempre usar DIRECT_URL para Prisma db push y seeds.

### Prisma v7 gotchas
- No se puede poner `url` ni `directUrl` en schema.prisma — va en `prisma.config.ts`
- Seed scripts necesitan `import "dotenv/config"` explícito
- Seed scripts deben usar `DIRECT_URL`, no `DATABASE_URL`

## Vercel

- **Dashboard**: https://vercel.com
- **Cuenta**: stgugliotta@gmail.com
- **Proceso**: Import Git repo → set Root Directory → set env vars → Deploy
- **Root Directory**: siempre `projects/[nombre]/app`
- **Framework**: Next.js (auto-detect)
- **Env vars necesarias**: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL

## How to apply

Cuando un proyecto necesite deploy:
1. NO preguntar si el usuario tiene Supabase/Vercel — ya los tiene
2. Crear proyecto en Supabase vía API si es posible, sino guiar con pasos mínimos
3. Crear usuario auth vía API con service_role key (no necesita ir al dashboard)
4. Usar DIRECT_URL para migrations/seed, DATABASE_URL para runtime
5. Verificar build + tests ANTES de push
