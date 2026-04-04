---
name: "Lecciones Aprendidas — Cross-proyecto"
type: gen-doc
tags: [gen/docs, gen/retro, gen/lecciones]
created: "2026-04-03"
updated: "2026-04-03"
related: [[CLAUDE-md], [metodologia], [sprint-checklist]]
---

# Lecciones Aprendidas — Cross-proyecto

Lecciones que aplican a todos los proyectos GEN, extraidas de retrospectivas.
Cada proyecto tambien tiene su propio `docs/lecciones-aprendidas.md`.

---

## Encuestas Streambe (project-encuestas)

### Sprint 1+2 (POC)
- **El acta de constitucion es un gate real** — sin ella se pierde alineacion y el scope crece sin control. Implementada como CP-11 bloqueante.
- **Generar .docx desde el inicio** — el usuario necesita documentos formales para stakeholders, no esperar a que lo pida. Regla: [[word-docs]].
- **23 agentes siempre** — arrancar con equipo incompleto genera retrabajos al agregar roles despues. Regla: [[23-agents-mandatory]].
- **El plan de trabajo DEBE presentarse antes del acta** — el usuario necesita ver sprints, epicas, timeline antes de firmar. Regla: [[plan-acta-gate]].
- **Sprint checklist es obligatorio** — sin checklist se saltean docs y validaciones. Regla: [[sprint-checklist]].
- **Token reporting importa** — el usuario quiere saber cuanto cuesta cada sprint. Regla: [[token-usage-report]].

---

## MunicipIA

### Inception
- **Scraping de sitios publicos es viable** — no temer a bloqueos, los datos municipales son publicos. Regla: [[scraping-municipia]].
- **Proyectos RSE sin presupuesto** — priorizar open source y soluciones de bajo costo.

---

## Patrones generales

- **Auto-approve acelera x3** — dejar que GEN tome decisiones tecnicas internamente reduce drasticamente el tiempo de iteracion. Solo escalar decisiones de negocio.
- **La documentacion formal no es opcional** — sin docs, el sprint no se cierra. Punto.
- **Deployment guide salva vidas** — sin pasos replicables, nadie puede deployar despues.

---

*Actualizar este archivo al cierre de cada sprint de cada proyecto.*
