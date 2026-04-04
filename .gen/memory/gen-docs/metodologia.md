---
name: "Metodologia de Desarrollo Multi-Agente"
type: gen-doc
tags: [gen/docs, gen/metodologia, gen/scrum]
created: "2026-03-29"
updated: "2026-04-03"
source: "METODOLOGIA.md (root)"
sync: "bidireccional"
related: [[CLAUDE-md], [manual-gen], [team-roster], [ley-fundamental]]
---

# Metodologia de Desarrollo Multi-Agente

> Fuente: `/METODOLOGIA.md` en la raiz del repositorio.

## Resumen

Combina **Scrum + PMI** con un equipo de 23 agentes especializados.
Cada agente tiene skills del repositorio VoltAgent.
Principio rector: ningun entregable avanza sin aprobacion explicita del usuario.

## Fases

### Fase 1 — Inception
- [[CLAUDE-md|Requerimientos]] via Analista Funcional (loop hasta APROBADO)
- Stack tecnologico (loop hasta APROBADO)
- Arquitectura de alto nivel + ADRs (loop hasta APROBADO)
- Wireframes UX/UI (loop hasta APROBADO)
- Plan de Trabajo + [[project-charter|Acta de Constitucion]] (BLOQUEANTE)

### Fase 2 — Sprint Planning
- Sprint Goal + backlog priorizado (loop hasta APROBADO)
- Asignacion de tareas a agentes

### Fase 3 — Sprint Execution
- Desarrollo con deploy a Vercel preview
- QA valida en preview URL
- Code review por Lider Tecnico
- Auditoria de seguridad si aplica

### Fase 4 — Sprint Review
- Demo en staging
- Usuario valida feature por feature
- Rechazadas vuelven al backlog

### Fase 5 — Retrospectiva
- Documentar en [[lecciones-aprendidas]]
- Actualizar CLAUDE.md
- Proximo sprint

## Paralelismo
- UX disena mientras Arquitecto documenta ADRs
- QA testa feature N mientras Dev trabaja feature N+1
- 3 frontends, 3 backends, 3 testers pueden trabajar en paralelo

## Checkpoints de aprobacion
16 gates obligatorios — ver seccion 13 de [[CLAUDE-md]].

## Sistema de aprobacion — Ley Fundamental
Ningun entregable avanza sin "APROBADO" explicito.
El silencio, "ok", "bien", "gracias" NO son aprobacion.
Loop infinito hasta aprobacion o escalamiento.
