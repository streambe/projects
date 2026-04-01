# Lecciones Aprendidas - Tateti

**Proyecto**: Tateti (Ta-Te-Ti / Tic-Tac-Toe)
**Sprint**: 1
**Fecha**: 2026-04-01
**Responsable**: Alan Turing (PM / Scrum Master)

---

## Problemas Encontrados y Resolucion

| Problema | Impacto | Resolucion |
|----------|---------|------------|
| El proyecto se ejecuto sin gates formales (acta de constitucion, plan de trabajo) | Bajo en este caso por ser un proyecto demo simple, pero seria riesgoso en proyectos reales | Se identifico la necesidad y se agrego al framework GEN como gate bloqueante (CP-11, CP-14) |
| No se definio un proceso de documentacion formal antes de iniciar | Los documentos se generaron al final en lugar de iterativamente | Se establecio la seccion 14 de CLAUDE.md con documentacion obligatoria por rol |
| Sin board Trello ni tracking formal | Visibilidad limitada del progreso | Para proyectos futuros, configurar Trello antes del Sprint 1 |

## Decisiones Tecnicas que Salieron Bien

- **Arquitectura single-file HTML**: Para un juego simple como Tateti, un unico archivo HTML con CSS y JS embebido fue la decision correcta. Elimino complejidad de build, dependencias y deploy. El scope del proyecto no justificaba un framework.
- **Ejecucion en una sola sesion**: Al ser un proyecto demo acotado, completar todo en una sesion evito perdida de contexto y overhead de reanudacion.
- **Separacion logica dentro del archivo**: Aunque es un solo archivo, el codigo mantuvo separacion clara entre estructura (HTML), estilos (CSS) y logica (JS).

## Decisiones que se Podrian Mejorar

- Iniciar con la documentacion formal desde el dia cero, no generarla retroactivamente.
- Aunque sea un proyecto demo, seguir el flujo completo de GEN sirve para validar el framework mismo.
- Definir criterios de aceptacion Gherkin antes de implementar, incluso para proyectos simples.

## Que Mejorar para Futuros Proyectos

1. **Gates desde el inicio**: Plan de trabajo y Acta de Constitucion ANTES de escribir codigo, sin importar el tamanio del proyecto.
2. **Documentacion iterativa**: Cada rol genera su documento durante el sprint, no al final.
3. **Testing formal**: Incluir test-report.md con casos ejecutados y resultados.
4. **Security audit**: Aunque sea basico, documentar revision de seguridad.
5. **Trello operativo**: Configurar board antes de Sprint Planning.

## Checklist Derivado de la Experiencia

- [ ] Requerimientos aprobados antes de planificar sprint
- [ ] Plan de trabajo presentado y aprobado por el usuario
- [ ] Acta de constitucion generada y aprobada (gate bloqueante)
- [ ] Board Trello configurado con listas y etiquetas
- [ ] Criterios de aceptacion Gherkin definidos por story
- [ ] Documentacion formal asignada a cada rol desde Sprint Planning
- [ ] Para proyectos simples: validar que la arquitectura minima es suficiente antes de agregar complejidad
- [ ] Al cierre del sprint: verificar que TODOS los documentos de la seccion 14 existen
- [ ] Generar formato .docx ademas de .md para entrega formal
- [ ] Lecciones aprendidas actualizadas al cierre de cada sprint

---

*Ultima actualizacion: 2026-04-01 - Sprint 1*
