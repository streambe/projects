# Plan de Trabajo — LeadGen MVP

**Proyecto**: LeadGen - Generacion de Leads B2B via LinkedIn
**PM**: Alan Turing
**Fecha**: 2026-04-03
**Sprint**: 1 (unico sprint intensivo)
**Timeline**: 2026-04-04 al 2026-04-06 (3 dias)
**Estado**: Pendiente aprobacion del usuario

---

## 1. Sprint Goal

> Entregar un MVP funcional de LeadGen desplegado en Vercel que permita: autenticarse con roles, gestionar leads en un pipeline Kanban con drag & drop, importar leads por CSV y URL LinkedIn, crear templates de outreach con variables, scoring automatico basico, y un dashboard con metricas clave.

---

## 2. Epicas y Stories

### EPIC-1: Auth & Setup (8 SP)

| ID | Story | SP | Prioridad |
|----|-------|----|-----------|
| US-001 | Como usuario quiero registrarme e iniciar sesion con email/password via Supabase Auth | 3 | P1 |
| US-002 | Como admin quiero asignar roles (marketing/comercial) a los usuarios | 2 | P1 |
| US-003 | Como dev quiero el proyecto Next.js 14 inicializado con Supabase, Prisma, Tailwind, shadcn/ui y deploy en Vercel | 3 | P1 |

### EPIC-2: CRM Pipeline Kanban (13 SP)

| ID | Story | SP | Prioridad |
|----|-------|----|-----------|
| US-004 | Como comercial quiero ver mis leads organizados en un tablero Kanban con etapas configurables | 5 | P1 |
| US-005 | Como comercial quiero mover leads entre etapas con drag & drop (@dnd-kit) | 3 | P1 |
| US-006 | Como comercial quiero ver el detalle de un lead (nombre, empresa, cargo, LinkedIn, email, notas) | 3 | P1 |
| US-007 | Como comercial quiero crear y editar leads manualmente | 2 | P1 |

### EPIC-3: Import de Leads (8 SP)

| ID | Story | SP | Prioridad |
|----|-------|----|-----------|
| US-008 | Como usuario quiero importar leads desde un archivo CSV con mapeo de columnas | 5 | P1 |
| US-009 | Como usuario quiero importar un lead pegando una URL de perfil LinkedIn (scraping basico de datos publicos) | 3 | P2 |

### EPIC-4: Outreach & Templates (8 SP)

| ID | Story | SP | Prioridad |
|----|-------|----|-----------|
| US-010 | Como marketing quiero crear templates de mensaje con variables (nombre, empresa, cargo) | 3 | P1 |
| US-011 | Como marketing quiero crear secuencias de outreach (serie de mensajes con delays) | 3 | P2 |
| US-012 | Como comercial quiero ver mi cola de acciones diarias (a quien contactar hoy) | 2 | P2 |

### EPIC-5: Scoring (5 SP)

| ID | Story | SP | Prioridad |
|----|-------|----|-----------|
| US-013 | Como usuario quiero que cada lead tenga un score calculado automaticamente segun completitud de datos y actividad | 3 | P2 |
| US-014 | Como usuario quiero ver los leads ordenados por score en el pipeline | 2 | P2 |

### EPIC-6: Dashboard (5 SP)

| ID | Story | SP | Prioridad |
|----|-------|----|-----------|
| US-015 | Como usuario quiero un dashboard con metricas: total leads, leads por etapa, tasa de conversion, leads importados esta semana | 3 | P2 |
| US-016 | Como usuario quiero ver graficos de evolucion del pipeline en el tiempo | 2 | P3 |

### Resumen de Story Points

| Epica | SP | Prioridad dominante |
|-------|----|---------------------|
| EPIC-1: Auth & Setup | 8 | P1 |
| EPIC-2: CRM Pipeline | 13 | P1 |
| EPIC-3: Import | 8 | P1-P2 |
| EPIC-4: Outreach | 8 | P1-P2 |
| EPIC-5: Scoring | 5 | P2 |
| EPIC-6: Dashboard | 5 | P2 |
| **TOTAL** | **47** | |

---

## 3. Asignacion de Tareas y Paralelismo

### Equipo core para el sprint

