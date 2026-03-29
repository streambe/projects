# Reporte: QA Re-verificacion Final — Sprint 3
**Rol**: Tester QA
**Fecha**: 2026-03-29
**Estado**: Completado

---

## Veredicto Final: NO-GO

BUG-S3-01 persiste con una nueva forma. El HTTP method fue corregido de PATCH a PUT,
pero el endpoint usado sigue siendo incorrecto. La funcionalidad de marcar actividades
como realizadas aun no funciona en runtime.

---

## Resultado por bug reportado

---

### BUG-S3-01 | P2 | PERSISTE (nueva forma)

**Descripcion original**: `useMarkActivityDone` usaba `api.patch` pero el backend solo registra PUT.

**Correccion aplicada**: `api.patch` fue cambiado a `api.put` en `useActivities.ts` linea 77.
El metodo HTTP es ahora correcto.

**Estado**: PERSISTE — el endpoint destino sigue siendo incorrecto.

**Razon**: La correccion apunto a `PUT /activities/:id`, que llama a `ActivitiesService.update()`.
Sin embargo, ese metodo NO escribe `status` en la base de datos. El schema de validacion
`UpdateActivitySchema` (`activities.schema.ts` lineas 32-43) no incluye el campo `status`,
por lo que Zod lo descarta silenciosamente antes de que llegue al servicio. El Prisma update
resultante ignora el campo y la actividad permanece en estado `pendiente`.

El endpoint correcto para marcar una actividad como realizada es:

```
PUT /activities/:id/complete
```

Este endpoint llama a `ActivitiesService.complete()` (`activities.service.ts` lineas 294-315),
que si escribe `status: 'realizada'` directamente en la base de datos e incluye validacion
de idempotencia (lanza 400 si ya estaba realizada).

**Evidencia**:
- `activities.schema.ts` lineas 32-43: `UpdateActivitySchema` — sin campo `status`
- `activities.service.ts` linea 276-283: bloque `data:` del `prisma.activity.update` — sin `status`
- `activities.service.ts` lineas 305-311: `ActivitiesService.complete()` — si escribe `status: 'realizada'`
- `activities.routes.ts` lineas 119-130: ruta `PUT /:id/complete` — registrada y autenticada

**Fix requerido**:

En `useActivities.ts` linea 77, cambiar el endpoint de:
```typescript
const { data } = await api.put<{ data: Activity }>(`/activities/${id}`, input);
```
a:
```typescript
const { data } = await api.put<{ data: Activity }>(`/activities/${id}/complete`, {});
```

La variable `input` con `{ status: 'realizada' }` puede eliminarse ya que el endpoint
`/complete` no requiere body (el schema `CompleteActivitySchema` solo acepta `summary` opcional).

---

### BUG-S3-02 | P2 | RESUELTO

**Descripcion original**: Filtros de fecha enviaban `YYYY-MM-DD` pero el backend valida ISO datetime.

**Correccion aplicada**: `ActivitiesPage.tsx` lineas 70-71 ahora construyen:
- `dateFrom: \`${dateFrom}T00:00:00.000Z\``
- `dateTo: \`${dateTo}T23:59:59.999Z\``

**Verificacion**:
- Linea 70: `...(dateFrom && { dateFrom: \`${dateFrom}T00:00:00.000Z\` })` — correcto
- Linea 71: `...(dateTo && { dateTo: \`${dateTo}T23:59:59.999Z\` })` — correcto
- El schema del backend (`activities.schema.ts` linea 64-65) valida con `z.string().datetime()`
  que acepta el formato `YYYY-MM-DDTHH:mm:ss.sssZ`
- El servicio usa `new Date(query.dateFrom)` para construir el filtro de Prisma — compatible

**Sin regresiones**: La logica adyacente de los filtros `status`, `type`, `assignedTo` y
`overdue` no fue modificada y permanece intacta.

**Resultado**: RESUELTO.

---

### BUG-S3-03 | P3 | RESUELTO

**Descripcion original**: `linkMessage` retornaba el objeto crudo de Prisma con `sentReceivedAt`
expuesto sin aplicar el mapeo a `sentAt`.

