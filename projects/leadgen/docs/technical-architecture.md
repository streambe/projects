# Technical Architecture — LeadGen MVP

**Responsables**: Nikola Tesla (Arquitecto) + Linus Torvalds (Lider Tecnico)
**Fecha**: 2026-04-03
**Estado**: PROPOSED — pendiente aprobacion del usuario

---

## 1. Opciones de Stack

### Opcion A: Next.js Fullstack (Monolito)

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 14+ App Router |
| UI | React 18, Tailwind CSS, shadcn/ui |
| Drag & Drop | @dnd-kit/core |
| Estado cliente | React Query (TanStack Query) + Zustand (UI local) |
| Backend | Next.js Route Handlers + Server Actions |
| ORM | Prisma |
| DB + Auth | Supabase (Postgres, Auth, RLS, Realtime) |
| Email | Google Gmail API (OAuth2) |
| Deploy | Vercel |

**Pros**
- Un solo proyecto, un solo deploy, un solo repo. Setup en horas, no dias.
- Server Actions eliminan boilerplate de API para mutaciones simples.
- Supabase Auth resuelve login + roles + OAuth2 de Google en minutos.
- Supabase Realtime permite Kanban colaborativo sin codigo extra.
- Vercel deploy es zero-config para Next.js.
- El equipo GEN tiene skills directos: `vercel/nextjs`, `anthropic/frontend-design`, `supabase/skills`.

**Contras**
- Logica de negocio acoplada al framework Next.js. Migrar a otro framework requiere reescribir Route Handlers.
- Server Actions no son ideales para colas o jobs de larga duracion (outreach sequences).
- Si el backend crece mucho, el monolito puede volverse incomodo. Aceptable para MVP, revisable en v2.

---

### Opcion B: Next.js Frontend + Fastify Backend Separado

| Capa | Tecnologia |
|------|-----------|
| Frontend | Next.js 14 App Router, Tailwind, shadcn/ui |
| Backend | Fastify (Node.js, TypeScript) |
| API | REST JSON, OpenAPI spec |
| ORM | Prisma |
| DB | Supabase Postgres (solo DB, auth en backend) |
| Auth | Auth.js (NextAuth) en frontend + JWT verificado en Fastify |
| Email | Google Gmail API (OAuth2) desde Fastify |
| Queue | BullMQ + Redis (para outreach sequences) |
| Deploy | Vercel (frontend) + Railway o Fly.io (backend) |

**Pros**
- Separacion clara frontend/backend. Backend testeable de forma independiente.
- BullMQ nativo para colas de outreach — mejor modelo para secuencias programadas.
- Backend puede escalar independientemente del frontend.
- Mas facil de auditar por seguridad (superficie de API explicita).

**Contras**
- Dos proyectos, dos deploys, dos pipelines, doble config de CORS/auth.
- Auth distribuida: tokens emitidos en un lado, verificados en otro. Mas superficie de error.
- Setup inicial toma al menos medio dia extra. En un MVP de 3 dias, eso es un 15% del tiempo.
- Railway/Fly.io agrega un proveedor mas, una factura mas, un dashboard mas.
- El equipo necesita coordinar contratos de API antes de paralelizar — overhead en un equipo que es un solo modelo.

---

## 2. Evaluacion Comparativa

| Criterio | Peso | Opcion A (Monolito) | Opcion B (Separado) |
|----------|------|---------------------|---------------------|
| Velocidad de desarrollo | CRITICO | 9/10 | 6/10 |
| Complejidad de setup | ALTO | 9/10 (minima) | 5/10 |
| Deploy en Vercel | ALTO | 10/10 (nativo) | 6/10 (solo frontend) |
| Gmail OAuth2 | MEDIO | 8/10 | 8/10 |
| Kanban drag-drop | MEDIO | 9/10 (igual) | 9/10 (igual) |
| Escalabilidad v2 | BAJO | 6/10 | 8/10 |
| Mantenibilidad | MEDIO | 7/10 | 8/10 |
| **Ponderado** | | **8.4** | **6.7** |

---

## 3. Recomendacion

**Opcion A: Next.js Fullstack.**

Razon principal: el constraint dominante es tiempo (3 dias). La Opcion A elimina toda la friccion de coordinacion, deploy y auth distribuida. La penalizacion en escalabilidad es menor porque este es un tool interno para pocos usuarios, no un SaaS publico.

Para el riesgo de colas/jobs (outreach sequences), la solucion dentro de Opcion A es usar Vercel Cron Functions + Supabase edge functions, o bien agregar un worker minimo en v2 si las secuencias crecen. No justifica duplicar la infra en el MVP.

