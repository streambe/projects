# Reporte: US-011 — Vista Kanban del Pipeline de Ventas

**Rol**: Frontend Developer
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos

- `src/shared/components/ui/sheet.tsx` — componente Sheet (panel lateral deslizante) construido sobre @radix-ui/react-dialog existente, con variantes por lado (right/left/top/bottom)
- `src/modules/pipeline/hooks/usePipeline.ts` — TanStack Query hooks: useOpportunities, useOpportunity, useCreateOpportunity, useUpdateOpportunityStage + tipos OpportunityWithDetails, CreateOpportunityPayload, UpdateStagePayload
- `src/modules/pipeline/components/KanbanCard.tsx` — tarjeta arrastrable con useSortable de @dnd-kit/sortable; muestra nombre del cliente, moto, valor estimado, fecha con indicadores AlertTriangle (vencido) y Clock (vence en 3 dias); overlay separado para el drag ghost
- `src/modules/pipeline/components/KanbanColumn.tsx` — columna con useDroppable, header con count badge y total en formato compacto, zona de drop con SortableContext, colores de acento por etapa, botón "+ Agregar"
- `src/modules/pipeline/components/KanbanBoard.tsx` — tablero principal con DndContext, manejo de dragStart/dragOver/dragEnd, estado optimista de reordenamiento, intercepción especial al mover a CIERRE para abrir CloseOpportunityDialog, filtro por usuario
- `src/modules/pipeline/components/OpportunitySheet.tsx` — panel lateral con Sheet mostrando todos los detalles de la oportunidad (moto, vendedor, valor, fecha, stage, notas, motivo de pérdida) y botón "Ver cliente completo" que navega a /clientes/:id
- `src/modules/pipeline/components/OpportunityForm.tsx` — dialog de creación con react-hook-form + zod: campos client_id, moto_interest, stage (select), estimated_value, due_date, notes; defaultStage prop para pre-seleccionar etapa
- `src/modules/pipeline/components/CloseOpportunityDialog.tsx` — modal de cierre con selección visual Ganado/Perdido (botones con iconos Trophy/XCircle), textarea condicional para motivo de pérdida
- `src/modules/pipeline/pages/PipelinePage.tsx` — reemplaza el stub existente; integra KanbanBoard, filtro por vendedor con Select, botón "Nueva oportunidad" global, estados loading/error, hint bar

La ruta `/pipeline` ya estaba registrada en `App.tsx` — no fue necesario modificarlo.

## Resumen de lo realizado

Implementacion completa de la vista Kanban del pipeline de ventas con los 8 componentes/hooks requeridos. El tablero soporta drag & drop entre las 4 columnas fijas via @dnd-kit con estado optimista, detalle en panel lateral deslizante, creacion de oportunidades desde cualquier columna, y flujo especial de cierre con confirmacion de resultado Ganado/Perdido.

## Decisiones tomadas

- **Sheet sin dependencia nueva**: @radix-ui/react-sheet no estaba instalado. Construi el Sheet reutilizando @radix-ui/react-dialog ya presente, con una variante cva para el slide lateral. Evita agregar dependencias innecesarias.
- **Estado optimista en KanbanBoard**: El drag&drop actualiza el estado visual inmediatamente (via orderedIds) antes de esperar la respuesta del servidor. Si el servidor falla, la siguiente invalidacion de query revierte al estado real.
- **Intercepcion al mover a CIERRE**: En handleDragOver se permite el movimiento visual, pero en handleDragEnd se revierte el estado optimista y se abre el CloseOpportunityDialog. Solo se persiste la mutacion al confirmar.
- **Sensor con distancia minima**: PointerSensor configurado con activationConstraint: { distance: 8 } para que el click en tarjeta no active el drag accidentalmente. El boton de click en KanbanCard usa onPointerDown stopPropagation para no interferir con el drag listener del useSortable.
- **OpportunityWithDetails extiende Opportunity**: Se agregan campos opcionales (estimated_value, due_date, notes) que la API puede retornar pero no estan en el tipo base. Retrocompatible.
- **client_id como input texto**: En un CRM de produccion este campo seria un combobox con busqueda de clientes. Se dejo como input de UUID con nota explicativa para que el proximo desarrollador lo mejore con un selector apropiado.

## Bloqueantes / Riesgos

- El tipo `Opportunity` en `shared/types` no incluye `estimated_value`, `due_date` ni `notes`. Se extienden en `OpportunityWithDetails` en el hook. Si el backend no los retorna, las tarjetas simplemente no muestran esos datos (graceful degradation).
- La API `GET /api/v1/opportunities` se llama con `{ is_open: true }` — si el backend no soporta este filtro exactamente, puede retornar todas las oportunidades incluyendo cerradas. Ajustar el parametro segun la implementacion real del backend.
- El campo `client_id` en OpportunityForm es un input de UUID crudo. Se recomienda reemplazarlo con un componente Combobox con busqueda de clientes cuando el modulo de clientes tenga un endpoint de busqueda rapida.

## Recomendaciones para el siguiente rol

- Agregar un componente `ClientCombobox` reutilizable en `src/shared/components/` para el campo de seleccion de clientes en OpportunityForm.
- Considerar agregar `estimated_value`, `due_date` y `notes` al tipo `Opportunity` en `shared/types/index.ts` una vez confirmada la API del backend.
- La vista no implementa edicion de oportunidades existentes — solo creacion. Si US-012 lo requiere, el OpportunityForm ya acepta props para modo edicion con valores iniciales.
- El bundle es un chunk unico de 637KB. Considerar code-splitting con next/dynamic o React.lazy para los modulos pesados (dnd-kit contribuye ~50KB).
