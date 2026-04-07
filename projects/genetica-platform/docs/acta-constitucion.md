# Acta de Constitución de Proyecto — GENTICA Platform

**Versión:** 1.0
**Fecha:** 2026-04-06
**Estado:** PENDIENTE DE APROBACIÓN
**PM / Scrum Master:** Alan Turing
**Framework:** GEN v2.2.0

---

## 1. Identificación del Proyecto

| Campo | Valor |
|---|---|
| **Nombre oficial** | GENTICA Platform |
| **Tipo** | Nuevo (desarrollo desde cero) |
| **Sponsor** | Usuario GEN (owner del repositorio) |
| **Branch** | `project-genetica-platform` |
| **Repositorio** | GitHub (cuenta del usuario, por crear en Sprint 1) |
| **Ubicación en monorepo** | `projects/genetica-platform/` |
| **Fecha de inicio estimada** | 2026-04-06 (Sprint 1 arranca tras aprobación del Acta) |

---

## 2. Descripción Ejecutiva

GENTICA Platform es una aplicación web que reemplaza a Claude Code como interfaz de interacción con el framework GEN. Permite a ingenieros IA loguearse, crear y tomar proyectos de desarrollo de software, y chatear en lenguaje natural con una instancia dedicada del equipo GEN (23 agentes especializados) que corre sobre la Claude API real de Anthropic.

La plataforma impone ownership exclusivo por proyecto, soporta hasta 20 proyectos en paralelo con cola de espera, controla costos por proyecto con tope de USD 50 y flujo de aprobación, y libera automáticamente proyectos inactivos tras 7 días.

---

## 3. Alcance

### 3.1 In Scope

- **Autenticación** con email + password, gestionada 100% por un rol administrador (sin auto-registro).
- **Gestión de usuarios** (CRUD completo) accesible solo al rol admin. Roles: `admin` y `ingeniero-ia`.
- **Gestión de proyectos**: crear, listar, ver detalle, eliminar (por admin).
- **Datos mínimos** por proyecto al crearlo + **upload de archivos** adjuntos.
- **Ownership exclusivo**: un único owner por proyecto a la vez. Confirmación explícita al tomarlo.
- **Abandonar proyecto**: libera el ownership para que otro ingeniero IA pueda tomarlo.
- **Auto-release** por inactividad de 7 días, implementado con Vercel Cron.
- **Límite global de 20 proyectos activos** en paralelo a nivel plataforma. Proyectos adicionales entran en **cola de espera FIFO**; al liberarse un slot, se notifica al siguiente en cola.
- **Motor GEN** conectado a Claude API real con los 23 agentes del framework, contexto persistente por proyecto.
- **Modelo Claude configurable por proyecto**: Opus 4.6, Sonnet 4.6 o Haiku 4.5.
- **Chat en lenguaje natural puro**: el PM del proyecto nunca expone comandos, rutas, código técnico de Claude, ni jerga del harness. Las respuestas pasan por una capa de sanitización.
- **Histórico de chat persistente** por proyecto. Si cambia el owner, el nuevo hereda el contexto completo.
- **Tracking de costos en tiempo real** por proyecto (tokens consumidos + USD estimados).
- **Tope de USD 50 por proyecto**: al alcanzarlo, la plataforma bloquea el proyecto y requiere aprobación explícita del owner para continuar (y eventualmente extender tope).
- **Notificaciones** por email e in-app: cambios de ownership, auto-release, cola de espera, tope de costo.
- **Explicación visible en UI** de las reglas de ownership y límites.
- **Security audit** completo antes de deploy a producción.
- **Deploy** en Vercel (preview por branch + producción en main).

### 3.2 Out of Scope (por ahora)

- Auto-registro público de usuarios.
- Recuperación de contraseña por email / 2FA (podría sumarse en un evolutivo).
- Roles adicionales (viewer, cliente final, etc.).
- Colaboración multi-usuario en tiempo real sobre el mismo proyecto.
- Marketplace de templates de proyectos.
- Integración con sistemas de billing externos (Stripe, etc.) — el tope de USD 50 se controla internamente.
- Versionado del framework GEN dentro de la plataforma (cada instancia usa el GEN actual).
- App móvil nativa.

---

## 4. Requerimientos

### 4.1 Funcionales (resumen)

