# Reporte: Wireframes MVP LeadGen
**Rol**: UI/UX Designer (Leonardo Da Vinci)
**Fecha**: 2026-04-03
**Estado**: En progreso (pendiente aprobacion del usuario)

## Entregables producidos
- `projects/leadgen/docs/ux-wireframe.md` — Wireframes completos + especificaciones UI

## Pantallas disenadas
| Pantalla | Estado diseno | Estado implementacion |
|----------|--------------|----------------------|
| Login | DRAFT - Iteracion 1 | Pendiente |
| Dashboard | DRAFT - Iteracion 1 | Pendiente |
| Pipeline Kanban | DRAFT - Iteracion 1 | Pendiente |
| Detalle de Lead (Sheet) | DRAFT - Iteracion 1 | Pendiente |
| Import de Leads | DRAFT - Iteracion 1 | Pendiente |
| Acciones del dia | DRAFT - Iteracion 1 | Pendiente |
| Secuencias | DRAFT - Iteracion 1 | Pendiente |
| Templates | DRAFT - Iteracion 1 | Pendiente |
| Gmail | EXCLUIDA (v2) | N/A |

## Resumen de lo realizado
Wireframes ASCII para las 8 pantallas del MVP, paleta de colores, tipografia, sistema de navegacion (sidebar), componentes reutilizables (lead card, score badge, alerta, timeline), estados de componentes, mapa de navegacion y prioridades de implementacion.

## Decisiones de diseno tomadas
- Sidebar fija izquierda (no top nav) — mejor para 6+ secciones
- Detalle de lead como Sheet lateral (no pagina completa) — mantiene contexto del pipeline
- Body 14px (no 16px) — densidad alta para herramienta interna
- NO responsive mobile — solo desktop 1280px+, herramienta interna
- Gmail excluida del MVP — alineado con spec funcional (email es v2)
- Score con colores de 5 rangos (frio/tibio/MQL/SQL/HOT)
- shadcn/ui como base de componentes — consistencia y velocidad

## Bloqueantes / Riesgos
- Ninguno

## Recomendaciones para el siguiente rol
- Frontend dev: usar shadcn/ui con los componentes listados en seccion 1.5
- Para drag & drop del Kanban: usar @dnd-kit o react-beautiful-dnd
- Lead detail como Sheet de shadcn (no Dialog) — 600px ancho
- Si el tiempo aprieta: simplificar dashboard (solo numeros, sin graficos) y secuencias (CRUD basico sin timeline visual)
