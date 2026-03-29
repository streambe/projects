# Metodología de Desarrollo Multi-Agente

> **Sistema de desarrollo iterativo con aprobación continua.**
> Combina Scrum + PMI con un equipo de 15 agentes especializados, cada uno con skills del repositorio VoltAgent.
> Principio rector: ningún entregable avanza sin aprobación explícita del usuario.

---

## Tabla de Contenidos

1. [El Equipo](#1-el-equipo)
2. [El Sistema de Aprobación — Ley Fundamental](#2-el-sistema-de-aprobación--ley-fundamental)
3. [Fase 1 — Inception](#3-fase-1--inception)
4. [Fase 2 — Sprint Planning](#4-fase-2--sprint-planning)
5. [Fase 3 — Sprint Execution](#5-fase-3--sprint-execution)
6. [Fase 4 — Sprint Review](#6-fase-4--sprint-review)
7. [Fase 5 — Retrospectiva](#7-fase-5--retrospectiva)
8. [Paralelismo](#8-paralelismo)
9. [Checkpoints de Aprobación](#9-checkpoints-de-aprobación)
10. [Gestión de Estado](#10-gestión-de-estado)
11. [Flujo Completo](#11-flujo-completo)

---

## 1. El Equipo

El equipo está compuesto por 15 agentes especializados. Cada uno opera bajo su propio loop iterativo y reporta al PM al finalizar cada tarea.

| Agente | Rol | Skills Principales |
|--------|-----|--------------------|
| **Project Manager** | Coordina el equipo, gestiona todos los loops de aprobación, actualiza el estado del proyecto | cairn-cli, agent-team-orchestration |
| **Analista Funcional** | Elicita requerimientos, escribe User Stories con criterios Gherkin | muratcankoylan/context-fundamentals |
| **Arquitecto de Software** | Define arquitectura, documenta ADRs, evalúa trade-offs | voltagent/voltagent-best-practices, database-designer |
| **Líder Técnico** | Define estándares, conduce code reviews, aprueba PRs | mcollina/skills, debug-methodology |
| **Dev Frontend** | Implementa UI/UX, despliega en Vercel preview | anthropic/frontend-design, vercel/nextjs |
| **Dev Backend** | Construye APIs, lógica de negocio, base de datos | mcollina/skills, database-designer |
| **Dev Fullstack** | Features verticales end-to-end | Combina Frontend + Backend + openai/develop-web-game |
| **Especialista en Integraciones** | Conecta servicios externos, OAuth, webhooks | composio/integrations, mcollina/skills |
| **Ingeniero de Datos** | Pipelines ETL, modelado dimensional, warehousing | dataset-finder, clickhouse/skills |
| **Científico de Datos** | Modelos ML/AI, experimentación, inferencia | huggingface/skills, replicate/skills |
| **Tester QA** | Pruebas funcionales y de regresión, reporte de bugs | openai/develop-web-game, sentry/skills |
| **Especialista en Seguridad** | Auditorías de seguridad, vetting de skills externas | trail-of-bits/skills, guard-scanner |
| **Diseñador UI/UX/CX** | Wireframes, mockups, validación de implementación | anthropic/frontend-design, sanity/skills |
| **Ingeniero Cloud** | Infraestructura como código, costos, escalabilidad | microsoft/azd-deployment, hashicorp/skills |
| **DevOps** | Pipelines CI/CD, automatización, operaciones | openai/gh-fix-ci, openai/gh-address-comments |

---

## 2. El Sistema de Aprobación — Ley Fundamental

Este es el mecanismo central de toda la metodología. **Todo agente que produce un entregable opera bajo este loop sin límite de iteraciones.**

```
┌─────────────────────────────────────────────────────────────────┐
│         LOOP DE MEJORA CONTINUA HASTA APROBACIÓN                │
│                                                                 │
│  Iteración N                                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  1. Agente carga sus skills del repo VoltAgent          │    │
│  │  2. Agente produce / mejora el entregable (vN)          │    │
│  │  3. PM presenta:                                        │    │
│  │     "Iteración N de [ARTEFACTO]                         │    │
│  │      Cambios respecto a vN-1: [lista]                   │    │
│  │      [ENTREGABLE]                                       │    │
│  │      ¿Aprobamos o ajustamos algo más?"                  │    │
│  │  4. Usuario responde:                                   │    │
│  │     ├── APROBADO ──────────────────────────► continúa  │    │
│  │     └── [feedback] ──────────────────────► vuelve a 1  │    │
│  │  5. PM registra el feedback                             │    │
│  │  6. PM envía al agente solo el DELTA:                   │    │
│  │     feedback exacto + resumen de vN (< 80 tokens)       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Señales que rompen el loop

Solo estas expresiones constituyen aprobación:

```
"APROBADO"  |  "Aprobado"  |  "approved"  |  "LGTM"  |  "go ahead"
"adelante"  |  "dale"  |  "confirmado"  |  "sí, así"  |  "perfecto, seguí"
```

El silencio, "ok", "interesante", "bien" y "gracias" **no son aprobación**.

### Escalamiento por iteraciones sin acuerdo

| Iteración | Acción del PM |
|-----------|---------------|
| 5 | "¿Querés que reorientemos el enfoque completamente?" |
| 10 | "¿Podemos revisar juntos los requerimientos base?" |
| 15 | "Propongo una pausa y sesión de trabajo colaborativo" |

### Regla del delta en iteraciones

A partir de la iteración 2, el agente recibe **solo el delta**, no el entregable anterior completo:
- Feedback exacto del usuario
- Resumen de la versión anterior (menos de 80 tokens)
- Lista de qué debe cambiar

Esto reduce el consumo de tokens y mantiene el foco.

---

## 3. Fase 1 — Inception

> Se ejecuta **una sola vez** por proyecto. Produce todos los artefactos fundacionales, cada uno aprobado antes de pasar al siguiente.

---

### 3.1 Relevamiento de Requerimientos

**Responsable:** Analista Funcional
**Skills:** `muratcankoylan/context-fundamentals`, `muratcankoylan/context-degradation`

#### Fase A — Preguntas (sin límite de rondas)

El Analista conduce entrevistas estructuradas en rondas progresivas. **No escribe ninguna especificación hasta tener claridad total.**

**Ronda 1 — Base:**
- ¿Qué es el sistema y qué problema resuelve?
- ¿Quiénes son los usuarios y cuáles son sus roles?
- ¿Cuál es el alcance del proyecto?
- ¿Qué restricciones existen (tiempo, presupuesto, tecnología)?

**Ronda 2 — Profundidad:**
- ¿Cuáles son los edge cases y flujos alternativos?
- ¿Qué integraciones con sistemas externos se necesitan?
- ¿Cuáles son los requerimientos no funcionales? (performance, disponibilidad, seguridad)
- ¿Cómo se manejan los errores?

**Ronda 3+ — Áreas ambiguas:**
- Continúa profundizando hasta tener claridad en cada punto

#### Fase B — Requerimientos Funcionales (loop iterativo)

```
Draft de requerimientos
  → Usuario revisa: "¿Qué falta o cambiarías?"
  → Analista ajusta
  → Repetir hasta APROBADO
```

#### Fase C — User Stories con criterios Gherkin (loop iterativo)

```
Story + criterios de aceptación en Gherkin
  → Usuario revisa
  → Analista ajusta
  → Repetir hasta APROBADO
  → Crear cards en Trello
```

**Formato de User Story:**
```
TASK-[N]: [Título]

Como [tipo de usuario],
quiero [realizar una acción],
para [obtener un beneficio].

Criterios de Aceptación:
  DADO [contexto inicial]
  CUANDO [acción del usuario]
  ENTONCES [resultado esperado]
```

> **Regla crítica:** JAMÁS se inicia desarrollo sin requerimientos APROBADOS por el usuario.

---

### 3.2 Definición de Stack Tecnológico

**Responsable:** Líder Técnico + Arquitecto de Software
**Skills:** `mcollina/skills`, `voltagent/voltagent-best-practices`

El Líder Técnico presenta **2 o 3 opciones** de stack con análisis real de trade-offs:

```
┌────────────┬──────────────────────┬──────────────────────┐
│            │     Opción A         │     Opción B         │
├────────────┼──────────────────────┼──────────────────────┤
│ Frontend   │ Next.js + TypeScript │ React SPA + Vite     │
│ Backend    │ Node.js + Fastify    │ Python + FastAPI     │
│ Base datos │ Supabase (Postgres)  │ Neon + Drizzle ORM   │
│ Deploy     │ Vercel               │ Cloudflare Workers   │
│ Auth       │ Supabase Auth        │ Better Auth          │
├────────────┼──────────────────────┼──────────────────────┤
│ Pros       │ Ecosistema integrado │ Más control          │
│ Contras    │ Vendor lock-in       │ Mayor configuración  │
│ Cuándo     │ Velocidad de lanzam. │ Requisitos complejos │
└────────────┴──────────────────────┴──────────────────────┘
```

```
Opciones presentadas
  → Usuario elige o propone variante
  → Líder Técnico define estándares y convenciones
  → Usuario aprueba convenciones
  → APROBADO → stack bloqueado
```

> Una vez aprobado, el stack **no puede modificarse** sin un nuevo loop de aprobación con justificación técnica.

---

### 3.3 Arquitectura de Alto Nivel

**Responsable:** Arquitecto de Software
**Skills:** `voltagent/voltagent-best-practices`, `database-designer`, `debug-methodology`

El Arquitecto presenta **mínimo 2 opciones** de arquitectura con sus trade-offs:
- Diagrama de componentes y flujos de datos
- Diseño de base de datos y esquemas
- Estrategia de autenticación y autorización
- Decisiones de escalabilidad y tolerancia a fallos

Cada decisión relevante se documenta como un **ADR (Architecture Decision Record):**

```
ADR-001: Uso de Supabase como base de datos principal
Fecha: [fecha]
Estado: ACCEPTED

Contexto: Necesitamos una base de datos Postgres con autenticación integrada
          y Row-Level Security sin gestionar infraestructura propia.

Decisión: Usar Supabase.

Consecuencias:
  + Auth, storage y DB en un solo servicio
  + RLS nativo, sin necesidad de middleware de autorización
  - Vendor lock-in en ciertas APIs de Supabase
  - Límite de conexiones en plan gratuito (requiere PgBouncer)
```

```
ADR en loop hasta APROBADO → solo entonces se definen componentes detallados
```

---

### 3.4 Diseño UX/UI

**Responsable:** Diseñador UI/UX/CX
**Skills:** `anthropic/frontend-design`, `sanity/skills`

```
Wireframes (baja fidelidad)
  → Usuario revisa
  → Itera hasta APROBADO

Mockups detallados (alta fidelidad)
  → Usuario aprueba
  → Recién entonces va a desarrollo
```

> **NUNCA** se inicia el desarrollo de una pantalla sin el diseño APROBADO.
> El Diseñador además valida durante el desarrollo que la implementación respeta el diseño.

---

### 3.5 Setup Inicial

**Responsables:** DevOps + Especialista en Seguridad (en paralelo)

#### DevOps
- Inicializa repositorio en GitHub con rama `main` + `develop`
- Configura pipeline CI/CD básico en GitHub Actions
- Conecta con Vercel para preview automático en cada PR
- Configura entornos: desarrollo local → staging (develop) → producción (main)

**Pipeline mínimo:**
```
lint → type-check → test → build → preview-deploy → [aprobación] → prod-deploy
```

#### Especialista en Seguridad
- Revisa y aprueba las skills del repo VoltAgent a usar en el proyecto
- Ejecuta `benlee-skillguard` sobre cada SKILL.md de fuente desconocida
- Ejecuta `azhua-skill-vetter` para fuentes no verificadas
- Registra las skills aprobadas en `SKILLS_CACHE` de CLAUDE.md

> Ningún agente puede usar una skill externa sin la aprobación del Especialista en Seguridad.

---

## 4. Fase 2 — Sprint Planning

> Se ejecuta **al inicio de cada sprint.** Todo el resultado debe estar aprobado antes de comenzar el desarrollo.

**Responsable:** Project Manager
**Skills:** `cairn-cli`, `agent-team-orchestration`

### Sprint Goal

```
PM propone un objetivo claro y medible para el sprint
  → Usuario ajusta
  → Itera hasta APROBADO
```

### Backlog Priorizado

```
PM presenta las stories ordenadas por prioridad y valor
  → Usuario reordena según su criterio de negocio
  → PM ajusta estimaciones y dependencias
  → Itera hasta APROBADO
```

**Cada story en el sprint debe tener:**
- Story points estimados (1, 2, 3, 5, 8, 13)
- Criterios de aceptación en Gherkin
- Agente asignado
- Dependencias identificadas
- Skills que va a usar el agente

---

## 5. Fase 3 — Sprint Execution

> Ciclo principal de trabajo. Se repite para cada feature del sprint.

---

### 5.1 Desarrollo

**Responsables:** Dev Frontend / Backend / Fullstack / Especialista en Integraciones

El dev crea un branch siguiendo la convención:
```
feature/TASK-[N]-[descripcion-corta]
fix/BUG-[N]-[descripcion-corta]
hotfix/[descripcion-corta]
```

Cada push a ese branch genera automáticamente una **Vercel Preview URL** única.

Al finalizar, el dev reporta al PM:
```xml
<task_report>
  <id>TASK-001</id>
  <agente>DEV_FRONTEND</agente>
  <iteracion>1</iteracion>
  <estado>NEEDS_REVIEW</estado>
  <skills_usados>anthropic/frontend-design, vercel/nextjs</skills_usados>
  <vercel_preview_url>https://proyecto-abc-branch.vercel.app</vercel_preview_url>
  <requiere_accion_usuario>false</requiere_accion_usuario>
</task_report>
```

---

### 5.2 QA — Testing en Preview URL

**Responsable:** Tester QA
**Skills:** `openai/develop-web-game`, `sentry/skills`, `debug-methodology`

El Tester valida en la Vercel Preview URL contra los criterios de aceptación Gherkin:

```
Ejecuta tests manuales y/o automatizados en Preview URL
  → Encuentra bug → crea reporte → dev corrige → push → QA re-testa
  → Loop hasta: 0 bugs P1, 0 bugs P2, todos los criterios de aceptación OK
```

**Formato de reporte de bug:**
```
BUG-[ID]: [Título descriptivo]
Severidad: P[1-4]
URL: [Vercel preview URL]
Steps para reproducir:
  1. [paso 1]
  2. [paso 2]
Expected: [comportamiento esperado]
Actual:   [lo que ocurre]
```

**Clasificación de severidad:**

| Severidad | Criterio | Bloquea el deploy |
|-----------|----------|-------------------|
| **P1 — Crítico** | El sistema no funciona, pérdida de datos, falla de seguridad | Sí |
| **P2 — Alto** | Feature principal no funciona, workaround muy complejo | Sí |
| **P3 — Medio** | Feature secundaria con problemas, workaround posible | No |
| **P4 — Bajo** | Cosmético, mejora menor | No |

---

### 5.3 Code Review

**Responsable:** Líder Técnico
**Skills:** `mcollina/skills`, `debug-methodology`

```
PR abierto por el dev
  → Líder Técnico revisa:
       - Estándares de código y convenciones aprobadas
       - Cobertura de tests (mínimo 80% en lógica de negocio crítica)
       - Seguridad básica (sin secrets, inputs validados, queries parametrizadas)
       - Performance (queries optimizadas, sin N+1, caching apropiado)
  → Comenta en el PR
  → Dev corrige
  → Líder Técnico re-revisa
  → Loop hasta APROBADO → merge a develop
```

---

### 5.4 Auditoría de Seguridad

**Responsable:** Especialista en Seguridad
**Skills:** `trail-of-bits/skills`, `guard-scanner`, `grc-agent-soc2-quality-review`

Se activa para features críticas: autenticación, pagos, datos sensibles, APIs públicas.

```
Auditoría de seguridad de la feature
  → Reporte con hallazgos clasificados CRITICAL / HIGH / MEDIUM / LOW
  → Dev corrige todos los CRITICAL y HIGH
  → Especialista re-audita
  → Loop hasta: 0 CRITICAL, 0 HIGH
  → MEDIUM y LOW: documentados como deuda técnica con plan de remediación
```

---

### 5.5 Validación en Staging

```
Merge a develop → deploy automático en Vercel (staging)
  → Usuario valida la feature en staging
  → Si hay feedback → dev lo corrige → nuevo deploy a staging
  → Loop hasta APROBADO
  → PR a main listo para producción
```

---

## 6. Fase 4 — Sprint Review

**Responsable:** Project Manager + Todo el equipo

Demo formal de todas las features del sprint en el entorno de staging.

```
Demostración de cada feature del sprint
  → Usuario valida feature por feature:
       Aceptada  → queda en staging, lista para producción
       Rechazada → vuelve al backlog con feedback explícito
  → Sprint APROBADO → PR a main → deploy a producción
```

**Ningún deploy a producción ocurre sin la aprobación del Sprint Review.**

---

## 7. Fase 5 — Retrospectiva

**Responsable:** Project Manager

El PM documenta en CLAUDE.md al cierre del sprint:

- ✅ Qué funcionó bien y debe repetirse
- ⚠️ Qué mejorar en el próximo sprint
- 🚫 Impedimentos encontrados y cómo se resolvieron
- 📊 Velocidad real vs estimada
- 🔧 Ajustes al proceso

---

## 8. Paralelismo

El PM identifica siempre tareas sin dependencias mutuas para ejecutarlas en simultáneo, minimizando tiempos de espera.

| Agente A (trabajando) | Agente B (en paralelo) |
|----------------------|------------------------|
| UX diseña wireframes | Arquitecto documenta ADRs |
| Dev implementa feature N | QA testa feature N-1 |
| Backend construye API | Frontend mockea con datos falsos |
| Seguridad audita feature actual | Dev trabaja siguiente feature |
| DevOps configura pipeline | Analista escribe stories del próximo sprint |
| Ingeniero Cloud diseña infra | Arquitecto define contratos de API |

---

## 9. Checkpoints de Aprobación

**Todos son loops. Ninguno se salta. El PM gestiona cada uno.**

| # | Checkpoint | Responsable | Bloqueante |
|---|------------|-------------|------------|
| CP-01 | Requerimientos funcionales aprobados | Analista Funcional | Sí — sin esto no hay sprint |
| CP-02 | Stack tecnológico aprobado | Líder Técnico | Sí — sin esto no hay arquitectura |
| CP-03 | Arquitectura de alto nivel aprobada | Arquitecto | Sí — sin esto no hay desarrollo |
| CP-04 | Diseños UX/UI aprobados (por feature) | Diseñador UX | Sí — sin esto no hay frontend |
| CP-05 | Sprint Goal aprobado (cada sprint) | PM | Sí — sin esto no hay sprint |
| CP-06 | Demo Sprint Review aprobada | PM | Sí — sin esto no hay deploy a prod |
| CP-07 | Cambio de scope o stack | PM + LT | Sí — requiere nuevo ADR |
| CP-08 | Deploy a producción | PM | Sí — requiere CP-06 |
| CP-09 | Features de seguridad y pagos | Especialista en Seguridad | Sí |
| CP-10 | Skills externas no verificadas | Seguridad + Usuario | Sí — obligatorio antes de usar |

---

## 10. Gestión de Estado

### CLAUDE.md como fuente de verdad única

El PM actualiza `CLAUDE.md` al **inicio y fin de cada sesión**. Contiene:
- Fase actual del proyecto y sprint activo
- Estado de cada loop iterativo en curso
- Stack aprobado y ADRs documentados
- Backlog priorizado y tareas en progreso
- Último feedback del usuario por artefacto

### Reanudación tras interrupciones

Si el servicio se interrumpe o la sesión se reinicia, el PM:

1. Lee CLAUDE.md completo
2. Sincroniza el repo de skills: `cd .agent-skills && git pull origin main`
3. Lee los loops iterativos en curso
4. Informa al usuario:

```
"Retomando proyecto [NOMBRE] — Sprint [N].

Loops en curso:
  - Requerimientos: iteración 3. Último feedback: "Falta el flujo de recuperación de contraseña"
  - Arquitectura: iteración 1. Pendiente primera revisión del usuario

Próxima acción: presentar iteración 4 de requerimientos con el flujo de recuperación incluido.
¿Continuamos?"
```

El usuario **no debe notar el corte**. El sistema retoma exactamente donde estaba.

### Convención de branches

```
main         →  Producción (deploy solo tras aprobación de Sprint Review)
develop      →  Staging (deploy automático en cada push)
feature/*    →  Preview URL automática por branch
fix/*        →  Bugfixes del sprint activo
hotfix/*     →  Fixes urgentes en producción
release/*    →  Preparación de release
```

### Convención de commits

```
feat(scope): descripción    → nueva funcionalidad
fix(scope): descripción     → corrección de bug
refactor(scope): descripción → refactor sin cambio de comportamiento
test(scope): descripción    → tests
docs(scope): descripción    → documentación
chore(scope): descripción   → configuración, dependencias
hotfix(scope): descripción  → fix urgente en producción
```

---

## 11. Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                           INCEPTION                                 │
│                                                                     │
│  Preguntas (Analista) ──────────────────────────────────────────    │
│  Requerimientos: Draft → Feedback → ... → APROBADO                  │
│  User Stories: Draft → Feedback → ... → APROBADO → Trello           │
│                                                                     │
│  Stack: Opciones → Elegir → Refinar → ... → APROBADO                │
│  Arquitectura: Draft → ADR → ... → APROBADO                         │
│  Diseño UX: Wireframes → Mockups → ... → APROBADO                   │
│                                                                     │
│  Setup: DevOps (repo + CI/CD) + Seguridad (vetting skills)          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SPRINT PLANNING                              │
│                                                                     │
│  Sprint Goal: propone → ajusta → ... → APROBADO                     │
│  Backlog: presenta → reordena → ajusta → ... → APROBADO             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SPRINT EXECUTION                               │
│                                                                     │
│  Por cada feature:                                                  │
│                                                                     │
│  Dev implementa → branch → Vercel Preview URL automática            │
│       ↓                                                             │
│  QA testa en preview → BUG P1/P2 → dev corrige → QA re-testa        │
│       ↓  (0 P1, 0 P2)                                               │
│  Líder Técnico code review → comenta → dev corrige → APROBADO       │
│       ↓  (si feature crítica)                                       │
│  Seguridad audita → CRITICAL/HIGH → dev corrige → re-audita         │
│       ↓                                                             │
│  Merge a develop → staging automático                               │
│       ↓                                                             │
│  Usuario valida en staging → feedback → fix → ... → APROBADO        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SPRINT REVIEW                                │
│                                                                     │
│  Demo de cada feature → usuario valida                              │
│  Aceptada → merge a main → deploy a producción                      │
│  Rechazada → vuelve al backlog con feedback                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       RETROSPECTIVA                                 │
│                                                                     │
│  PM documenta en CLAUDE.md → ajusta proceso → próximo sprint        │
└─────────────────────────────────────────────────────────────────────┘
```

---

---

## 12. Estructura del Repositorio GEN

```
Repositorio Git
│
├── branch: gen  ──────────────────────────────────────────────────────
│   │  Framework GEN — evoluciona independientemente de los proyectos
│   ├── .claude/agents/       ← 15 agentes (requerido en root por Claude Code)
│   ├── CLAUDE.md             ← Configuración maestra del equipo
│   ├── METODOLOGIA.md        ← Este archivo
│   ├── .gitignore
│   └── projects/             ← Carpeta contenedora (ignorada por git en este branch)
│
├── branch: project-crm  ──────────────────────────────────────────────
│   │  Basado en gen — hereda el equipo completo
│   └── projects/crm/         ← Código del CRM
│       ├── CLAUDE.md         ← Config específica del proyecto
│       ├── docs/
│       └── src/
│
└── branch: project-[nombre]  ─────────────────────────────────────────
    └── projects/[nombre]/    ← Código del próximo proyecto
```

### Convención de branches

| Branch | Propósito |
|--------|-----------|
| `gen` | Framework GEN — agentes, metodología, config maestra |
| `master` | Línea original pre-GEN |
| `project-[nombre]` | Un branch por proyecto, basado en `gen` |

### Iniciar un proyecto nuevo

```bash
git checkout gen
git checkout -b project-[nombre]
mkdir projects/[nombre]
# El PM lee CLAUDE.md y arranca la fase de Inception
```

---

*Versión: 1.0.0*
*Basado en el sistema CLAUDE.md v2.0.0*
*Skills source: https://github.com/VoltAgent/awesome-agent-skills.git*
*Principio rector: Iterar indefinidamente hasta aprobación. La calidad no tiene atajos.*
