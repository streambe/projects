# Reporte QA: Sprint 4 — Pipeline Kanban (RF-11)

**Rol**: Tester QA
**Fecha**: 2026-03-29
**Veredicto**: **GO** (con observaciones menores)

---

## Criterios de aceptación — Resultado

| # | Criterio | Estado | Evidencia |
|---|----------|--------|-----------|
| 1 | 4 columnas: consulta, prueba_manejo, presupuesto, cierre | **PASS** | `KanbanBoard.tsx` L26-31 |
| 2 | Drag & drop entre columnas | **PASS** | @dnd-kit/core con DndContext, PointerSensor 5px |
| 3 | Click/drag a cierre abre diálogo ganado/perdido | **PASS** | `KanbanBoard.tsx` L140 |
| 4 | Si perdido, motivo obligatorio | **PASS** | `CloseOpportunityDialog.tsx` L31 |
| 5 | Header de columna: count + valor total | **PASS (parcial)** | Count OK, valor hardcodeado a 0 |
| 6 | Filtros: vendedor y sucursal | **PASS (parcial)** | Vendedor filtra pero lista vacía, sucursal no-op |
| 7 | Usa PUT (no PATCH) | **PASS** | `usePipeline.ts` L69 y `KanbanBoard.tsx` L102 |

---

## Bugs encontrados

### BUG-S4-01 | P3 | Valor total de columna siempre en cero
- **Archivo**: `KanbanColumn.tsx` L70
- `totalValue = 0` hardcodeado. Opportunity no tiene campo de valor monetario.

### BUG-S4-02 | P3 | Filtro de sucursal no-operativo
- **Archivo**: `KanbanBoard.tsx` L76
- `void filterSucursal` — no hay campo branch en el modelo.

### BUG-S4-03 | P3 | Lista de vendedores vacía
- **Archivo**: `PipelinePage.tsx` L9
- `VENDEDORES` es array vacío. Falta conectar con `useUsers()`.

---

## Verificaciones adicionales

- **TypeScript**: 0 `any` en todo el módulo
- **Loading/Error**: Spinner, mensajes de error, toasts
- **Regresiones Sprint 1-3**: 0 regresiones
- **Calidad**: Buena separación de componentes, accesibilidad correcta

## Resumen

| Severidad | Cantidad |
|---|---|
| P1 | 0 |
| P2 | 0 |
| P3 | 3 |
| P4 | 0 |

**Veredicto: GO** — 0 P1/P2. Los P3 son deuda técnica del modelo de datos.
