# Reporte: TASK-S3-01 y TASK-S3-04 — Sprint 3

**Rol**: Dev Backend
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos

- `projects/crm/backend/src/modules/communications/communications.service.ts` — mapeo `sentReceivedAt` → `sentAt`
- `projects/crm/backend/src/modules/reports/reports.schema.ts` — validación de rango `from <= to`

## Resumen de lo realizado

### TASK-S3-01: BUG-006 — Campo `sentAt` en mensajes

El modelo `Message` en Prisma define el campo con nombre `sentReceivedAt` (mapeado a `sent_received_at` en la BD). El frontend espera `sentAt` según la interfaz `Message` en `communications.types.ts`.

Los dos métodos que retornan objetos `Message` directamente desde Prisma eran `getClientMessages` y `getUnlinkedMessages`. Se agregó un `.map()` en ambos que desestructura `sentReceivedAt` del objeto Prisma y lo re-expone como `sentAt` (ISO string), eliminando el campo original del objeto retornado.

El import de tipo `PrismaMessage` se resolvió desde `node_modules/.prisma/client` porque el módulo local `src/prisma/client.ts` usa `require()` y no re-exporta los tipos generados.

### TASK-S3-04: Validación rango de fechas en reportes

Se agregó `.refine()` al `DateRangeQuerySchema` en `reports.schema.ts`. La validación se activa solo cuando ambos campos `from` y `to` están presentes y verifica `new Date(from) <= new Date(to)`. Si falla, retorna el mensaje `"'from' must be before or equal to 'to'"`.

El manejo de error ya existía en `reports.routes.ts`: ambos endpoints usan `safeParse` y retornan 400 con `VALIDATION_ERROR` cuando el parse falla, incluyendo los errores de `.refine()`. No fue necesario cambiar las rutas.

## Decisiones tomadas

- Solo `getClientMessages` y `getUnlinkedMessages` exponen objetos `Message` crudos de Prisma al exterior. Los métodos `sendEmail` y `sendWhatsApp` retornan `{ sent, messageId }` — no exponen el campo directamente, por lo que no requieren mapeo.
- Se usó `.toISOString()` para serializar la fecha, consistente con el tipo `sentAt: string` del frontend.
- El `.refine()` retorna `true` si alguno de los dos campos está ausente (ambos son opcionales), lo que mantiene el comportamiento existente para consultas sin rango.

## Bloqueantes / Riesgos

- **Pre-existing bug fuera de scope**: `communications.service.ts` línea 83 tiene un error TypeScript previo — `body.subject` es `string | undefined` pero `gmailProvider.sendEmail()` espera `string`. `tsc --noEmit` reporta este error antes y después de nuestros cambios. Requiere atención en una task separada.

## Recomendaciones para el siguiente rol

- El Tester QA puede verificar BUG-006 llamando a `GET /api/v1/clients/:id/messages` — la respuesta ahora incluye `sentAt` en lugar de `sentReceivedAt`.
- Para TASK-S3-04: probar `GET /api/v1/reports/new-clients?from=2026-12-31T00:00:00.000Z&to=2026-01-01T00:00:00.000Z` debe retornar HTTP 400 con `message: "'from' must be before or equal to 'to'"`.
- El bug pre-existente en `sendEmail` (subject opcional vs. parámetro requerido) debería abrirse como tarea separada para el próximo sprint.
