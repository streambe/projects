# Reporte: US-013 Actividades UI + Correccion de ruta de backend
**Rol**: Frontend Developer
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos

### Tarea 1 — Backend relocation
- Backend copiado a `projects/crm/backend/` (src, prisma, package.json, tsconfig, README)
- Nota: node_modules y dist fueron excluidos intencionalmente (se regeneran con `npm install` / `npm run build`)

### Tarea 2 — US-013 Actividades UI
- `crm/frontend/src/modules/activities/hooks/useActivities.ts` — TanStack Query hooks
- `crm/frontend/src/modules/activities/components/ActivityForm.tsx` — formulario RHF + Zod
- `crm/frontend/src/modules/activities/components/ActivityFormDialog.tsx` — dialog wrapper
- `crm/frontend/src/modules/activities/components/ActivityList.tsx` — lista con overdue highlight y complete dialog
- `crm/frontend/src/modules/clients/pages/ClientProfilePage.tsx` — integrado con ActivityList + ActivityFormDialog

## Resumen de lo realizado

Se implemento la UI completa para gestionar actividades desde el perfil del cliente. Los hooks cubren fetch, creacion y marcado como realizada. El formulario valida tipo, titulo y fecha/hora con Zod. La lista ordena pendientes primero (por fecha ascendente) y realizadas despues (por fecha descendente), con highlight visual en amber para actividades vencidas y pendientes. El dialog de completar permite agregar notas. La integracion en ClientProfilePage reemplaza el placeholder del tab "Actividad" con el componente real y un boton controlado para abrir el form dialog.

## Decisiones tomadas

- **Controlled dialog en ClientProfilePage**: Se uso el patron open/onOpenChange con useState en vez de trigger prop, para mayor control y evitar anidamiento innecesario.
- **Sorting en cliente**: El ordenamiento de actividades se hace en el frontend para evitar dependencia de parametros de query adicionales en el backend.
- **Overdue logic**: Usa `due_at` si existe, sino `scheduled_at` como referencia para determinar si esta vencida.
- **CompleteDialog inline en ActivityList**: El dialog de completar es un componente local en ActivityList para mantener el estado de notas aislado por item, sin lifting innecesario.
- **TypeScript limpio**: `npx tsc --noEmit` pasa sin errores.

## Bloqueantes / Riesgos

- El backend copiado en `projects/crm/backend/` no tiene `node_modules` ni `dist`. Antes de ejecutarlo hay que correr `npm install` y `npm run build` en esa ruta.
- Los endpoints del backend (`GET /api/v1/clients/:clientId/activities`, `POST /api/v1/activities`, `PUT /api/v1/activities/:id/complete`) deben estar implementados y funcionando para que la UI responda correctamente.

## Recomendaciones para el siguiente rol

- Verificar que la respuesta de `GET /api/v1/clients/:clientId/activities` retorna un array de `Activity[]` directamente (no paginado), ya que el hook lo espera asi.
- Si el backend retorna un objeto paginado, actualizar `fetchClientActivities` en `useActivities.ts` para extraer `.data`.
- El campo `client_id` en la respuesta de `POST /api/v1/activities` es necesario para invalidar el query cache correctamente — confirmar que el backend lo incluye en la respuesta.
- Considerar agregar toast notifications (ya existe `@radix-ui/react-toast` en las deps) al completar o crear una actividad exitosamente.