---

## 4. Stack Detallado (Opcion A)

```
Runtime:        Node.js 20 LTS
Framework:      Next.js 14.2+ (App Router)
Lenguaje:       TypeScript (strict mode)
UI:             React 18, Tailwind CSS 3.4, shadcn/ui
Componentes:    @dnd-kit/core + @dnd-kit/sortable (Kanban)
                recharts (Dashboard)
                react-hook-form + zod (formularios)
Estado:         TanStack Query (server state) + Zustand (UI state)
ORM:            Prisma 5
DB:             Supabase Postgres (managed)
Auth:           Supabase Auth (email + Google OAuth2)
Realtime:       Supabase Realtime (Kanban sync)
Email:          googleapis (Gmail API, OAuth2)
CSV:            papaparse (client-side CSV parsing)
Cron:           Vercel Cron (daily outreach queue trigger)
Linter:         ESLint + Prettier
Testing:        Vitest (unit) + Playwright (e2e criticos)
Deploy:         Vercel (auto-deploy desde GitHub)
```

---

## 5. Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              NEXT.JS APP (App Router)                  │  │
│  │                                                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐           │  │
│  │  │ Dashboard │  │  Kanban  │  │  Outreach │           │  │
│  │  │  Page     │  │  Board   │  │  Manager  │           │  │
│  │  └────┬─────┘  └────┬─────┘  └─────┬─────┘           │  │
│  │       │              │              │                   │  │
│  │  ┌────┴──────────────┴──────────────┴──────┐          │  │
│  │  │         TanStack Query + Zustand        │          │  │
│  │  └────────────────┬────────────────────────┘          │  │
│  │                   │                                    │  │
│  │  ─────────────────┼──────────────────── SSR/RSC ───── │  │
│  │                   │                                    │  │
│  │  ┌────────────────┴────────────────────────┐          │  │
│  │  │       Route Handlers + Server Actions    │          │  │
│  │  │                                          │          │  │
│  │  │  /api/leads      POST,GET,PATCH,DELETE   │          │  │
│  │  │  /api/pipeline   GET,PATCH (stage moves) │          │  │
│  │  │  /api/outreach   POST,GET (sequences)    │          │  │
│  │  │  /api/gmail      OAuth callback, send    │          │  │
│  │  │  /api/import     CSV upload, URL parse   │          │  │
│  │  │  /api/cron       Vercel Cron trigger     │          │  │
│  │  └──────┬───────────────┬──────────────────┘          │  │
│  │         │               │                              │  │
│  └─────────┼───────────────┼──────────────────────────────┘  │
│            │               │                                  │
└────────────┼───────────────┼──────────────────────────────────┘
             │               │
     ┌───────┴───────┐  ┌───┴────────────┐
     │   SUPABASE    │  │  GOOGLE APIs   │
     │               │  │                │
     │  Postgres DB  │  │  Gmail API     │
     │  Auth         │  │  (OAuth2)      │
     │  RLS          │  │                │
     │  Realtime     │  │  People API    │
     │               │  │  (optional v2) │
     └───────────────┘  └────────────────┘
```

---

## 6. Modelo de Deploy

```
GitHub (main branch)
    │
    ▼ push
Vercel (auto-deploy)
    │
    ├── Preview: cada PR genera URL unica
    ├── Staging: branch develop → leadgen-staging.vercel.app
    └── Production: branch main → leadgen.vercel.app

Environment Variables (Vercel Dashboard):
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY
    GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET
    GOOGLE_REDIRECT_URI
    DATABASE_URL (Supabase connection string)

Vercel Cron (vercel.json):
    "crons": [
      { "path": "/api/cron/outreach", "schedule": "0 8 * * *" }
    ]
```

---

## 7. Integraciones

### 7.1 LinkedIn Data Import

La app NO se conecta a LinkedIn API (requiere partnership). En su lugar:

- **Import por URL**: el usuario pega una URL de perfil LinkedIn. La app guarda la URL y el usuario completa datos manualmente, o se usa un servicio de enriquecimiento (Apollo, Clearbit) en v2.
- **Import CSV**: export desde LinkedIn Sales Navigator o herramienta externa. Parse con papaparse, mapeo de columnas, validacion con zod, bulk insert via Prisma.

### 7.2 Gmail API

```
Flujo OAuth2:
1. Usuario clickea "Conectar Gmail"
2. Redirect a Google consent screen (scope: gmail.send, gmail.readonly)
3. Callback a /api/gmail/callback con authorization code
4. Exchange code por access_token + refresh_token
5. Guardar tokens encriptados en Supabase (tabla user_integrations)
6. Envio: POST /api/gmail/send → googleapis.gmail.users.messages.send
7. Tracking: webhook o polling para opens/replies (v2)

