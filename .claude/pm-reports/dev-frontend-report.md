# Reporte: Vista Kanban del Pipeline (RF-11) — Sprint 4
**Rol**: Dev Frontend
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos
- `projects/crm/frontend/src/modules/pipeline/components/KanbanColumn.tsx` — columna del Kanban con droppable zone
- `projects/crm/frontend/src/modules/pipeline/components/KanbanDraggableCard.tsx` — wrapper draggable para KanbanCard
- `projects/crm/frontend/src/modules/pipeline/components/KanbanBoard.tsx` — tablero completo con DndContext, 4 columnas, drag & drop
- `projects/crm/frontend/src/modules/pipeline/components/CloseOpportunityDialog.tsx` — dialog modal para cerrar oportunidad (ganado/perdido)
- `projects/crm/frontend/src/modules/pipeline/pages/PipelinePage.tsx` — pagina contenedora con filtros y titulo
- `projects/crm/frontend/src/App.tsx` — ruta `/pipeline` registrada (reemplazo del placeholder)
- `projects/crm/frontend/INSTALL_DEPENDENCIES.md` — nota de dependencias faltantes

## Resumen de lo realizado
Implementacion completa de la vista Kanban del Pipeline segun el wireframe aprobado (seccion 4). El tablero muestra 4 columnas (Consulta, Prueba de manejo, Presupuesto, Cierre) con drag & drop entre ellas usando @dnd-kit/core. Al soltar una card en la columna Cierre se abre un dialog que pide resultado (ganado/perdido) y motivo si es perdido. La pagina incluye filtros por vendedor y sucursal en la barra superior. Se reutilizan el KanbanCard existente y el hook usePipeline con sus queries/mutations.

## Decisiones tomadas
- Se creo un componente KanbanDraggableCard como wrapper sobre KanbanCard para separar la logica de drag del componente visual puro — esto mantiene KanbanCard testeable sin dependencia de dnd-kit
- Se uso api.patch directamente en KanbanBoard + queryClient.invalidateQueries en vez de crear un hook por cada operacion, ya que useChangeStage requiere un id fijo y el board necesita cambiar multiples oportunidades
- Colores por columna: sky (consulta), amber (prueba manejo), violet (presupuesto), emerald (cierre) — diferenciacion visual clara siguiendo el patron de la app
- DragOverlay con rotacion sutil (rotate-2) para feedback visual durante el drag
- El CloseOpportunityDialog es un modal propio (no shadcn Dialog) porque no hay componentes ui/ de shadcn instalados en el proyecto — se uso el mismo patron de inputs/botones que el resto de la app

## Bloqueantes / Riesgos
- **BLOQUEANTE**: `@dnd-kit/core` y `@dnd-kit/utilities` NO estan en package.json. Hay que instalarlos antes de que compile: `npm install @dnd-kit/core @dnd-kit/utilities`
- Los filtros de vendedor y sucursal estan preparados pero con arrays vacios — necesitan hooks useUsers() y useBranches() que el backend debe exponer
- El campo de valor monetario total por columna esta preparado en KanbanColumn pero muestra 0 porque el modelo Opportunity no tiene un campo de monto — cuando se agregue, solo hay que sumar en el componente

## Recomendaciones para el siguiente rol
- **DevOps/Lider Tecnico**: Instalar dnd-kit antes de hacer build: `npm install @dnd-kit/core @dnd-kit/utilities`
- **Tester QA**: Verificar drag & drop entre columnas, especialmente el caso Cierre que debe abrir el dialog. Verificar que el dialog no permite confirmar sin seleccionar resultado, y que "perdido" exige motivo
- **Dev Backend**: Exponer endpoints GET /users y GET /branches para popular los filtros del Pipeline
