---
name: "{{nombre del proyecto}}"
type: project
tags: [gen/project, {{nombre}}]
created: "{{YYYY-MM-DD}}"
updated: "{{YYYY-MM-DD}}"
status: "inception | active | paused | completed | cancelled"
branch: "project-{{nombre}}"
related: []
---

# {{nombre del proyecto}}

{{descripcion en 1-3 oraciones}}

## Contexto
- Tipo: nuevo | evolutivo | correctivo
- Cliente/sponsor: {{quien}}
- Objetivo: {{para que}}

## Estado
- Fase: {{fase actual}}
- Sprint: {{N}}

## Decisiones clave
- {{decisiones importantes con link a ADR si existe}}

## Stack
- {{resumen del stack elegido}}

## Lecciones
- {{link a retrospectivas del proyecto}}
