# Reporte: APIs Clientes, Oportunidades y Actividades (US-006, US-010, US-012)
**Rol**: Backend Developer
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos

### US-006 — Clientes
- `src/modules/clients/clients.schema.ts` — Validaciones Zod: CreateClientSchema, UpdateClientSchema, ListClientsQuerySchema
- `src/modules/clients/clients.service.ts` — Lógica de negocio: CRUD + detección de duplicados
- `src/modules/clients/clients.routes.ts` — Plugin Fastify: 5 endpoints REST

### US-010 — Oportunidades
- `src/modules/opportunities/opportunities.schema.ts` — Validaciones Zod con superRefine para regla de cierre
- `src/modules/opportunities/opportunities.service.ts` — Lógica con transacciones para historial de etapas
- `src/modules/opportunities/opportunities.routes.ts` — Plugin Fastify + export `clientOpportunityRoutes`

### US-012 — Actividades
- `src/modules/activities/activities.schema.ts` — Validaciones Zod con filtros de fecha/estado/tipo
- `src/modules/activities/activities.service.ts` — Lógica CRUD + marcar como realizada
- `src/modules/activities/activities.routes.ts` — Plugin Fastify + export `clientActivityRoutes`

### Modificado
- `src/app.ts` — Registradas todas las rutas nuevas bajo `/api/v1`

## Resumen de lo realizado

Se implementaron los 3 módulos principales del CRM siguiendo exactamente el patrón del módulo `auth` existente. Cada módulo tiene schema (Zod), service (Prisma) y routes (Fastify plugin). El TypeScript compila sin errores (`tsc --noEmit` y `tsc` limpios).

Endpoints implementados:

**Clientes (US-006):**
- `POST /api/v1/clients` — crear con detección de duplicados (DNI, phonePrimary)
- `GET /api/v1/clients` — listar con paginación, búsqueda full-text, filtro isActive
- `GET /api/v1/clients/:id` — obtener con últimas 10 oportunidades y 10 actividades
- `PUT /api/v1/clients/:id` — editar con re-validación de duplicados si cambia DNI/teléfono
- `DELETE /api/v1/clients/:id` — baja lógica (isActive = false)

**Oportunidades (US-010):**
- `POST /api/v1/opportunities` — crear vinculada a cliente
- `GET /api/v1/opportunities` — listar (kanban) con filtro stage/isOpen
- `GET /api/v1/clients/:clientId/opportunities` — oportunidades de un cliente
- `PUT /api/v1/opportunities/:id/stage` — cambiar etapa + registro en opportunity_history (transacción)
- `PUT /api/v1/opportunities/:id` — editar campos generales
- `DELETE /api/v1/opportunities/:id` — eliminar (cascade: borra history primero)

**Actividades (US-012):**
- `POST /api/v1/activities` — crear
- `GET /api/v1/activities` — listar con filtros (status, type, assignedTo, dateFrom, dateTo)
- `GET /api/v1/clients/:clientId/activities` — actividades de un cliente
- `PUT /api/v1/activities/:id` — editar
- `PUT /api/v1/activities/:id/complete` — marcar como realizada con notas opcionales
- `DELETE /api/v1/activities/:id` — eliminar

## Decisiones tomadas

- **Formato de error uniforme**: `{ error: { code, message, details? } }` en todos los módulos, consistente con el spec.
- **Formato de lista**: `{ data: [], meta: { page, limit, total, totalPages } }` usando la utilidad `buildPaginatedResult` existente.
- **409 en duplicados**: Incluye `conflict: { id, fullName }` en la respuesta según especificación US-006.
- **Rutas anidadas como exports separados**: `clientOpportunityRoutes` y `clientActivityRoutes` se exportan como plugins independientes y se registran con prefix `/clients` en app.ts para evitar conflictos con las rutas base de cada módulo.
- **Transacción para changeStage**: Se usa `prisma.$transaction(async tx => {...})` para crear el registro en `opportunity_history` y actualizar la oportunidad de forma atómica.
- **Import tipo Prisma**: Se importa `type { Prisma } from '.prisma/client'` porque el cliente usa `require()` en lugar de ES imports, por lo que `@prisma/client` no re-exporta el namespace correctamente bajo `moduleResolution: node`.
- **Detección de duplicados solo si cambia el campo**: En PUT /clients/:id, la validación de duplicados solo se activa si el DNI o teléfono cambia respecto al valor existente, evitando falsos positivos al editar otros campos.
- **Cierre de oportunidades**: Al cambiar a stage `cierre`, la oportunidad se marca como `isOpen = false` y se almacena `result` y `lossReason`. No se permite cambiar etapa de una oportunidad ya cerrada (ValidationError 400).

## Bloqueantes / Riesgos

- No hay base de datos disponible para pruebas de integración en este entorno. Los endpoints están listos para testear en cuanto se configure `DATABASE_URL` en `.env`.
- El seed (`prisma/seed.ts`) no fue revisado — puede requerir datos de ejemplo para probar flujos completos.

## Recomendaciones para el siguiente rol

- **Frontend / QA**: Los enums del schema Prisma son en minúsculas (`consulta`, `cierre`, `ganado`, `perdido`, `llamada`, etc.). Asegurarse de enviar los valores exactos.
- Para el kanban (GET /opportunities), usar el filtro `isOpen=true` para mostrar solo oportunidades activas.
- El header de autenticación debe ser `Authorization: Bearer <access_token>` en todos los endpoints de los 3 módulos.
- Las rutas `/clients/:clientId/opportunities` y `/clients/:clientId/activities` aceptan los mismos query params de paginación que las rutas base.
- Considerar agregar índices en `opportunity_history.changed_at` si se necesita historial paginado en el futuro.
