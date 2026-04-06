---
name: "Mockups navegables antes de programar"
type: feedback
tags: [gen/feedback, gen/workflow, gen/quality]
created: "2026-04-04"
updated: "2026-04-04"
related: [[plan-acta-gate], [project-charter]]
---

# Mockups navegables antes de programar

El PM DEBE preguntar al usuario si quiere que, como parte de la funcionalidad (cuando corresponda), se disenen primero mockups navegables antes de ir a programar las pantallas. Esto aplica a toda feature que tenga UI.

## Why

Programar pantallas sin un diseno previo validado genera retrabajo. Si el usuario ve mockups navegables primero, puede dar feedback temprano sobre flujos, layout y UX antes de invertir horas de desarrollo. El costo de corregir un mockup es minimo comparado con rehacer codigo.

## How to apply

1. **En la planificacion de cada feature con UI**: el PM pregunta al usuario: "Esta feature tiene pantallas. Queres que el equipo de UX disene mockups navegables antes de programar?"
2. **Si el usuario dice si**: UX Designer (Leonardo Da Vinci) disena mockups usando herramientas MCP de diseno (Frame0, Figma). Loop iterativo hasta APROBADO.
3. **Si el usuario dice no o la feature no tiene UI**: se salta el paso y se va directo a desarrollo.
4. **MCPs de diseno disponibles**: Frame0 (wireframes rapidos), Figma (diseno profesional), Magic UI y shadcn/ui (componentes React).
5. **Los mockups aprobados son la referencia**: el dev frontend implementa respetando el diseno aprobado. UX valida que la implementacion coincida.
