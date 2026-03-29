# Reporte: Bugfix Sprint 1 — CRM Ciudad Moto (P1 + P2)
**Rol**: Backend Developer
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos

| Archivo | Bugs corregidos |
|---------|----------------|
| `src/modules/auth/auth.routes.ts` | BUG-002, BUG-011 |
| `src/modules/auth/auth.service.ts` | BUG-011 |
| `src/modules/auth/auth.schema.ts` | BUG-011 |
| `src/modules/clients/clients.service.ts` | BUG-003 |
| `src/server.ts` | BUG-004 |
| `src/modules/opportunities/opportunities.service.ts` | BUG-005, BUG-009, BUG-010 |
| `src/modules/opportunities/opportunities.schema.ts` | BUG-007, BUG-010 |
| `src/modules/opportunities/opportunities.routes.ts` | BUG-009 |
| `src/modules/activities/activities.service.ts` | BUG-006, BUG-008, BUG-009 |
| `src/modules/activities/activities.schema.ts` | BUG-009 |
| `src/modules/activities/activities.routes.ts` | BUG-009 |

## Resumen de lo realizado

Se corrigieron todos los bugs P1 y P2 identificados por el Tester QA en el Sprint 1. La verificación final con `tsc --noEmit` fue exitosa — cero errores de TypeScript.

## Decisiones tomadas

**BUG-002 (register sin auth):**
- Agregado `preHandler: [fastify.authenticate]` al endpoint `POST /register`. Solo usuarios con sesion activa pueden crear nuevos usuarios.

**BUG-003 (race condition duplicados):**
- Extraida funcion `findDuplicateInTx` que opera sobre un `Prisma.TransactionClient`.
- El bloque `findDuplicate + create` en `ClientsService.create` ahora corre dentro de `prisma.$transaction()`.
- Se captura el error Prisma P2002 (unique constraint) en el `catch` externo: si otro request gana la carrera, se recupera el cliente conflictivo y se relanza como `ConflictError` HTTP 409.

**BUG-004 (graceful shutdown):**
- Eliminados los handlers globales de `SIGINT`/`SIGTERM` que llamaban `buildApp()` generando una segunda instancia.
- Los handlers ahora se registran DENTRO de `start()`, usando el closure sobre la instancia `app` ya inicializada.

**BUG-005/006 (cliente inactivo en oportunidades/actividades):**
- En `OpportunitiesService.create` y `ActivitiesService.create` se cambio el select del cliente a `{ id, isActive }`.
- Si `!client || !client.isActive` → `NotFoundError("Cliente no encontrado o inactivo")` que produce HTTP 404.

**BUG-007 (motoInterest opcional vacia):**
- Cambiado `z.string().optional()` a `z.string().min(1, 'motoInterest must not be empty').optional()` en `CreateOpportunitySchema`. Permite omitir el campo pero rechaza cadena vacía.

**BUG-008 (completar actividad ya completada):**
- En `ActivitiesService.complete`, luego de obtener la actividad se verifica `activity.status === 'realizada'`. Si ya esta completada → `ValidationError("La actividad ya fue marcada como realizada")` → HTTP 400.

**BUG-009 (assignedUserId/responsibleUserId del JWT):**
- `OpportunitiesService.create` ahora recibe `requestingUserId: string` como segundo argumento. El `assignedUserId` se resuelve con `data.assignedUserId ?? requestingUserId`.
- `ActivitiesService.create` idem con `responsibleUserId`.
- `responsibleUserId` en `CreateActivitySchema` pasa de requerido a `.optional()`.
- Las routes correspondientes extraen `(request.user as JwtPayload).sub` y lo pasan al service.

**BUG-010 (kanban muestra cerradas):**
- Agregado campo `includeClosed` en `ListOpportunitiesQuerySchema` (string → boolean transform, default `false`).
- En `OpportunitiesService.list`, cuando `!query.includeClosed` se aplica `where.result = null` para excluir oportunidades cerradas.
- El endpoint acepta `?includeClosed=true` para el caso excepcional.

**BUG-011 (edicion y desactivacion de usuarios RF-28):**
- Agregado `UpdateUserBodySchema` (fullName, email, password opcionales) en `auth.schema.ts`.
- Agregados metodos `updateUser(id, data)` y `deactivateUser(id)` en `AuthService`.
- Agregados endpoints `PUT /api/v1/auth/users/:id` y `DELETE /api/v1/auth/users/:id` en `auth.routes.ts`, ambos con `preHandler: [fastify.authenticate]`.
- `deactivateUser` es baja logica (soft delete: `isActive = false`).

## Bloqueantes / Riesgos

- El User model en Prisma **no tiene campo `updatedAt`**. El select de `updateUser` se ajusto para no incluirlo. Si se necesita auditoría de updates en usuarios, habría que agregar ese campo al schema y generar una migracion.
- Los endpoints `PUT/DELETE /api/v1/auth/users/:id` no verifican si el usuario logueado tiene rol de administrador (no existe sistema de roles en el MVP). Cualquier usuario autenticado puede modificar o desactivar a otro. Se recomienda agregar RBAC en el siguiente sprint.
- `POST /api/v1/auth/register` ahora requiere autenticacion. El proceso de seeding inicial de la base de datos debe realizarse directamente via script de seed de Prisma o con una variable de entorno de bypass controlada.

## Recomendaciones para el siguiente rol

- **QA/Tester**: Re-ejecutar los tests de los 10 bugs. Los escenarios criticos a validar son:
  1. `POST /register` sin token → debe devolver 401.
  2. Dos POSTs concurrentes al mismo DNI → solo uno debe crear, el otro recibe 409.
  3. SIGTERM al server → el proceso debe cerrar limpiamente sin crear segunda instancia.
  4. Crear oportunidad/actividad con `clientId` de cliente inactivo → 404.
  5. `GET /opportunities` sin parametros → no incluye oportunidades con `result != null`.
  6. `GET /opportunities?includeClosed=true` → include todas.
  7. `PUT /activities/:id/complete` sobre actividad ya completada → 400.
  8. `PUT /users/:id` y `DELETE /users/:id` → 200/204 respectivamente.
- **Tech Lead**: Evaluar agregar RBAC (al menos rol `admin`) para proteger `/register`, `PUT /users/:id` y `DELETE /users/:id`.
