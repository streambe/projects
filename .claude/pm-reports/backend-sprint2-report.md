# Reporte: Backend Sprint 2 — CRM Ciudad Moto

**Rol**: Backend Developer
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos

### Modificados
- `src/modules/activities/activities.schema.ts` — agregado filtro `overdue` al schema de query
- `src/modules/activities/activities.service.ts` — implementado filtro `overdue` y ordenamiento dual (pendiente/realizada)

### Creados
- `src/modules/communications/communications.schema.ts`
- `src/modules/communications/communications.service.ts`
- `src/modules/communications/communications.routes.ts`
- `src/modules/communications/providers/gmail.provider.ts`
- `src/modules/communications/providers/whatsapp.provider.ts`
- `src/modules/reports/reports.schema.ts`
- `src/modules/reports/reports.service.ts`
- `src/modules/reports/reports.routes.ts`
- `src/app.ts` — registradas todas las nuevas rutas

## Resumen de lo realizado

### US-014 — Filtros de actividades (RF-16)
- Agregado `?overdue=true` al `ListActivitiesQuerySchema` con transformacion string→boolean
- El filtro overdue fuerza `status=pendiente` y `dueAt < now()`
- Implementado ordenamiento dual: cuando no hay filtro de status se hace doble query (pendiente por `scheduledAt asc`, realizada por `updatedAt desc`) y se fusionan antes de aplicar paginacion
- Misma logica aplicada a `listByClient`

### US-019 a US-025 — Modulo Comunicaciones (RF-18 a RF-24)
- Interfaces `GmailProvider` y `WhatsAppProvider` con implementaciones mock que loguean `MOCK: would send to [destino]`
- `CommunicationsService` con 8 metodos cubriendo todos los RF
- Al enviar (email o WhatsApp) se persiste en tabla `messages` con `direction: outbound`
- Al consultar inbox/incoming se hace `upsert` por `(channel, externalId)` para idempotencia; se auto-vincula si `fromAddress`/`fromNumber` coincide con un cliente activo
- `GET /api/v1/clients/:clientId/messages` registrado como ruta anidada bajo clients prefix (igual al patron existente de activities y opportunities)

### US-026 a US-028 — Modulo Reportes (RF-25, RF-26)
- `GET /api/v1/reports/new-clients` — query con filtro de rango por `createdAt`, retorna `{ total, clients: [{ id, fullName, createdAt, source }] }`
- `GET /api/v1/reports/activities-by-user` — agrupacion en memoria por `responsibleUserId`, retorna `{ users: [{ userId, name, total, byType }] }` ordenado por total desc

## Decisiones tomadas

- **Ordenamiento dual de actividades via doble query**: Prisma no soporta `ORDER BY CASE WHEN status='pendiente' THEN ... END` nativamente sin `$queryRaw`. La solucion de doble query es type-safe, testeable y evita SQL crudo. Aplica paginacion post-merge sobre el conjunto completo.
- **Idempotencia en inbox/incoming via upsert**: Usar `upsert` por `(channel, externalId)` previene duplicados si el endpoint se llama multiples veces. Esto respeta el unique constraint ya definido en el schema de Prisma.
- **Auto-vinculacion en ingesta de mensajes**: Al crear mensajes inbound se busca cliente por `email` o `whatsappNumber` y se vincula automaticamente. Simplifica el flujo de la bandeja de entrada.
- **Agregacion en memoria para reportes**: Los reportes no tienen SLA de performance definido en el MVP. La agregacion en memoria es mas simple y evita SQL complejo. Si el volumen crece se puede migrar a `GROUP BY` con `prisma.$queryRaw`.
- **Tipo explicito en map callback**: TypeScript strict mode con `noUnusedLocals` requiere tipos explicitos cuando Prisma infiere el select en contexto de metodo encadenado. Se agrego tipo inline.

## Bloqueantes / Riesgos

- El ordenamiento dual de actividades carga todos los registros de pendiente y realizada en memoria antes de paginar. Con volumenes grandes (>10k actividades) esto puede ser un problema. Mitigacion futura: migrar a `$queryRaw` con `ORDER BY CASE`.
- Los providers mock no persisten estado entre llamadas; el inbox siempre retorna los mismos 3 mensajes simulados. Esto es intencional para el sprint actual.

## Recomendaciones para el siguiente rol

- **Frontend**: Los endpoints de comunicaciones siguen el mismo patron de respuesta `{ data: ... }` que el resto de la API. El endpoint `GET /api/v1/communications/accounts` retorna mock config con campos `gmail.connected` y `whatsapp.connected` para mostrar estado de vinculacion.
- **DevOps/DB**: No se requieren migraciones nuevas. La tabla `messages` ya existia en el schema de Prisma Sprint 1. Verificar que la migracion este aplicada en el ambiente de staging.
- **QA**: Probar `?overdue=true` combinado con `?assignedTo=` para validar que ambos filtros se combinan correctamente. El filtro overdue sobreescribe cualquier `?status` pasado en la query.