Scopes necesarios:
- https://www.googleapis.com/auth/gmail.send
- https://www.googleapis.com/auth/gmail.readonly
```

---

## 8. Estructura de Carpetas

```
projects/leadgen/
├── docs/                          # Documentacion formal
│   ├── technical-architecture.md  # Este archivo
│   ├── functional-specification.md
│   ├── ux-wireframe.md
│   └── ...
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Grupo: login, registro
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/           # Grupo: app autenticada
│   │   │   ├── layout.tsx         # Sidebar + nav
│   │   │   ├── page.tsx           # Dashboard principal
│   │   │   ├── pipeline/page.tsx  # Kanban board
│   │   │   ├── leads/page.tsx     # Lista de leads
│   │   │   ├── leads/[id]/page.tsx
│   │   │   ├── outreach/page.tsx  # Secuencias + templates
│   │   │   ├── import/page.tsx    # CSV + URL import
│   │   │   └── settings/page.tsx  # Gmail connect, perfil
│   │   ├── api/
│   │   │   ├── leads/route.ts
│   │   │   ├── pipeline/route.ts
│   │   │   ├── outreach/route.ts
│   │   │   ├── import/route.ts
│   │   │   ├── gmail/
│   │   │   │   ├── callback/route.ts
│   │   │   │   └── send/route.ts
│   │   │   └── cron/
│   │   │       └── outreach/route.ts
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── kanban/                # KanbanBoard, KanbanColumn, KanbanCard
│   │   ├── leads/                 # LeadCard, LeadDetail, LeadForm
│   │   ├── outreach/              # SequenceBuilder, TemplateEditor
│   │   ├── import/                # CSVUploader, URLImporter
│   │   └── dashboard/             # MetricsCard, Charts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser client
│   │   │   ├── server.ts          # Server client
│   │   │   └── middleware.ts      # Auth middleware
│   │   ├── gmail/
│   │   │   ├── auth.ts            # OAuth2 flow
│   │   │   └── client.ts          # Send/read emails
│   │   ├── scoring.ts             # Lead scoring logic
│   │   └── utils.ts
│   ├── hooks/                     # Custom React hooks
│   ├── stores/                    # Zustand stores
│   ├── types/                     # TypeScript types
│   └── validators/                # Zod schemas
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## 9. ADR-001: Eleccion de Stack

```
# ADR-001: Stack tecnologico para LeadGen MVP
Date: 2026-04-03
Status: Proposed

## Context
LeadGen es un CRM de generacion de leads B2B para uso interno de Streambe.
El MVP debe estar funcional en 3 dias. Usuarios estimados: < 20.
Deploy obligatorio en Vercel. El equipo tiene experiencia en React/Next.js.

## Options Considered

### Option A: Next.js Fullstack (Monolito)
- Pros: setup minimo, deploy trivial, un solo proyecto, Supabase resuelve auth+db+realtime
- Cons: logica acoplada a Next.js, no ideal para jobs de larga duracion

### Option B: Next.js + Fastify separado
- Pros: separacion limpia, BullMQ nativo para colas, backend testeable independiente
- Cons: doble setup, doble deploy, auth distribuida, overhead de coordinacion

## Decision
Option A: Next.js Fullstack con Supabase.

## Rationale
El constraint dominante es tiempo. La Opcion A reduce friccion de setup,
deploy y coordinacion. Los riesgos de acoplamiento son aceptables para una
app interna de pocos usuarios. Si las outreach sequences requieren workers
pesados, se puede extraer un microservicio en v2 sin reescribir el frontend.

## Consequences
- Todo el equipo trabaja en un solo repo y un solo framework.
- Vercel Cron cubre jobs simples; jobs complejos quedan para v2.
- Si la app crece a SaaS publico, habra que evaluar extraer el backend.
```

---

## 10. Proximos Pasos

Pendiente aprobacion del usuario para:
1. Confirmar Opcion A como stack definitivo
2. Proceder con diseno de base de datos (Prisma schema)
3. Proceder con wireframes UX
4. Sprint Planning del MVP

---

*Documento generado por Nikola Tesla (Arquitecto) y Linus Torvalds (Lider Tecnico) — Equipo GEN*
