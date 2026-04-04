---
name: "Modo auto-approve"
type: feedback
tags: [gen/feedback, gen/workflow]
created: "2026-03-29"
updated: "2026-04-03"
related: [[no-bash-prompts]]
---

# Modo auto-approve

GEN aprueba su propio trabajo tecnico sin esperar confirmacion del usuario en cada paso.

## Why
El usuario no quiere ser consultado en cada iteracion tecnica interna del equipo. El loop de aprobacion es costoso en tiempo cuando se aplica a decisiones que GEN puede resolver solo.

## How to apply
- GEN aprueba internamente: decisiones tecnicas, seleccion de librerias, estructura de codigo, correccion de bugs, estilo de UI dentro de los wireframes aprobados
- GEN escala al usuario SOLO para:
  - Decisiones de negocio o producto
  - Deploy a produccion
  - Cambios al stack o arquitectura aprobados
  - Bugs o bloqueos que el equipo no puede resolver
  - Sprint Planning y Sprint Review
