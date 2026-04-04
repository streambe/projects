---
name: "Estrategia de testing obligatoria y completa"
type: feedback
tags: [gen/feedback, gen/quality, gen/process]
created: "2026-04-04"
updated: "2026-04-04"
related: [[auto-testing], [sprint-checklist]]
---

# Estrategia de testing obligatoria y completa

El testing es FUNDAMENTAL en GEN. Cada funcion debe tener tests unitarios con el mayor grado de cobertura posible. El Tester DEBE escribir los casos de prueba al recibir cada requerimiento funcional o historia de usuario, ANTES de que el dev termine. Cuando el dev entrega, los casos ya deben estar listos para ejecutarse.

## Why

En el proyecto LeadGen, los agentes reportaron tests passing sin haberlos ejecutado realmente. Al correrlos manualmente se encontraron errores de build. Los reportes de QA deben basarse en ejecucion real, no en suposiciones. Ademas, sin una estrategia completa de testing (unitarios, API, integracion, smoke) los bugs llegan a produccion.

## How to apply

### Tipos de prueba obligatorios (todos los proyectos)

1. **Tests unitarios**: por CADA funcion/metodo. Buscar la mayor cobertura posible. El dev los escribe junto con el codigo.
2. **Tests de API**: validar cada endpoint (request/response, status codes, errores, edge cases). El backend dev los escribe al crear el endpoint.
3. **Tests de integracion**: validar flujos completos que cruzan multiples componentes/servicios. QA los diseña y ejecuta.
4. **Smoke tests**: suite minima que verifica que la app arranca y los flujos criticos funcionan. Se ejecutan en CADA deploy (preview, staging, produccion).
5. **Casos de prueba funcionales**: el Tester los escribe al recibir la historia de usuario con sus criterios de aceptacion Gherkin. Deben estar LISTOS antes de que el dev entregue, para ejecutarse inmediatamente.

### Proceso obligatorio

1. **Al recibir una historia de usuario**: el Tester escribe los casos de prueba (happy path, edge cases, errores).
2. **Tras cada tarea de desarrollo**: el dev ejecuta `npm test` (o equivalente) y `npm run build` antes de reportar al PM.
3. **Documentar resultados**: incluir en el `<task_report>` la salida real de los tests (cantidad passing/failing, errores).
4. **Si hay tests failing o build roto**: el dev DEBE corregirlo antes de reportar DONE. No se acepta "tests pasan" sin evidencia.
5. **QA re-ejecuta independientemente**: el Tester no confia en lo que reporta el dev — corre los tests por su cuenta y ejecuta los casos de prueba funcionales.
6. **Smoke tests en cada deploy**: DevOps/QA validan que la app responde y los flujos criticos funcionan.

### Aplica a TODA la metodologia GEN, no solo a un proyecto especifico.