- **RF-01** Un administrador puede crear, editar y eliminar usuarios con rol `admin` o `ingeniero-ia`.
- **RF-02** Un usuario se loguea con email + password.
- **RF-03** Un ingeniero IA logueado puede crear un proyecto completando datos mínimos y subiendo archivos opcionales.
- **RF-04** Existe un listado global de proyectos con su estado (libre / tomado por X / en cola / bloqueado por costo / archivado).
- **RF-05** Un ingeniero IA puede tomar un proyecto libre con confirmación explícita, quedando como owner.
- **RF-06** Solo el owner puede interactuar con su proyecto.
- **RF-07** El owner puede abandonar su proyecto en cualquier momento, liberándolo.
- **RF-08** Si el owner no interactúa por 7 días, el sistema libera el proyecto automáticamente.
- **RF-09** La plataforma no permite más de 20 proyectos activos simultáneos. Los excedentes entran en cola FIFO.
- **RF-10** Cuando se libera un slot, se notifica al primero de la cola.
- **RF-11** Cada proyecto puede configurar su modelo Claude (Opus / Sonnet / Haiku).
- **RF-12** El chat con el PM responde en lenguaje natural, sin filtrar comandos, rutas ni jerga técnica.
- **RF-13** La plataforma trackea tokens y costo en USD por proyecto en tiempo real.
- **RF-14** Al llegar a USD 50, el proyecto se bloquea y pide aprobación del owner para continuar.
- **RF-15** El histórico de chat persiste aunque cambie el owner.
- **RF-16** Se pueden subir archivos al proyecto, que quedan disponibles como contexto para GEN.

### 4.2 No funcionales

- **RNF-01** Latencia de chat (hasta el primer token): ≤ 2 segundos en 95% de los casos.
- **RNF-02** Streaming de respuestas en tiempo real.
- **RNF-03** RLS de Supabase obligatoria: un usuario nunca puede ver datos de proyectos que no le pertenecen.
- **RNF-04** Rate limiting en endpoints públicos.
- **RNF-05** Todas las credenciales en variables de entorno (nunca hardcoded).
- **RNF-06** Disponibilidad ≥ 99% (SLA Vercel + Supabase).
- **RNF-07** Accesibilidad WCAG AA en componentes principales.
- **RNF-08** Responsive (desktop primero, mobile aceptable).
- **RNF-09** Sanitización del chat con cobertura de tests ≥ 90%.
- **RNF-10** Security audit con veredicto GO antes de producción.

---

## 5. Stack Tecnológico Aprobado

| Capa | Tecnología |
|---|---|
| Frontend framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes + Server Actions |
| Base de datos | Supabase (Postgres con RLS) |
| Autenticación | Supabase Auth (email + password) |
| Storage de archivos | Supabase Storage |
| Motor IA | `@anthropic-ai/sdk` (Claude Opus/Sonnet/Haiku 4.5/4.6) |
| Cron jobs | Vercel Cron |
| Emails | Resend |
| Deploy | Vercel (preview + producción) |
| CI/CD | GitHub Actions (lint + test + build) |
| Testing | Vitest (unit) + Playwright (e2e) |
| Linter | ESLint + Prettier |

---

## 6. Equipo Asignado (23 agentes GEN)

| Rol | Científico |
|---|---|
| PM / Scrum Master | Alan Turing |
| Product Owner | Marie Curie |
| Analista Funcional | Ada Lovelace |
| Analista Funcional 2 | Hypatia de Alejandría |
| Arquitecto de Software | Nikola Tesla |
| Líder Técnico | Linus Torvalds |
| Diseñador UI/UX/CX | Leonardo Da Vinci |
| Frontend Developer | Grace Hopper |
| Frontend Developer 2 | Katherine Johnson |
| Frontend Developer 3 | Emmy Noether |
| Backend Developer | Dennis Ritchie |
| Backend Developer 2 | John von Neumann |
| Backend Developer 3 | Blaise Pascal |
| Fullstack Developer | Alan Kay |
| Especialista Integraciones | Tim Berners-Lee |
| Ingeniero de Datos | Rosalind Franklin |
| Científico de Datos | Geoffrey Hinton |
| Tester QA | Richard Feynman |
| Tester QA 2 | Niels Bohr |
| Tester QA 3 | Dorothy Hodgkin |
| Ingeniero Cloud | Carl Sagan |
| DevOps | Margaret Hamilton |
| Especialista Seguridad | Hedy Lamarr |

---

## 7. Plan de Trabajo — Sprints

| Sprint | Objetivo | Épicas | Entregable clave |
|---|---|---|---|
| **S1** | Fundación visual + scaffolding | EPIC-1 | Repo + Next.js en Vercel preview + branding aprobado + design system |
| **S2** | Auth + gestión de usuarios | EPIC-2 | Admin CRUD de usuarios + login funcional |
| **S3** | CRUD de proyectos + listado | EPIC-3 | Crear/listar proyectos con upload de archivos |
| **S4** | Ownership exclusivo + ciclo de vida | EPIC-4 | Tomar/abandonar + auto-release 7 días |
| **S5** | Motor GEN conectado a Claude API | EPIC-5 | Una instancia real de GEN responde en un proyecto |
| **S6** | Chat natural + billing | EPIC-6 + EPIC-7 | Chat sanitizado + tracking de costos con bloqueo a USD 50 |
| **S7** | Notificaciones + hardening + prod | EPIC-8 + EPIC-9 | Cola FIFO + emails + security audit GO + deploy producción |

---

## 8. Riesgos y Mitigación

