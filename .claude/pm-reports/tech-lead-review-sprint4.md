# Code Review: Sprint 4 — Pipeline Kanban (RF-11)

**Rol**: Líder Técnico
**Fecha**: 2026-03-29
**Veredicto**: **APROBADO** (con observaciones menores)

---

## Checklist obligatoria — todos CUMPLEN

| Criterio | Resultado |
|----------|-----------|
| Stack aprobado | CUMPLE |
| Sin secrets | CUMPLE |
| Sin vulnerabilidades OWASP | CUMPLE |
| Naming/estructura consistente | CUMPLE |
| Sin código muerto | CUMPLE |
| TypeScript strict sin `any` | CUMPLE |
| Manejo de errores | CUMPLE |
| PUT para stage (no PATCH) | CUMPLE |
| DnD edge cases | CUMPLE |
| Dialog validation | CUMPLE |

---

## Observaciones no-bloqueantes

| # | Prioridad | Descripción |
|---|-----------|-------------|
| OBS-1 | Baja | `totalValue = 0` hardcodeado en KanbanColumn — dead code |
| OBS-2 | Nula | `void filterSucursal` — placeholder intencional |
| OBS-3 | Baja | `changeStage` duplica lógica de `useChangeStage` — refactorear para ID dinámico |
| OBS-4 | Media | CloseOpportunityDialog debería usar shadcn/ui Dialog (focus trap, Escape, WCAG 2.1) |
| OBS-5 | Baja | Sin optimistic update en drag & drop — mejora de UX |

---

## Recomendaciones

- OBS-3 y OBS-4 al backlog como tech debt (OBS-4 prioridad más alta)
- Validar DnD manualmente: cierre→dialog, fuera→cancela, misma columna→noop