| Agente | Rol | Asignacion |
|--------|-----|------------|
| Nikola Tesla | Arquitecto | Schema Prisma, estructura del proyecto, ADRs |
| Linus Torvalds | Lider Tecnico | Code review, estandares, resolver bloqueos |
| Grace Hopper | Frontend 1 | EPIC-2: Pipeline Kanban + drag & drop |
| Katherine Johnson | Frontend 2 | EPIC-4: Templates + cola de acciones |
| Emmy Noether | Frontend 3 | EPIC-6: Dashboard + EPIC-5: UI scoring |
| Alan Kay | Backend 1 | EPIC-2: API leads/pipeline + EPIC-1: Auth |
| John von Neumann | Backend 2 | EPIC-3: Import CSV + LinkedIn |
| Blaise Pascal | Backend 3 | EPIC-4: API outreach + EPIC-5: Scoring engine |
| Leonardo Da Vinci | UX | Wireframes rapidos, sistema de componentes |
| Richard Feynman | QA Lead | Testing E2E flujos criticos |
| Margaret Hamilton | DevOps | CI/CD Vercel, variables de entorno |
| Hedy Lamarr | Seguridad | Validacion de inputs, auth, RLS Supabase |

### Mapa de dependencias

```
US-003 (Setup) ──┬──> US-001 (Auth) ──> US-002 (Roles)
                 │
                 ├──> US-004 (Kanban) ──> US-005 (DnD) ──> US-006 (Detalle) ──> US-007 (CRUD)
                 │
                 ├──> US-008 (CSV Import)
                 │    US-009 (LinkedIn Import)
                 │
                 ├──> US-010 (Templates) ──> US-011 (Secuencias) ──> US-012 (Cola)
                 │
                 ├──> US-013 (Scoring) ──> US-014 (Orden por score)
                 │
                 └──> US-015 (Dashboard) ──> US-016 (Graficos)
```

### Paralelismo posible

- **Paralelo A**: Auth (Alan Kay) + Kanban UI (Grace Hopper) + Schema Prisma (Tesla) — dia 1
- **Paralelo B**: Import CSV (von Neumann) + Templates UI (Katherine) + Dashboard UI (Emmy) — dia 1-2
- **Paralelo C**: Scoring engine (Pascal) + LinkedIn import (von Neumann) + Secuencias (Pascal) — dia 2
- **Paralelo D**: QA de flujos criticos + Security review + Deploy — dia 3

---

## 4. Timeline Dia por Dia

### Dia 1 — 2026-04-04: Fundaciones + Core

**Manana**
- Tesla: Schema Prisma completo (leads, stages, templates, sequences, scores) + setup proyecto
- Hamilton: Deploy inicial en Vercel, CI basico, variables Supabase
- Alan Kay: Supabase Auth + middleware de sesion + RLS policies
- Da Vinci: Sistema de componentes base con shadcn/ui, layout principal

**Tarde**
- Grace Hopper: Pipeline Kanban con columnas y cards (mock data) + drag & drop con @dnd-kit
- Alan Kay: CRUD API de leads y stages (Prisma + API routes)
- von Neumann: Import CSV — parser + mapeo de columnas + API
- Katherine: CRUD de templates con editor de variables

**Entregable dia 1**: Auth funcional, Kanban con DnD (conectado a API), import CSV basico, templates CRUD

### Dia 2 — 2026-04-05: Features Completos

**Manana**
- Grace Hopper: Detalle de lead (side panel o modal) + edicion inline
- von Neumann: Import LinkedIn (scraping datos publicos de perfil)
- Pascal: Scoring engine (calculo automatico) + API
- Katherine: Secuencias de outreach (crear serie de pasos con delays)

**Tarde**
- Emmy: Dashboard — metricas agregadas + graficos (recharts o similar)
- Pascal: Cola de acciones diarias (query leads pendientes de contactar hoy)
- Grace Hopper: Ordenamiento por score en el pipeline, filtros basicos
- Feynman: Comienza testing E2E de auth + kanban + import

**Entregable dia 2**: Todas las features funcionales, scoring activo, dashboard con datos reales

### Dia 3 — 2026-04-06: QA + Pulido + Deploy

**Manana**
- Feynman + Bohr: Testing intensivo de todos los flujos
- Lamarr: Auditoria de seguridad (auth, inputs, RLS, secrets)
- Torvalds: Code review final, fix de tech debt critico
- Todos los devs: Fix de bugs P1/P2 reportados por QA

**Tarde**
- Hamilton: Deploy a produccion en Vercel
- Todos: Smoke testing en produccion
- Turing: Documentacion de cierre, retrospectiva

**Entregable dia 3**: MVP desplegado en produccion, testeado, documentado

