# Arquitectura Tecnica — POC Encuestas Streambe

**Responsable**: Nikola Tesla (Arquitecto de Software) + Linus Torvalds (Lider Tecnico)  
**Fecha**: 2026-04-01  
**Version**: 1.0  
**Estado**: APROBADO

---

## 1. Arquitectura de Aplicacion

Monorepo fullstack basado en **Next.js 16.2.2** con App Router. Toda la aplicacion (frontend, API y ORM) vive en un unico proyecto desplegado en Vercel. La base de datos PostgreSQL esta alojada en Render (free tier).

Este enfoque simplifica el desarrollo, el deploy y la operacion al eliminar la necesidad de coordinar multiples servicios para un POC.

---

## 2. Diagrama de Componentes

```
┌─────────────────────────────────────────────────┐
│                   VERCEL                        │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │           Next.js 16.2.2 App              │  │
│  │                                           │  │
│  │  ┌─────────────────┐  ┌───────────────┐  │  │
│  │  │  React Pages     │  │  API Routes   │  │  │
│  │  │  (App Router)    │  │  /api/*       │  │  │
│  │  │                  │  │               │  │  │
│  │  │  - Login         │  │  - /surveys   │  │  │
│  │  │  - Dashboard     │  │  - /auth      │  │  │
│  │  │  - Survey Editor │  │  - /public    │  │  │
│  │  │  - Results       │  │               │  │  │
│  │  │  - Public Form   │  │               │  │  │
│  │  └─────────────────┘  └───────┬───────┘  │  │
│  │                               │           │  │
│  │                    ┌──────────▼────────┐  │  │
│  │                    │   Prisma 7.6.0    │  │  │
│  │                    │   (ORM)           │  │  │
│  │                    └──────────┬────────┘  │  │
│  └───────────────────────────────┼───────────┘  │
└──────────────────────────────────┼───────────────┘
                                   │
                          ┌────────▼────────┐
                          │  PostgreSQL     │
                          │  (Render)       │
                          │  Free Tier      │
                          └─────────────────┘
```

---

## 3. Stack Tecnologico y Justificacion

| Tecnologia | Version | Justificacion |
|---|---|---|
| **Next.js** | 16.2.2 | Framework fullstack con App Router, SSR, API Routes integradas. Un solo deploy. |
| **TypeScript** | 5.x | Tipado estatico, reduce bugs en desarrollo, mejor DX con autocompletado. |
| **Tailwind CSS** | v4 | Utilidades CSS rapidas, sin configuracion de temas compleja. |
| **shadcn/ui** | latest | Componentes accesibles y personalizables, no agrega dependencia de libreria. |
| **Prisma** | 7.6.0 | ORM con migraciones, tipado generado, compatible con PostgreSQL. |
| **PostgreSQL** | 16 | BD relacional madura, soporte JSON, free tier en Render. |
| **NextAuth.js** | v4 | Autenticacion con provider credentials, sesiones JWT, integracion nativa con Next.js. |
| **Recharts** | 2.x | Graficos declarativos en React para resultados (Sprint 2). |
| **xlsx** | 0.18.x | Exportacion a Excel de respuestas (Sprint 2). |
| **@dnd-kit** | 6.x | Drag and drop accesible para reordenar preguntas en el editor. |
| **Vercel** | - | Deploy automatico por push, preview URLs por branch, zero config para Next.js. |

---

## 4. Estructura de Carpetas

```
projects/encuestas/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   └── surveys/
│   │   │       ├── page.tsx              # Lista de encuestas
│   │   │       ├── new/
│   │   │       │   └── page.tsx          # Crear encuesta
│   │   │       └── [id]/
│   │   │           ├── edit/
│   │   │           │   └── page.tsx      # Editar encuesta
│   │   │           └── results/
│   │   │               └── page.tsx      # Ver resultados
│   │   ├── s/
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Formulario publico
│   │   ├── api/
│   │   │   ├── surveys/
│   │   │   │   └── route.ts              # CRUD surveys
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts          # NextAuth handler
│   │   │   └── public/
│   │   │       └── route.ts              # Endpoints publicos
│   │   ├── layout.tsx
│   │   └── page.tsx                      # Redirect a login/dashboard
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── survey-form.tsx
│   │   ├── question-editor.tsx
│   │   └── results-chart.tsx
│   └── lib/
│       ├── prisma.ts                     # Prisma client singleton
│       ├── auth.ts                       # NextAuth config
│       └── utils.ts
├── docs/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 5. API Routes

| Metodo | Path | Descripcion | Auth |
|---|---|---|---|
| `GET` | `/api/surveys` | Listar encuestas del usuario autenticado | Si |
| `POST` | `/api/surveys` | Crear encuesta con preguntas y opciones | Si |
| `GET` | `/api/surveys/[id]` | Obtener encuesta por ID (con preguntas) | Si |
| `PUT` | `/api/surveys/[id]` | Actualizar encuesta, preguntas y opciones | Si |
| `DELETE` | `/api/surveys/[id]` | Eliminar encuesta (cascade) | Si |
| `PATCH` | `/api/surveys/[id]` | Toggle isActive (publicar/despublicar) | Si |
| `POST` | `/api/auth/[...nextauth]` | Login con credentials | No |
| `GET` | `/api/auth/session` | Obtener sesion actual | No |
| `GET` | `/api/public/surveys/[slug]` | Obtener encuesta publica por slug | No |
| `POST` | `/api/public/surveys/[slug]/responses` | Enviar respuesta a encuesta | No |

---

## 6. Modelo de Datos

### Entidades

```
User (1) ──── (*) Survey (1) ──── (*) Question (1) ──── (*) Option
                      │                    │
                      │                    │
                 (*) Response (1) ──── (*) Answer ────── (1) Question