| # | Riesgo | Impacto | Probabilidad | Mitigación |
|---|---|---|---|---|
| R1 | Sanitización del chat incompleta deja escapar jerga técnica | Alto | Media | Capa de post-procesamiento + tests específicos por Feynman |
| R2 | Costos de Claude API descontrolados por bug en tracker | Alto | Baja | Double-check antes de cada request + circuit breaker global |
| R3 | Context window crece indefinidamente | Medio | Alta | Compresión periódica del histórico + límite por sesión |
| R4 | Race condition al tomar proyecto simultáneamente | Medio | Baja | Lock optimista con transacción Postgres |
| R5 | 20 proyectos en paralelo saturan rate limit de Anthropic | Medio | Media | Queue + rate limiter global documentado |
| R6 | RLS mal configurada expone datos entre usuarios | Alto | Baja | Security audit obligatorio pre-producción (Hedy Lamarr) |
| R7 | Falta de recuperación de contraseña frustra usuarios | Bajo | Media | Admin puede resetear; documentar en onboarding |

---

## 9. Supuestos y Restricciones

### Supuestos

- El usuario ya tiene cuenta GitHub activa y logueada.
- Se crearán cuentas en Supabase, Vercel (si no existen), Resend y se obtendrá ANTHROPIC_API_KEY antes del Sprint 5.
- El proyecto vive en el monorepo GEN bajo `projects/genetica-platform/`.
- No hay deadline externo; prioridad es calidad sobre velocidad.

### Restricciones

- Stack bloqueado (sin cambios sin nueva aprobación).
- Costo por proyecto limitado a USD 50 sin aprobación explícita.
- 20 proyectos activos es hard limit.
- Solo el admin crea usuarios.

---

## 10. Plan de Comunicación

- **Canal principal**: chat directo con el PM (Alan Turing) vía esta interfaz.
- **Ceremonias**:
  - **Sprint Planning** al inicio de cada sprint (loop de aprobación).
  - **Daily implícito**: reportes de agentes al PM en formato `<task_report>`.
  - **Sprint Review** al cierre de cada sprint (demo en Vercel preview + loop de aceptación).
  - **Retrospectiva** al cierre de cada sprint, documentada en `docs/lecciones-aprendidas.md`.
- **Reportes**: `docs/pm-project-plan.md` actualizado al cierre de cada sprint, más reportes internos en `.claude/pm-reports/`.
- **Aprobaciones**: vía chat, con señal explícita del usuario (`APROBADO`, `dale`, `confirmado`, etc.).

---

## 11. Criterios de Éxito

1. Un admin puede crear un ingeniero IA y éste puede loguearse.
2. Un ingeniero IA puede crear un proyecto con archivos adjuntos y quedar como owner.
3. Otro ingeniero IA ve el proyecto en el listado pero no puede tomarlo hasta liberación.
4. El chat con el PM del proyecto responde en lenguaje natural sin filtrar jerga técnica (validado por suite de tests).
5. El tracker de costos bloquea el proyecto al llegar a USD 50 y pide aprobación.
6. Si un owner no interactúa por 7 días, el proyecto se libera automáticamente.
7. Con 20 proyectos activos, el 21° entra en cola y se notifica cuando hay slot disponible.
8. Deploy a producción estable con security audit GO de Hedy Lamarr.
9. Toda la documentación formal (sección 14 de CLAUDE.md) generada y actualizada.

---

## 12. Checkpoints de Aprobación Relevantes

- ✅ CP-01 Requerimientos aprobados (implícito en este Acta)
- ✅ CP-02 Stack aprobado (sección 5)
- ⏳ CP-03 Arquitectura de alto nivel (Sprint 1 — Nikola Tesla)
- ⏳ CP-04 Diseños UX/UI (Sprint 1 — Leonardo Da Vinci)
- ⏳ CP-05 Sprint Goal de cada sprint
- ⏳ CP-06 Demo de cada Sprint Review
- ⏳ CP-08 Deploy a producción (Sprint 7)
- ⏳ CP-09 Features de seguridad y billing (Sprint 6+7)
- ⏳ CP-11 **Este Acta de Constitución** ← BLOQUEANTE
- ⏳ CP-12 Auditoría de seguridad del sprint
- ⏳ CP-13 PO valida features antes del Sprint Review
- ⏳ CP-14 Documentación formal generada
- ⏳ CP-15 Deployment Guide documentado
- ⏳ CP-16 Lecciones aprendidas actualizadas

---

## 13. Aprobaciones

| Rol | Nombre | Estado | Fecha |
|---|---|---|---|
| Sponsor / Usuario | — | ⏳ Pendiente | — |
| PM | Alan Turing | ✅ Presentado | 2026-04-06 |

**Este Acta es BLOQUEANTE. Sin aprobación explícita del sponsor, el Sprint 1 NO puede iniciar.**

---

*Generado por el framework GEN v2.2.0 — 2026-04-06*
