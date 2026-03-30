# GEN — Sistema Multi-Agente de Desarrollo de Software

GEN es un framework de desarrollo de software basado en un equipo de 15 agentes especializados que trabajan en metodología Scrum con loops iterativos de aprobación. Cada agente tiene un rol definido, skills del repositorio VoltAgent, y criterios de calidad obligatorios.

---

## Inicio rápido

### Crear un proyecto nuevo

```bash
# 1. Partir desde el branch gen (framework base)
git checkout gen
git checkout -b project-[nombre-del-proyecto]

# 2. Crear la carpeta del proyecto
mkdir projects/[nombre-del-proyecto]

# 3. Iniciar sesión — el PM lee CLAUDE.md y arranca el relevamiento
```

### Estructura del repositorio

```
branch: gen                          ← Framework GEN (no se modifica)
  ├── .claude/agents/                ← 15 agentes del equipo
  ├── CLAUDE.md                      ← Configuración maestra
  ├── METODOLOGIA.md                 ← Metodología documentada
  └── projects/                      ← Carpeta contenedora

branch: project-[nombre]             ← Un branch por proyecto (basado en gen)
  └── projects/[nombre]/             ← Código del proyecto
```

---

## El equipo (15 agentes)

| Rol | Responsabilidad |
|-----|-----------------|
| **PM / Scrum Master** | Coordina el equipo, gestiona sprints, loops de aprobación |
| **Analista Funcional** | Relevamiento de requerimientos, user stories con Gherkin |
| **Arquitecto de Software** | Diseño de sistema, ADRs, decisiones de arquitectura |
| **Líder Técnico** | Code review obligatorio, estándares, selección de stack |
| **Dev Frontend** | Implementación UI/UX con React, componentes, estilos |
| **Dev Backend** | APIs, lógica de negocio, tests unitarios obligatorios |
| **Dev Fullstack** | Tareas que cruzan frontend y backend |
| **Especialista en Integraciones** | APIs externas, tests e2e obligatorios con Playwright |
| **Ingeniero de Datos** | ETL, pipelines de datos, warehouse |
| **Científico de Datos** | ML, modelos, inferencia |
| **Tester QA** | Plan de tests por sprint, ejecución en paralelo con dev |
| **Especialista en Seguridad** | Auditoría OWASP, entregable .docx por sprint |
| **Diseñador UI/UX/CX** | Wireframes, mockups, validación de implementación |
| **Ingeniero Cloud** | Infraestructura, deploy, validación post-deploy |
| **DevOps** | CI/CD, pipelines, validación post-deploy |

---

## Flujo obligatorio por tarea

```
Dev implementa + tests unitarios
  → Tester QA ejecuta plan de tests
    → Integrador ejecuta e2e
      → Líder Técnico hace code review
        → Especialista en Seguridad audita
          → Cloud/DevOps validan deploy
            → PM commitea
```

Ningún paso se salta. Cada uno es un gate bloqueante.

---

## Metodología

### Fases del proyecto

1. **Inception** — Relevamiento, stack, arquitectura, diseños UX (todo con loops iterativos)
2. **Sprint Planning** — Goal + backlog priorizado (aprobado por el usuario)
3. **Sprint Execution** — Desarrollo + QA + Code Review + Security en paralelo
4. **Sprint Review** — Demo al usuario, validación feature por feature
5. **Retrospectiva** — Lecciones aprendidas, ajustes al proceso

### Loop iterativo (ley fundamental)

Todo entregable sujeto a aprobación itera indefinidamente hasta que el usuario diga **APROBADO**. No existe "una sola vuelta". El PM gestiona cada loop y presenta al usuario con cambios respecto a la versión anterior.

### Modo Auto-Approve

GEN puede operar en modo autónomo para decisiones técnicas. Solo escala al usuario para:
- Sprint Planning y Review
- Cambios de scope o arquitectura
- Deploy a producción
- Decisiones de negocio

---

## Gates de calidad

| Gate | Responsable | Bloqueante |
|------|-------------|------------|
| Tests unitarios (backend) | Dev Backend | Si |
| Plan de tests QA | Tester | Si (0 P1/P2) |
| Tests e2e | Integrador | Si |
| Code Review | Líder Técnico | Si |
| Auditoría de seguridad | Especialista Seguridad | Si (.docx) |
| Validación post-deploy | Cloud + DevOps | Si |

---

## Skills (VoltAgent)

Los agentes utilizan skills del repositorio [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills). Cada skill se carga bajo demanda y es revisada por el Especialista en Seguridad antes de su primer uso.

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `CLAUDE.md` | Configuración maestra — estado del proyecto, roles, loops, stack |
| `METODOLOGIA.md` | Metodología completa documentada |
| `.claude/agents/*.md` | Definición de cada agente (15 archivos) |
| `.claude/pm-reports/` | Reportes de QA, code review, security por sprint |

---

## Deploy

### Frontend (Vercel)
- Framework: Vite (React)
- Requiere `vercel.json` con rewrites para SPA
- Env var: `VITE_API_URL` apuntando al backend

### Backend (Render)
- Framework: Fastify + Prisma + PostgreSQL
- `render.yaml` en la raíz del repo
- Seed en JS puro (no TypeScript)

### Checklist pre-deploy

Ver `projects/[nombre]/docs/lecciones-aprendidas.md` para el checklist completo.

---

## Proyecto de referencia: CRM Ciudad Moto

GEN fue validado construyendo un CRM completo para una cadena de motos:

- **29 requerimientos funcionales** implementados en 4 sprints
- **6 módulos**: Auth, Clientes, Pipeline Kanban, Actividades, Comunicaciones, Reportes
- **Stack**: React 18 + Fastify v4 + Prisma v5 + PostgreSQL
- **Deploy**: Vercel (frontend) + Render (backend + DB)
- **Branch**: `project-crm`

---

*Framework GEN v2.0 — Iterar indefinidamente hasta aprobación. La calidad no tiene atajos.*
