# GENTICA Platform

Plataforma multi-tenant de desarrollo asistido por el equipo GEN (23 agentes especializados).
Stack: Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn-style UI · Supabase (Auth + Postgres + Storage + RLS) · Anthropic SDK.

## Setup

```bash
npm install
cp .env.example .env.local   # completar con tus claves
npm run dev
```

Abrí http://localhost:3000

## Variables de entorno

Ver `.env.example`. Las claves necesarias son:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — frontend Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — backend, NUNCA exponer
- `ANTHROPIC_API_KEY` — motor GEN
- `RESEND_API_KEY` — notificaciones email
- `CRON_SECRET` — auth para endpoints de Vercel Cron
- `NEXT_PUBLIC_APP_URL` — URL pública del deploy

## Base de datos

Migraciones SQL en `supabase/migrations/`:

- `0001_initial_schema.sql` — tablas, índices y triggers
- `0002_rls_policies.sql` — políticas RLS por tabla

Aplicar contra Supabase local con `supabase db reset` o subir manualmente desde el SQL Editor.

## Estructura

```
src/
├── app/
│   ├── (auth)/login/          # route group de auth
│   ├── (app)/                  # rutas autenticadas
│   │   ├── dashboard/
│   │   ├── projects/[id]/
│   │   ├── admin/users/
│   │   └── billing/
│   ├── api/                    # route handlers
│   ├── layout.tsx              # root + ThemeProvider + Toaster
│   └── page.tsx                # redirect login | dashboard
├── components/
│   ├── ui/                     # shadcn-style primitives
│   └── custom/                 # ProjectStatusBadge, AgentAvatar, ChatMessage, CostMeter, IterationBanner
├── lib/
│   ├── supabase/               # client, server, middleware helpers
│   ├── anthropic/              # gen-engine (TODO Sprint 2)
│   ├── sanitizer/              # output filter del chat
│   └── utils.ts
├── types/
└── middleware.ts               # session refresh

supabase/migrations/             # SQL DDL + RLS
docs/                            # documentación formal del sprint
```

## Documentación

- `docs/acta-constitucion.md`
- `docs/technical-architecture.md` (con 3 ADRs)
- `docs/ux-wireframe.md`

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run format     # prettier
```
