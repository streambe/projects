# Acta de Constitucion del Proyecto — LeadGen

**Proyecto**: LeadGen — Generacion de leads B2B via LinkedIn para Streambe
**Fecha**: 2026-04-03
**Sponsor**: Gaston (Streambe)
**Responsable del documento**: Alan Turing (PM / Scrum Master)
**Colaboracion**: Ada Lovelace (Analista Funcional)
**Version**: 1.0

---

## 1. Descripcion del Proyecto

LeadGen es una aplicacion web que permite al equipo de marketing y comercial de Streambe captar, gestionar y convertir leads B2B del sector salud en LATAM a traves de LinkedIn. Incluye CRM con pipeline visual (Kanban), gestion de secuencias de outreach, scoring automatico de leads y dashboard de metricas de conversion.

El enfoque es conservador respecto a LinkedIn: no se automatizan acciones dentro de la plataforma. La app funciona como CRM de tracking y gestion, con copia al clipboard de templates para pegar manualmente en LinkedIn.

---

## 2. Alcance

### 2.1 In Scope — MVP

| ID | Modulo | Descripcion |
|----|--------|-------------|
| MVP-01 | Auth | Login email/password, 2 roles (admin, comercial) |
| MVP-02 a MVP-04 | CRM / Pipeline | Kanban 9 etapas, ficha de lead, filtros, vista lista |
| MVP-05 a MVP-07 | LinkedIn Import | Import por URL (scrape basico), CSV de Sales Navigator, deduplicacion |
| MVP-08 a MVP-11 | Outreach | Templates con variables, secuencias por pasos, tracking manual, cola diaria |
| MVP-12 a MVP-14 | Scoring | Score automatico (demografico + comportamiento), alertas MQL/SQL, decaimiento |
| MVP-15 a MVP-18 | Dashboard | Funnel chart, actividad semanal, leads calientes, tasas de conversion |

**Total**: 18 funcionalidades MVP distribuidas en 6 modulos.

### 2.2 Out of Scope — Diferido a v2

- Integracion directa con LinkedIn API (envio de mensajes desde la app)
- Automatizacion real de envio de secuencias
- Integraciones: Calendly, WhatsApp Business, Gmail/SMTP
- Enriquecimiento automatico de datos (scraping avanzado)
- Reportes exportables (PDF, Google Sheets)
- Multi-perfil LinkedIn con vista consolidada
- Calendario de contenido / sugerencias de posts
- ABM dashboard por empresa
- Recordatorios y tareas pendientes por lead
- Deteccion automatica de senales de compra

---

## 3. Requerimientos Funcionales y No Funcionales (Resumen)

### 3.1 Funcionales

Se documentaron 45+ requerimientos funcionales detallados en `functional-specification.md` (APROBADO). Los mas criticos:

- **CRM**: Pipeline Kanban con drag & drop, 9 etapas del funnel, ficha completa de lead con historial de interacciones.
- **Import**: Carga individual por URL de LinkedIn + import masivo via CSV de Sales Navigator con deduplicacion.
- **Outreach**: Templates con variables, secuencias de pasos por dia, cola de acciones diarias con copia al clipboard.
- **Scoring**: Score automatico con reglas demograficas y de comportamiento, thresholds MQL (40) y SQL (70), decaimiento por inactividad.
- **Dashboard**: Funnel, actividad, leads calientes, tasas de conversion, alertas activas.

### 3.2 No Funcionales

| Area | Requisito clave |
|------|----------------|
| Performance | Carga < 3s, drag & drop fluido con 500 leads, CSV 1000 registros < 30s |
| Seguridad | Passwords hasheados, JWT, HTTPS, rate limiting login, no credenciales LinkedIn |
| Usabilidad | Responsive desktop + tablet, max 3 clicks a cualquier funcionalidad |
| Compliance | No interaccion directa con LinkedIn, scraping limitado a datos publicos |

---

## 4. Stack Tecnologico Aprobado

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 14 App Router (monolito fullstack) |
| UI | React 18, Tailwind CSS, shadcn/ui |
| Drag & Drop | @dnd-kit/core |
| Estado cliente | TanStack Query + Zustand |
| Backend | Next.js Route Handlers + Server Actions |
| ORM | Prisma |
| DB + Auth | Supabase (Postgres, Auth, RLS) |
| Deploy | Vercel |