---

## 5. Riesgos

| # | Riesgo | Prob | Impacto | Mitigacion | Contingencia | Owner |
|---|--------|------|---------|------------|--------------|-------|
| R1 | Scraping LinkedIn bloqueado o inestable | Alta | Medio | Usar datos publicos minimos, no automatizar requests masivos | Diferir US-009 a v2, priorizar CSV | von Neumann |
| R2 | 47 SP en 3 dias es agresivo — posible carryover | Alta | Alto | Priorizar P1 sobre P2, cortar scope temprano dia 2 si hay retraso | Diferir US-011, US-012, US-016 a v2 | Turing |
| R3 | Drag & drop con @dnd-kit tiene edge cases complejos (reorder + cross-column) | Media | Alto | Grace Hopper tiene experiencia, usar ejemplos oficiales de @dnd-kit | Simplificar a botones de mover si DnD falla | Grace Hopper |
| R4 | RLS policies de Supabase mal configuradas exponen datos entre usuarios | Media | Critico | Lamarr revisa policies dia 1, tests de aislamiento | Bloquear deploy hasta fix | Lamarr |
| R5 | Integracion Prisma + Supabase tiene fricciones conocidas con tipos y migraciones | Media | Medio | Tesla configura dia 1 con migraciones probadas | Usar Supabase client directo si Prisma falla | Tesla |

### Scope de corte si hay retraso (en orden de sacrificio)

1. US-016: Graficos de evolucion (P3) — reemplazar con tabla simple
2. US-011: Secuencias de outreach — dejar solo templates simples
3. US-012: Cola de acciones diarias — diferir a v2
4. US-009: Import LinkedIn — dejar solo CSV
5. US-014: Orden por score — mantener score visible pero sin sort

---

## 6. Criterios de Exito del MVP

El MVP se considera **listo** cuando:

- [ ] Un usuario puede registrarse, loguearse y tener rol asignado
- [ ] El pipeline Kanban muestra leads en columnas y permite drag & drop entre etapas
- [ ] Se pueden crear, editar y ver el detalle de leads
- [ ] Se puede importar un CSV con leads y mapear columnas
- [ ] Se pueden crear templates de mensaje con variables que se reemplazan
- [ ] Cada lead tiene un score calculado automaticamente
- [ ] El dashboard muestra al menos: total leads, leads por etapa, tasa de conversion
- [ ] La app esta desplegada en Vercel y accesible por URL publica
- [ ] No hay bugs P1 ni P2 abiertos
- [ ] Auth y RLS funcionan correctamente (un usuario no ve datos de otro)
- [ ] Performance aceptable (< 3s carga inicial, < 1s navegacion)

---

## 7. Velocidad Estimada

| Metrica | Valor |
|---------|-------|
| Story points totales | 47 |
| Story points P1 (must have) | 29 |
| Story points P2 (should have) | 16 |
| Story points P3 (nice to have) | 2 |
| Duracion del sprint | 3 dias |
| Devs activos | 7 (3 frontend + 3 backend + 1 fullstack) |
| SP/dev/dia estimado | 2-3 |
| Capacidad teorica (7 devs x 3 dias x 2.5 SP) | 52 SP |
| Compromiso realista (con overhead de integracion, bugs, reviews) | 35-40 SP |
| **Plan**: Completar 29 SP P1 + mayor cantidad posible de P2 | **Target: 40 SP** |

**Nota**: Si dia 2 al mediodia no estamos al 60% de P1 completado, cortamos scope P2 inmediatamente.

---

## 8. Ceremonias del Sprint

| Ceremonia | Cuando | Duracion |
|-----------|--------|----------|
| Sprint Planning | 04/04 inicio del dia | 30 min |
| Daily Standup | 04/05 y 04/06 inicio del dia | 15 min |
| Sprint Review + Demo | 04/06 tarde | 30 min |
| Retrospectiva | 04/06 cierre | 15 min |

---

## 9. Comunicacion

- Reportes de progreso: al cierre de cada dia
- Bloqueos: escalar inmediatamente al PM
- Demos intermedias: preview URL de Vercel compartida al usuario al final de dia 1 y dia 2
- Escalamiento a CTO (Fernando Farina): si hay bloqueo tecnico que el equipo no puede resolver en 2 horas

---

*Documento generado por Alan Turing (PM/Scrum Master) — 2026-04-03*
*Pendiente aprobacion del usuario para proceder con Acta de Constitucion y Sprint 1*
