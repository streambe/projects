---
name: "CLAUDE.md — Configuracion Maestra GEN"
type: gen-doc
tags: [gen/docs, gen/core, gen/claude-md]
created: "2026-03-29"
updated: "2026-04-03"
source: "CLAUDE.md (root)"
sync: "bidireccional — cambios en root se reflejan aqui y viceversa"
related: [[metodologia], [manual-gen], [readme], [team-roster]]
---

# CLAUDE.md — Configuracion Maestra de GEN

> Fuente de verdad unica del framework GEN.
> Archivo: `/CLAUDE.md` en la raiz del repositorio.

## Secciones principales

1. **Metadatos del proyecto** — nombre, tipo, estado, fase actual
2. **Skills Repository** — VoltAgent skills, mapa por rol, cache
3. **Stack Tecnologico** — definido por proyecto, aprobado por usuario
4. **Loop Iterativo de Aprobacion** — [[ley-fundamental|Ley Fundamental]]
5. **Definicion de Roles** — 23 agentes con [[team-roster|nombres de cientificos]]
6. **Metodologia Scrum + PMI** — flujo completo con loops, ver [[metodologia]]
7. **Trello** — estructura de tablero y cards
8. **Vercel** — deploy continuo con preview URLs
9. **Estado del Proyecto** — requerimientos, sprint, tareas, ADRs
10. **Optimizacion de Tokens** — contexto minimo, delta de iteracion
11. **Mantenimiento** — correctivo y evolutivo
12. **Estandares de Codigo** — commits, branches, PR checklist
13. **Checkpoints de Aprobacion** — 16 gates obligatorios
14. **Documentacion Formal** — docs obligatorios por rol y sprint
15. **Memoria Persistente** — boveda Obsidian en `.gen/memory/`
16. **Sesion Actual** — estado de la sesion en curso
17. **Reanudacion** — protocolo post-interrupcion
18. **Primer Uso** — secuencia de inicio

## Protocolo de sincronizacion

```
AL INICIO DE SESION:
  GEN lee /CLAUDE.md (fuente de verdad operativa)
  GEN lee .gen/memory/ (contexto persistente)

AL CIERRE DE SESION:
  GEN actualiza /CLAUDE.md seccion SESION_ACTUAL
  GEN actualiza .gen/memory/gen-docs/CLAUDE-md.md si hubo cambios estructurales
  GEN commitea ambos
```

## Version actual
- Version: 2.2.0
- Secciones: 18
- Tokens estimados: ~4000 (completo)

## Historial de cambios relevantes

| Fecha | Cambio |
|-------|--------|
| 2026-03-29 | Version inicial con 15 agentes |
| 2026-03-31 | Expansion a 23 agentes, Product Owner, duplicados |
| 2026-04-01 | Seccion 14 documentacion formal, checkpoints CP-11 a CP-16 |
| 2026-04-03 | Seccion 15 memoria persistente Obsidian |