```

### Modelos

- **User**: id, email (unique), password (bcrypt), name, timestamps
- **Survey**: id, title, description?, slug (unique), isActive, userId (FK), timestamps
- **Question**: id, text, type (enum), isRequired, order, surveyId (FK), timestamp
- **Option**: id, text, order, questionId (FK)
- **Response**: id, surveyId (FK), timestamp
- **Answer**: id, value, responseId (FK), questionId (FK)

### Enum QuestionType

| Valor | Descripcion |
|---|---|
| `TEXT` | Respuesta de texto libre |
| `MULTIPLE_CHOICE` | Seleccion entre opciones predefinidas |
| `SCALE` | Escala numerica (1-5, 1-10) |
| `YES_NO` | Respuesta binaria si/no |

### Cascade Deletes

- Eliminar User -> elimina sus Surveys
- Eliminar Survey -> elimina Questions, Responses
- Eliminar Question -> elimina Options, Answers
- Eliminar Response -> elimina Answers

---

## 7. ADR-001: Monorepo Fullstack Next.js

**Fecha**: 2026-04-01  
**Estado**: ACCEPTED

### Contexto

El proyecto es un POC de encuestas para Streambe. El equipo necesita entregar rapido con minima complejidad operativa. Se evaluo separar frontend y backend vs. usar un monorepo fullstack.

### Opciones Consideradas

**Opcion A: Monorepo Next.js (fullstack)**
- Pros: Un solo deploy, sin CORS, tipado compartido, menor costo operativo
- Cons: Acoplamiento frontend-backend, escalado conjunto

**Opcion B: Frontend Next.js + Backend separado (Express/Fastify)**
- Pros: Escalado independiente, separacion de concerns clara
- Cons: Dos deploys, CORS, duplicacion de tipos, mayor complejidad para un POC

### Decision

Monorepo fullstack Next.js (Opcion A).

### Razon

Para un POC, la simplicidad operativa supera las ventajas de separacion. Si el proyecto escala mas alla del POC, se puede extraer el backend a un servicio independiente sin reescribir la logica (las API Routes ya definen contratos claros).

### Consecuencias

- **Positivas**: Deploy en un click, sin problemas de CORS, tipos compartidos entre frontend y API, menor tiempo de desarrollo.
- **Negativas**: Si el backend necesita escalar independientemente, habra que extraerlo. Aceptable para un POC.

---

## 8. Seguridad

| Control | Implementacion | Estado |
|---|---|---|
| Autenticacion | NextAuth.js v4 con JWT sessions | Implementado |
| Hashing de passwords | bcrypt con salt rounds | Implementado |
| Proteccion de rutas | Middleware Next.js en rutas (dashboard) | Implementado |
| Ownership validation | Cada API verifica que el survey pertenece al usuario | Implementado |
| HTTPS | Forzado por Vercel en todos los ambientes | Activo |
| Variables de entorno | Secrets en Vercel env, no hardcodeados | Activo |
| Rate limiting | Pendiente (Sprint 2) | Pendiente |
| Input validation | Validacion basica en API routes | Implementado |
| CSRF | Proteccion nativa de NextAuth | Activo |

### Riesgos Aceptados (POC)

- Sin rate limiting en endpoints publicos (mitigacion: Vercel tiene proteccion basica contra DDoS).
- Sin validacion exhaustiva con Zod (se agrega en Sprint 2 si el POC avanza).
- Sin audit logging (no requerido para POC).