---

## 5. Equipo Asignado

### 5.1 Equipo GEN (23 agentes)

| Rol | Nombre | Color |
|-----|--------|-------|
| PM / Scrum Master | Alan Turing | Azul |
| Product Owner | Marie Curie | Violeta |
| Analista Funcional 1 | Ada Lovelace | Ambar |
| Analista Funcional 2 | Hypatia de Alejandria | Perla |
| Arquitecto de Software | Nikola Tesla | Plateado |
| Lider Tecnico | Linus Torvalds | Rojo |
| Dev Frontend 1 | Grace Hopper | Dorado |
| Dev Frontend 2 | Katherine Johnson | Esmeralda |
| Dev Frontend 3 | Emmy Noether | Jade |
| Dev Backend 1 | Alan Kay | Indigo |
| Dev Backend 2 | John von Neumann | Cobalto |
| Dev Backend 3 | Blaise Pascal | Bronce |
| Especialista Integraciones | Tim Berners-Lee | Cian |
| Ingeniero de Datos | Rosalind Franklin | Magenta |
| Cientifico de Datos | Albert Einstein | Blanco |
| Tester QA 1 | Richard Feynman | Naranja |
| Tester QA 2 | Niels Bohr | Coral |
| Tester QA 3 | Dorothy Hodgkin | Salmon |
| Ingeniero Cloud | Carl Sagan | Celeste |
| DevOps | Margaret Hamilton | Oliva |
| Especialista Seguridad | Hedy Lamarr | Negro |
| Disenador UI/UX/CX | Leonardo Da Vinci | Turquesa |
| Dev Fullstack (apoyo) | Marie Curie | Violeta |

### 5.2 Equipo Marketing/Ventas (7 especialistas)

Definidos en `marketing-strategy.md`, responsables de la estrategia de LinkedIn, content marketing, outreach y ABM que alimentan los requerimientos de la app.

---

## 6. Plan de Comunicacion

| Ceremonia | Frecuencia | Participantes | Formato |
|-----------|-----------|--------------|---------|
| Sprint Planning | Inicio de sprint | PM + equipo completo | Presentacion de goal + backlog |
| Daily Standup | Cada sesion de trabajo | PM + agentes activos | Reporte de progreso via pm-reports/ |
| Sprint Review | Fin de sprint | PM + usuario (Gaston) | Demo en Vercel preview/staging |
| Retrospectiva | Post-review | PM + equipo | Documento en retrospectives/ |
| Reportes de agentes | Al completar tareas | Cada agente | .claude/pm-reports/[rol]-report.md |
| Validaciones | Continuo | PM + usuario | Loop iterativo hasta APROBADO |

**Canal principal**: Sesiones de Claude Code con loop iterativo de aprobacion.
**Artefactos visibles**: Vercel preview URLs para validacion en vivo.

---

## 7. Plan de Trabajo

### 7.1 Timeline

| Sprint | Fechas | Duracion | Objetivo |
|--------|--------|----------|----------|
| Sprint 1 (MVP) | 2026-04-04 a 2026-04-06 | 3 dias | MVP completo desplegado en Vercel |

### 7.2 Epicas y Distribucion

| Epica | Stories estimadas | Prioridad | Dia target |
|-------|-------------------|-----------|------------|
| EPIC-1: Auth + Setup | 3-4 stories | P1 | Dia 1 (04-abr) |
| EPIC-2: CRM / Pipeline Kanban | 5-6 stories | P1 | Dia 1-2 (04-05 abr) |
| EPIC-3: LinkedIn Import | 3-4 stories | P1 | Dia 1-2 (04-05 abr) |
| EPIC-4: Outreach (Templates + Secuencias) | 4-5 stories | P2 | Dia 2 (05-abr) |
| EPIC-5: Scoring | 3-4 stories | P2 | Dia 2-3 (05-06 abr) |
| EPIC-6: Dashboard | 3-4 stories | P3 | Dia 3 (06-abr) |

**Total estimado**: ~22-27 stories, 1 sprint de 3 dias.

### 7.3 Estrategia de Desarrollo

- **Dia 1**: Setup proyecto + DB schema + Auth + CRM Kanban basico + Import
- **Dia 2**: CRM completo + Outreach + Scoring + integracion entre modulos
- **Dia 3**: Dashboard + polish UX + testing + deploy produccion