**Correccion aplicada**: `communications.service.ts` lineas 277-278:
```typescript
const { sentReceivedAt, ...rest } = updated;
return { ...rest, sentAt: sentReceivedAt.toISOString() };
```

**Verificacion**:
- El patron de destructuring es identico al usado en `getClientMessages` (lineas 226-227)
  y en `getUnlinkedMessages` (lineas 242-243)
- `sentReceivedAt` queda excluido del objeto retornado
- `sentAt` se expone como string ISO, consistente con los otros metodos

**Sin regresiones**: Los metodos `getClientMessages`, `getUnlinkedMessages`, `sendEmail`,
`sendWhatsApp`, `getEmailInbox` y `getWhatsAppIncoming` no fueron modificados.
Se verifico que cada uno sigue aplicando el mapeo correctamente o que no retornan
el campo `sentReceivedAt` expuesto.

**Resultado**: RESUELTO.

---

## Tabla resumen

| Bug ID | Severidad | Estado anterior | Estado actual | Veredicto |
|--------|-----------|-----------------|---------------|-----------|
| BUG-S3-01 | P2 | ABIERTO (api.patch) | PERSISTE (api.put endpoint incorrecto) | BLOQUEANTE |
| BUG-S3-02 | P2 | ABIERTO | RESUELTO | OK |
| BUG-S3-03 | P3 | ABIERTO | RESUELTO | OK |

---

## Nuevo bug identificado en la re-verificacion

### BUG-S3-04 | P2 | `useMarkActivityDone` apunta a `PUT /activities/:id` en lugar de `PUT /activities/:id/complete`

**Archivo**: `projects/crm/frontend/src/modules/activities/hooks/useActivities.ts` linea 77

**Descripcion**: Ver analisis completo en BUG-S3-01 arriba. Este bug es la continuacion
directa del fix incompleto de BUG-S3-01. Se registra con nuevo ID para diferenciar
la causa raiz (endpoint incorrecto vs metodo HTTP incorrecto).

**Severidad**: P2 — la funcionalidad principal "Marcar realizada" no produce efecto en la base de datos.

**Fix exacto**:
```typescript
// Linea 75-77 actual:
mutationFn: async (id: string) => {
  const input: UpdateActivityInput = { status: 'realizada' };
  const { data } = await api.put<{ data: Activity }>(`/activities/${id}`, input);

// Debe quedar:
mutationFn: async (id: string) => {
  const { data } = await api.put<{ data: Activity }>(`/activities/${id}/complete`, {});
```

**Condicion de GO**: resolver BUG-S3-04 (que es BUG-S3-01 con el fix correcto).

---

## Condiciones para GO

- [ ] BUG-S3-04: cambiar endpoint a `/activities/${id}/complete` en `useActivities.ts` linea 77
- [x] BUG-S3-02: RESUELTO
- [x] BUG-S3-03: RESUELTO

---

## Entregables producidos
- `.claude/pm-reports/tester-report-sprint3.md` (este archivo, actualizacion final)

## Decisiones tomadas
- BUG-S3-01 reclasificado como PERSISTE: el cambio de PATCH a PUT es correcto pero insuficiente.
  El endpoint `/activities/:id` no puede completar una actividad porque su schema excluye `status`.
- BUG-S3-04 registrado como nuevo ID para rastrear el fix correcto pendiente.
- BUG-S3-02 y BUG-S3-03 confirmados como RESUELTOS sin regresiones detectadas.

## Bloqueantes activos
- BUG-S3-04 bloquea el GO. Es un fix de una sola linea en el frontend.

## Recomendaciones para Dev
- `useActivities.ts` linea 77: reemplazar `` `/activities/${id}` `` por `` `/activities/${id}/complete` ``
  y eliminar el objeto `input` con `{ status: 'realizada' }` (ya no es necesario).
- El endpoint `PUT /activities/:id/complete` ya existe, esta autenticado y funciona correctamente.
  No se requiere ningun cambio en el backend.
- Tras el fix, correr el test de humo: click en "Marcar realizada" → la fila debe cambiar
  de badge "Pendiente" a "Realizada" sin recargar la pagina (React Query invalida el cache
  via `queryClient.invalidateQueries`).
