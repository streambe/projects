---
name: "Testing obligatorio tras cada tarea"
type: feedback
tags: [gen/feedback, gen/quality, gen/process]
created: "2026-04-04"
updated: "2026-04-04"
related: [[auto-testing]]
---

# Testing obligatorio tras cada tarea

Tras completar CADA tarea de desarrollo, el agente responsable DEBE ejecutar tests unitarios y casos de prueba, documentando los resultados. No se considera una tarea completa sin esto.

## Why

En el proyecto LeadGen, los agentes reportaron tests passing sin haberlos ejecutado realmente. Al correrlos manualmente se encontraron errores de build (middleware vs proxy, campo channel faltante). Los reportes de QA deben basarse en ejecución real, no en suposiciones.

## How to apply

1. **Tras cada tarea de desarrollo**: el agente ejecuta `npm test` (o equivalente) y `npm run build` antes de reportar al PM.
2. **Documentar resultados**: incluir en el `<task_report>` la salida real de los tests (cantidad passing/failing, errores).
3. **Si hay tests failing o build roto**: el agente DEBE corregirlo antes de reportar DONE. No se acepta "tests pasan" sin evidencia.
4. **QA re-ejecuta independientemente**: el Tester no confía en lo que reporta el dev — corre los tests por su cuenta.
5. **Aplica a TODA la metodología GEN**, no solo a un proyecto específico.
