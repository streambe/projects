---
name: "Generar .docx siempre"
type: feedback
tags: [gen/feedback, gen/docs]
created: "2026-03-29"
updated: "2026-04-03"
related: [[deployment-docs], [sprint-checklist]]
---

# Generar .docx para cada .md

Siempre generar .docx para cada .md en docs/ — no esperar que el usuario lo pida.

## Why
El usuario necesita documentos formales en Word para stakeholders.

## How to apply
- Al crear/actualizar cualquier .md en `docs/`, generar su .docx con pandoc
- Guardar en `docs/formal/word/`