Desarrollo en paralelo: Frontend (Grace Hopper, Katherine Johnson) + Backend (Alan Kay, John von Neumann) trabajando simultaneamente con Vercel preview continuo.

---

## 8. Riesgos Identificados y Mitigacion

| # | Riesgo | Probabilidad | Impacto | Mitigacion |
|---|--------|-------------|---------|------------|
| R1 | Timeline agresivo (3 dias para MVP completo) | Alta | Alto | Priorizar modulos P1 primero; si no alcanza, dashboard pasa a dia 4 |
| R2 | Scraping de LinkedIn URL bloqueado | Media | Medio | Fallback a carga manual de datos; scraping es best-effort |
| R3 | Complejidad del drag & drop con muchos leads | Baja | Medio | @dnd-kit es robusto; limitar renderizado con virtualizacion si necesario |
| R4 | Supabase Auth limitaciones con roles custom | Baja | Bajo | RLS + campo role en tabla users; no depender de Supabase Auth roles nativos |
| R5 | Scope creep durante desarrollo | Media | Alto | Spec funcional aprobada es la fuente de verdad; cualquier cambio pasa por loop de aprobacion |
| R6 | Performance del scoring en tiempo real | Baja | Bajo | Score se recalcula on-demand al registrar interaccion, no en batch |

---

## 9. Criterios de Exito

### 9.1 Criterios de Entrega (MVP)

- [ ] 6 modulos funcionales desplegados en Vercel produccion
- [ ] Login funcional con 2 roles
- [ ] Kanban drag & drop operativo con 9 etapas
- [ ] Import CSV de Sales Navigator funcionando
- [ ] Al menos 1 secuencia de outreach pre-cargada
- [ ] Scoring automatico con alertas MQL/SQL
- [ ] Dashboard con funnel chart y leads calientes

### 9.2 Metricas de Negocio (medibles post-lanzamiento)

| Metrica | Target mensual | Plazo de medicion |
|---------|---------------|-------------------|
| MQLs generados | 15-25 | Mes 1-2 post-launch |
| Reuniones agendadas | 8-12 | Mes 1-2 post-launch |
| Clientes nuevos | 1-2 | Mes 2-3 post-launch |
| Tasa de conexion LinkedIn | >30% | Mes 1 post-launch |
| Tasa de respuesta outreach | >15% | Mes 1 post-launch |

---

## 10. Supuestos y Restricciones

### 10.1 Supuestos

- El equipo de Streambe tiene LinkedIn Sales Navigator activo y sabe exportar CSVs.
- El volumen inicial de leads sera < 500 (dimensionamiento de performance).
- Los 2 usuarios (admin + comercial) tendran acceso a desktop o tablet para operar la app.
- Supabase free tier es suficiente para el MVP; escalar a plan pago si necesario.
- El scraping basico de perfil publico de LinkedIn no viola ToS si es individual y manual.

### 10.2 Restricciones

- **Presupuesto**: Disponible para herramientas pagas (Sales Navigator, hosting). No hay restriccion presupuestaria explicita.
- **Timeline**: 3 dias para MVP. Es firme. Si algo no entra, se difiere a v2.
- **Compliance LinkedIn**: Approach conservador. Cero automatizacion de acciones en LinkedIn.
- **Gmail**: Diferido a v2. No se integra email en MVP.
- **Stack**: Aprobado y fijo (Next.js + Supabase + Vercel). No se cambia sin aprobacion explicita.

---

## 11. Aprobaciones

| Artefacto | Estado | Fecha |
|-----------|--------|-------|
| Requerimientos Funcionales | APROBADO | 2026-04-03 |
| Stack Tecnologico | APROBADO | 2026-04-03 |
| Wireframes UX/UI | APROBADO | 2026-04-03 |
| Estrategia de Marketing | DEFINIDA | 2026-04-03 |
| Plan de Trabajo | PENDIENTE APROBACION | — |
| Acta de Constitucion | PENDIENTE APROBACION | — |

---

**Firma del Sponsor**: Pendiente aprobacion de Gaston (Streambe)

**Nota**: Este documento es el gate bloqueante CP-11. Sin su aprobacion, no se inicia el desarrollo del Sprint 1.
