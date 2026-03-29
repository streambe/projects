# Reporte: QA Sprint 1 — CRM Ciudad Moto
**Rol**: Tester QA
**Fecha**: 2026-03-29
**Estado**: Completado

---

## Metodologia

Revisión estática de código (code review orientado a QA) sin entorno corriendo. Se analizaron todos los archivos del backend (módulos clients, opportunities, activities, auth), el schema de Prisma, la configuración de la aplicación y el seed. El frontend no existe en el repositorio al momento de esta revisión.

Archivos revisados:
- `backend/prisma/schema.prisma`
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/modules/auth/*`
- `backend/src/modules/clients/*`
- `backend/src/modules/opportunities/*`
- `backend/src/modules/activities/*`
- `backend/src/shared/middleware/auth.middleware.ts`
- `backend/src/shared/plugins/jwt.plugin.ts`
- `backend/src/shared/utils/errors.ts`
- `backend/src/shared/utils/pagination.ts`
- `backend/src/shared/utils/encryption.ts`
- `backend/prisma/seed.ts`

---

## Bugs por Severidad

---

### P1 — Criticos

---

BUG-001: El frontend no existe — el sprint no puede ser validado end-to-end
Severidad: P1
Modulo: Frontend (general)
Archivo: N/A — directorio `crm/frontend/` no existe en el repositorio
Descripcion: El directorio del frontend indicado en la tarea (`crm/frontend/src/modules/`) no existe. No hay ningun archivo React, ninguna pantalla de login, lista de clientes, kanban ni formulario de actividades. Todos los criterios del "Done" que involucran UI son imposibles de verificar. El backend puede estar correcto pero el producto no puede ser demostrado ni usado por el usuario final.
RF afectado: RF-01 al RF-15, RF-27, RF-28, RF-29 (toda la UI)
Recomendacion: Antes del Sprint Review es obligatorio que el equipo de frontend integre su codigo al repositorio. Sin esto no puede haber go/no-go positivo.

---

BUG-002: El endpoint /register no tiene proteccion — cualquier persona puede crear usuarios en produccion
Severidad: P1
Modulo: Auth
Archivo: `backend/src/modules/auth/auth.routes.ts` linea 101
Descripcion: El endpoint `POST /api/v1/auth/register` no tiene `preHandler: [fastify.authenticate]`. El propio comentario del codigo advierte: "In production this route should be protected or removed after initial setup." Esto significa que cualquier persona con acceso a la URL puede crear usuarios sin autenticarse, comprometiendo el control de acceso del sistema completo.
RF afectado: RF-27, RF-28
Recomendacion: Proteger la ruta con `fastify.authenticate` antes de pasar a produccion. Para el MVP, si se desea permitir el auto-registro, al menos documentar la decision y aceptarla formalmente. Si no se necesita auto-registro, eliminar la ruta del build de produccion.

---

BUG-003: Race condition en la deteccion de duplicados de DNI y telefono
Severidad: P1
Modulo: Clients
Archivo: `backend/src/modules/clients/clients.service.ts` lineas 28-62
Descripcion: La funcion `findDuplicate` realiza dos queries secuenciales (primero busca por DNI, luego por telefono) y luego la creacion del cliente se realiza en un tercer paso, todo fuera de una transaccion atomica. Si dos requests concurrentes llegan al mismo tiempo con el mismo DNI o telefono, ambas pueden pasar el chequeo de duplicados y luego intentar insertar. La restriccion `@unique` de Prisma en la base de datos atrapa esto y lanza un error de constraint, pero ese error no se maneja en el service ni en la route — llegaria al error handler global como un `Prisma.PrismaClientKnownRequestError` con codigo `P2002`, que el handler generico convierte en un HTTP 500 en lugar de un 409 con el detalle del conflicto.
RF afectado: RF-02, RF-07 (RNF-07)
Recomendacion: Envolver el `findDuplicate` + `prisma.client.create` en una transaccion Prisma y/o agregar manejo explicito de `PrismaClientKnownRequestError` con codigo `P2002` en el catch de las routes de clients para devolver 409 con mensaje apropiado en lugar de 500.

---

BUG-004: Graceful shutdown crea una segunda instancia del servidor en lugar de cerrar la primera
Severidad: P1
Modulo: Infraestructura
Archivo: `backend/src/server.ts` lineas 25-35
Descripcion: Los handlers de `SIGINT` y `SIGTERM` llaman a `buildApp()` nuevamente, lo que instancia una segunda aplicacion Fastify distinta a la que esta corriendo. Luego llaman `await app.close()` sobre esa nueva instancia (que nunca llego a escuchar). El servidor real que esta ateniendo peticiones nunca se cierra limpiamente. Esto produce: conexiones de base de datos que no se cierran, requests en vuelo que se cortan abruptamente y posible corrupcion de datos.
RF afectado: RNF-02 (disponibilidad)
Recomendacion: La variable `app` creada en `start()` debe ser capturada en scope de modulo o los signal handlers deben referenciar la instancia ya creada, no llamar a `buildApp()` de nuevo.

---

### P2 — Altos

---

BUG-005: La oportunidad creada puede pertenecer a un cliente inactivo (soft-deleted)
Severidad: P2
Modulo: Opportunities
Archivo: `backend/src/modules/opportunities/opportunities.service.ts` lineas 48-52
Descripcion: Al crear una oportunidad, el servicio verifica que el cliente exista (`findUnique`) pero no verifica si `isActive === true`. Es posible crear oportunidades vinculadas a clientes marcados como inactivos (eliminados logicamente). Esto viola la logica de negocio: un cliente inactivo no deberia tener nuevas oportunidades de venta abiertas.
RF afectado: RF-06, RF-07
Recomendacion: Agregar `select: { id: true, isActive: true }` en la busqueda del cliente y lanzar un error apropiado (404 o 400) si `isActive === false`.

---

BUG-006: Una actividad puede crearse vinculada a un cliente inactivo
Severidad: P2
Modulo: Activities
Archivo: `backend/src/modules/activities/activities.service.ts` lineas 53-57
Descripcion: Al igual que en oportunidades, la creacion de actividades verifica que el cliente exista pero no verifica `isActive`. Es posible registrar una llamada, reunion o tarea para un cliente dado de baja.
RF afectado: RF-06, RF-14
Recomendacion: Incluir la validacion de `isActive` en la verificacion del cliente, igual que en BUG-005.

---

BUG-007: El campo `motoInterest` es opcional en la creacion de oportunidades, pero el RF lo requiere implicita y funcionalmente
Severidad: P2
Modulo: Opportunities
Archivo: `backend/src/modules/opportunities/opportunities.schema.ts` linea 23
Descripcion: Segun RF-07, una oportunidad "debe registrar como minimo: cliente vinculado, modelo de moto de interes...". El campo `motoInterest` esta definido como `z.string().optional()` en el schema de validacion y como `String?` en Prisma. Esto permite crear oportunidades sin el modelo de moto de interes. Una tarjeta Kanban sin modelo de moto tiene muy poco valor informativo para el vendedor y viola el minimo establecido en el RF.
RF afectado: RF-07, RF-11
Recomendacion: Hacer `motoInterest` obligatorio: `z.string().min(1, 'motoInterest is required')` en el schema y remover el `?` en Prisma (con migracion correspondiente).

---

BUG-008: Al completar una actividad que ya esta en estado "realizada", el sistema lo permite sin advertencia
Severidad: P2
Modulo: Activities
Archivo: `backend/src/modules/activities/activities.service.ts` lineas 199-216
Descripcion: El endpoint `PUT /api/v1/activities/:id/complete` no verifica el estado actual de la actividad antes de marcarla como `realizada`. Si se llama dos veces sobre la misma actividad (o sobre una ya realizada), el sistema actualiza silenciosamente sin error. Esto puede generar doble procesamiento en el cliente si hay un retry de red, y no tiene feedback para el usuario de que la accion ya fue realizada.
RF afectado: RF-15
Recomendacion: Verificar `activity.status === 'realizada'` y lanzar un `ValidationError` o devolver un 409 indicando que la actividad ya fue completada.

---

BUG-009: El `assignedUserId` de la oportunidad no se asigna automaticamente al usuario logueado en la creacion
Severidad: P2
Modulo: Opportunities
Archivo: `backend/src/modules/opportunities/opportunities.routes.ts` lineas 17-44
Descripcion: RF-07 indica que el "usuario responsable" es "quien la crea". El endpoint de creacion de oportunidades acepta `assignedUserId` como campo opcional del body pero no lo inyecta automaticamente desde el token JWT si no se provee. El frontend tendria que enviar el userId del usuario logueado explicitamente, lo que es un patron poco seguro (el cliente puede mandar cualquier userId). En los registros del seed solo hay un usuario, pero en un escenario multiusuario esto es un problema de integridad.
RF afectado: RF-07
Recomendacion: Si `assignedUserId` no viene en el body, usar `request.user.sub` (userId del token) como valor por defecto en el route handler, similar a como se hace en `changeStage` con `changedByUserId`.

---

BUG-010: La lista de oportunidades para el Kanban no filtra por `isOpen` por defecto — muestra oportunidades cerradas mezcladas
Severidad: P2
Modulo: Opportunities / Pipeline Kanban
Archivo: `backend/src/modules/opportunities/opportunities.service.ts` lineas 79-98
Descripcion: El endpoint `GET /api/v1/opportunities` devuelve todas las oportunidades (abiertas y cerradas) si no se pasa el parametro `isOpen=true`. Para el Kanban (RF-11), mostrar oportunidades cerradas en las columnas activas es confuso y no corresponde al modelo de negocio. El consumidor tiene que saber pasar el filtro; si el frontend no lo hace, el Kanban estara contaminado con oportunidades ya ganadas/perdidas.
RF afectado: RF-11
Recomendacion: Cambiar el default del query parameter `isOpen` a `true` en el schema de listado, o bien aplicar el filtro `isOpen: true` por defecto en el servicio cuando se usa la ruta del Kanban.

---

BUG-011: No existe endpoint para editar ni desactivar usuarios (RF-28 no implementado)
Severidad: P2
Modulo: Auth / Users
Archivo: `backend/src/modules/auth/auth.routes.ts`
Descripcion: RF-28 requiere que el sistema permita "crear, editar y desactivar usuarios". Solo existe `POST /register` para creacion. No hay endpoints para `PUT /users/:id` (edicion) ni `DELETE /users/:id` o `PATCH /users/:id/deactivate` (desactivacion). La desactivacion es especialmente critica: si un vendedor deja la empresa, no hay forma de revocarle el acceso.
RF afectado: RF-28
Recomendacion: Implementar endpoints de edicion y desactivacion de usuarios con autenticacion requerida antes del Sprint Review.

---

BUG-012: El campo `lastActivity` no existe en el modelo Opportunity — el Kanban no puede mostrar "fecha de ultima actividad"
Severidad: P2
Modulo: Opportunities / Pipeline Kanban
Archivo: `backend/prisma/schema.prisma`, `backend/src/modules/opportunities/opportunities.service.ts`
Descripcion: RF-11 indica que cada tarjeta del Kanban debe mostrar "nombre del cliente, modelo de moto de interes y fecha de la ultima actividad". El `opportunitySelect` en el servicio no incluye actividades relacionadas, y no hay campo calculado ni relacion que exponga la fecha de la ultima actividad asociada a una oportunidad. El dato simplemente no existe en la respuesta del API del Kanban.
RF afectado: RF-11
Recomendacion: Agregar a `opportunitySelect` la inclusion de la ultima actividad: `activities: { select: { scheduledAt: true }, orderBy: { scheduledAt: 'desc' }, take: 1 }`.

---

### P3 — Medios

---

BUG-013: El endpoint de listado de actividades no filtra por `isActive` del cliente — puede listar actividades de clientes inactivos
Severidad: P3
Modulo: Activities
Archivo: `backend/src/modules/activities/activities.service.ts` lineas 93-121
Descripcion: El listado global de actividades no filtra por el estado del cliente vinculado. Un vendedor que navega el listado general podria ver actividades de clientes que ya fueron dados de baja, sin ninguna indicacion visual de que ese cliente esta inactivo.
RF afectado: RF-06, RF-16
Recomendacion: Agregar un join filter `client: { isActive: true }` al `where` del listado general, o incluir `isActive` del cliente en el `activitySelect` para que el frontend pueda indicarlo visualmente.

---

BUG-014: La validacion del `birthDate` acepta dos formatos distintos con comportamiento impredecible
Severidad: P3
Modulo: Clients
Archivo: `backend/src/modules/clients/clients.schema.ts` linea 30
Descripcion: El campo `birthDate` acepta tanto ISO datetime (`z.string().datetime()`) como fecha simple (`/^\d{4}-\d{2}-\d{2}$/`). Si se envia `"1990-01-15T00:00:00Z"` (datetime), el `new Date()` en el service lo convierte correctamente. Si se envia `"1990-01-15"` (date solo), `new Date("1990-01-15")` es interpretado como UTC midnight, lo que puede causar que en timezones con offset negativo la fecha se guarde como el dia anterior. Esto afectaria funcionalidades futuras como seguimiento por cumpleanos.
RF afectado: RF-01
Recomendacion: Unificar la validacion a un solo formato. Preferiblemente aceptar solo `YYYY-MM-DD` y usar `new Date(data.birthDate + 'T00:00:00')` (sin timezone) o manejar la conversion explicitamente.

---

BUG-015: El schema `UpdateActivitySchema` no permite desasociar una actividad de su oportunidad (no acepta null)
Severidad: P3
Modulo: Activities
Archivo: `backend/src/modules/activities/activities.schema.ts` lineas 31-41
Descripcion: El campo `opportunityId` en `UpdateActivitySchema` es `z.string().uuid().optional()`. Si el cliente envia `opportunityId: null` para desasociar la actividad de una oportunidad, Zod lo rechazara por no ser un UUID. Esto impide corregir una actividad que fue vinculada a la oportunidad incorrecta.
RF afectado: RF-14
Recomendacion: Cambiar a `z.string().uuid().nullable().optional()` y en el service manejar `null` como `opportunityId: null` para desasociar.

---

BUG-016: La contrasena del seed tiene un default conocido y hardcodeado que puede llegar a produccion
Severidad: P3
Modulo: Auth / Seguridad
Archivo: `backend/prisma/seed.ts` linea 22
Descripcion: El seed crea un usuario `admin@ciudadmoto.com` con contrasena `Admin1234!`. Aunque hay un comentario de advertencia, no hay ninguna validacion ni mecanismo que impida que este seed corra en un entorno de produccion. Si el equipo de despliegue ejecuta `npm run prisma:seed` en produccion (o si el deploy lo ejecuta automaticamente), la contrasena conocida queda activa.
RF afectado: RF-27, RNF-03
Recomendacion: Hacer que el seed lea la contrasena inicial de una variable de entorno (`process.env.SEED_ADMIN_PASSWORD`) y falle con un error claro si no esta definida. Alternativamente, marcar el seed como solo para desarrollo con una guarda `if (process.env.NODE_ENV === 'production') throw new Error(...)`.

---

BUG-017: No hay GET /api/v1/activities/:id — no es posible obtener una actividad por su ID
Severidad: P3
Modulo: Activities
Archivo: `backend/src/modules/activities/activities.routes.ts`
Descripcion: Existen endpoints para crear, listar, actualizar, completar y eliminar actividades, pero no hay un `GET /activities/:id`. Esto obliga al frontend a obtener el detalle de una actividad siempre desde el listado paginado, lo que es ineficiente y complica la navegacion directa a una actividad (por ejemplo, desde una notificacion o enlace directo).
RF afectado: RF-14, RF-16
Recomendacion: Implementar `GET /api/v1/activities/:id` en el router y el service.

---

BUG-018: No hay GET /api/v1/opportunities/:id — no es posible obtener una oportunidad por su ID
Severidad: P3
Modulo: Opportunities
Archivo: `backend/src/modules/opportunities/opportunities.routes.ts`
Descripcion: Al igual que con actividades, no existe endpoint para obtener el detalle de una oportunidad especifica por ID. Solo existe el listado paginado y el listado por cliente. Esto impide mostrar el historial de cambios de etapa de una oportunidad individual sin cargar toda la lista.
RF afectado: RF-07, RF-09
Recomendacion: Implementar `GET /api/v1/opportunities/:id` incluyendo el historial de cambios de etapa.

---

BUG-019: El `authMiddleware` en `auth.middleware.ts` es redundante con el decorator `fastify.authenticate`
Severidad: P3
Modulo: Auth
Archivo: `backend/src/shared/middleware/auth.middleware.ts`
Descripcion: Existe una funcion `authMiddleware` exportada que hace exactamente lo mismo que el decorator `fastify.authenticate` registrado en `jwt.plugin.ts`. Ninguna route usa `authMiddleware` directamente; todas usan `fastify.authenticate`. El archivo existe pero no se importa ni se usa en ningun lugar del codigo. Esto genera confusion sobre cual mecanismo de autenticacion esta activo y puede llevar a errores futuros si alguien agrega una ruta usando el middleware "no activo".
RF afectado: RF-27, RNF-03
Recomendacion: Eliminar `auth.middleware.ts` para evitar confusion, o documentar explicitamente por que existe si tiene un proposito futuro.

---

BUG-020: Las actividades vencidas (dueAt en el pasado + status pendiente) no se identifican a nivel de API
Severidad: P3
Modulo: Activities
Archivo: `backend/src/modules/activities/activities.service.ts`
Descripcion: RF-16 indica que "las actividades vencidas y pendientes deben destacarse visualmente". El API no devuelve ningun campo calculado como `isOverdue` ni expone un filtro para obtener solo actividades vencidas. El frontend tendria que calcular esto localmente comparando `dueAt` con la fecha actual, lo que es fragil (timezone) y no permite paginacion correcta de "actividades vencidas".
RF afectado: RF-16
Recomendacion: Agregar un filtro `overdue=true` al query schema que aplique `where: { status: 'pendiente', dueAt: { lt: new Date() } }`, y/o incluir un campo calculado `isOverdue` en la respuesta del listado.

---

### P4 — Bajos / Observaciones

---

BUG-021: El campo `isActive` del listado de clientes no filtra por activos por defecto — devuelve todos los clientes incluyendo inactivos
Severidad: P4
Modulo: Clients
Archivo: `backend/src/modules/clients/clients.service.ts` lineas 132-135
Descripcion: RF-06 indica que "los clientes inactivos no deben aparecer en los listados por defecto". Si se llama a `GET /api/v1/clients` sin el parametro `isActive`, el `where` queda vacio y se devuelven todos los clientes, activos e inactivos. El frontend tiene que recordar pasar `isActive=true` siempre.
RF afectado: RF-06
Recomendacion: Cambiar el default del parametro `isActive` a `true` en `ListClientsQuerySchema`. El filtro de "ver inactivos" se activa explicitamente con `isActive=false`.

---

BUG-022: Los mensajes de error de validacion estan en ingles — el sistema es para un negocio argentino
Severidad: P4
Modulo: Clients / Opportunities / Activities / Auth
Archivo: Multiples schemas (`clients.schema.ts`, `auth.schema.ts`, etc.)
Descripcion: Los mensajes de error de validacion como "First name is required", "Invalid email format", "Password must be at least 8 characters", "clientId must be a valid UUID" estan en ingles. Ciudad Moto es un negocio argentino y sus usuarios son vendedores hispanohablantes. Si estos mensajes llegan al frontend y se muestran al usuario (especialmente durante el desarrollo), generan mala experiencia.
RF afectado: RNF-05
Recomendacion: Traducir los mensajes de error a espanol en todos los schemas de validacion Zod.

---

BUG-023: El `totalPages` del paginador puede ser `Infinity` si `limit` es 0 — aunque improbable, es un edge case
Severidad: P4
Modulo: Shared / Pagination
Archivo: `backend/src/shared/utils/pagination.ts` linea 39
Descripcion: La funcion `buildPaginatedResult` calcula `limit = Math.min(100, Math.max(1, params.limit))`, lo que en teoria siempre resulta en al menos 1. Sin embargo, si por alguna razon `params.limit` llega como `NaN` (por ejemplo, si el schema Zod falla silenciosamente), `Math.max(1, NaN)` devuelve `NaN`, y `Math.ceil(total / NaN)` devuelve `NaN`. Esto podria causar que el frontend calcule mal la paginacion.
RF afectado: RF-04
Recomendacion: Agregar una guarda explicita: `if (!Number.isFinite(limit) || limit < 1) limit = 20;` antes del calculo de `totalPages`.

---

BUG-024: La ruta de health check expone el `env` (entorno) sin autenticacion
Severidad: P4
Modulo: Infraestructura
Archivo: `backend/src/app.ts` lineas 113-119
Descripcion: El endpoint `GET /health` devuelve `{ status, timestamp, env }`. Exponer el nombre del entorno (`production`, `development`, `staging`) en un endpoint publico es una filtracion de informacion menor que puede ayudar a un atacante a adaptar su estrategia.
RF afectado: RNF-04
Recomendacion: Remover el campo `env` de la respuesta de health check, o limitar la respuesta a `{ status: 'ok' }` sin metadatos adicionales en produccion.

---

BUG-025: El schema `CreateClientSchema` acepta email vacio como string (`""`) pero lo transforma a `undefined` — comportamiento no documentado
Severidad: P4
Modulo: Clients
Archivo: `backend/src/modules/clients/clients.schema.ts` linea 26
Descripcion: El campo `email` usa `.or(z.literal('')).transform(v => v === '' ? undefined : v)`. Esto hace que enviar `email: ""` sea equivalente a no enviar email. Si bien la intencion es buena (permitir que el frontend limpie el campo con string vacio), este comportamiento no es obvio y puede causar inconsistencias: en `UpdateClientBody` si el usuario quiere borrar el email de un cliente existente enviando `""`, funcionaria, pero si envia `null`, Zod lo rechazaria. No hay documentacion de este comportamiento.
RF afectado: RF-01, RF-03
Recomendacion: Documentar el comportamiento o unificar: aceptar tambien `null` para campos opcionales que se quieran borrar (especialmente en Update), usando `.nullable().optional()` de forma consistente.

---

## Resumen ejecutivo

### Total de bugs por severidad

| Severidad | Cantidad | Descripcion |
|-----------|----------|-------------|
| P1 — Critico | 4 | BUG-001, BUG-002, BUG-003, BUG-004 |
| P2 — Alto | 8 | BUG-005 a BUG-012 |
| P3 — Medio | 7 | BUG-013 a BUG-020 (incluyendo BUG-019) |
| P4 — Bajo | 5 | BUG-021 a BUG-025 |
| **Total** | **24** | |

### Cobertura de RFs revisados

| RF | Descripcion | Estado |
|----|-------------|--------|
| RF-01 | Alta de cliente | Parcialmente implementado — campo birthDate con ambiguedad de formato (BUG-014); isActive default no filtra (BUG-021) |
| RF-02 | Deteccion de duplicados en alta | Implementado con defecto — race condition (BUG-003) |
| RF-03 | Edicion de cliente | Implementado — sin bugs criticos directos; afectado por BUG-025 |
| RF-04 | Busqueda de clientes | Implementado correctamente |
| RF-05 | Perfil del cliente | Backend implementado — frontend ausente (BUG-001) |
| RF-06 | Eliminacion logica | Backend implementado con defectos — no filtrado por default (BUG-021), clientes inactivos aceptan nuevas ops (BUG-005, BUG-006) |
| RF-07 | Creacion de oportunidad | Implementado con defectos — motoInterest opcional (BUG-007), assignedUserId no auto-asignado (BUG-009) |
| RF-08 | Etapas del pipeline | Implementado correctamente (4 etapas en enum) |
| RF-09 | Movimiento entre etapas | Implementado con defecto — sin endpoint GET por ID para ver historial (BUG-018) |
| RF-10 | Cierre de oportunidad | Implementado correctamente — result requerido al llegar a cierre |
| RF-11 | Vista Kanban | Backend parcial — falta fecha ultima actividad (BUG-012), falta filtro isOpen default (BUG-010); frontend ausente (BUG-001) |
| RF-12 | Independencia del stock | Implementado correctamente — no hay validacion de stock |
| RF-13 | Tipos de actividad | Implementado correctamente (llamada, reunion, tarea) |
| RF-14 | Creacion de actividad | Implementado con defectos — no puede desasociar de oportunidad (BUG-015), status no es configurable en creacion |
| RF-15 | Resultado de actividad | Implementado con defecto — permite completar dos veces sin error (BUG-008) |
| RF-16 | Listado de actividades con filtros | Implementado parcialmente — falta filtro de vencidas (BUG-020), falta GET por ID (BUG-017) |
| RF-27 | Login | Implementado correctamente |
| RF-28 | Gestion de usuarios | Parcialmente implementado — faltan endpoints de edicion y desactivacion (BUG-011) |
| RF-29 | Logout | Implementado correctamente |

RFs del Sprint 1 revisados: 19 de 19 indicados en la tarea.
RFs sin implementacion de frontend: todos (BUG-001).

---

### Recomendacion de Go / No-Go para el Sprint Review

**NO-GO**

El Sprint 1 no puede ser aprobado en el Sprint Review en su estado actual por las siguientes razones bloqueantes:

1. **El frontend no existe** (BUG-001). No hay ninguna pantalla que demostrar al cliente. El backend puede estar correcto pero el producto no puede ser usado ni validado por Ciudad Moto.

2. **El endpoint /register no tiene autenticacion** (BUG-002). Es un riesgo de seguridad critico que no puede ir a ninguna demo ni entorno accesible externamente.

3. **La gestion de usuarios esta incompleta** (BUG-011). RF-28 requiere crear, editar y desactivar. Solo existe crear. Esto es un criterio de Done del Sprint.

4. **El graceful shutdown crea una segunda instancia del servidor** (BUG-004). Hace que el servidor de produccion no se cierre limpiamente.

**Acciones minimas requeridas antes de aprobar el sprint:**
- [ ] Integrar el codigo del frontend al repositorio (BUG-001)
- [ ] Proteger el endpoint /register (BUG-002)
- [ ] Implementar edicion y desactivacion de usuarios (BUG-011)
- [ ] Corregir el graceful shutdown (BUG-004)
- [ ] Corregir el manejo de `PrismaClientKnownRequestError P2002` en clients (BUG-003)

Los bugs P2 restantes (BUG-005 al BUG-012) son importantes pero pueden priorizarse en el Sprint 2 si los bloqueantes P1 se resuelven.

---

## Entregables producidos
- `/c/Gaston/Projects/Git repository/projects/.claude/pm-reports/tester-sprint1-report.md` — este reporte

## Decisiones tomadas
- Se priorizó la exhaustividad del análisis backend dado que el frontend no existe.
- Los bugs se clasificaron por impacto funcional sobre los RF del sprint, no solo por complejidad tecnica.
- Se incluyen observaciones P4 para dar visibilidad a deudas tecnicas sin bloquear el avance.

## Bloqueantes / Riesgos
- Frontend ausente: bloquea toda validacion de criterios de Done visibles al usuario.
- Race condition en duplicados: puede manifestarse en entornos con carga concurrente moderada.
- Register desprotegido: riesgo de seguridad activo desde el primer deploy.

## Recomendaciones para el siguiente rol
- El PM debe actualizar el backlog con los 24 bugs encontrados, priorizando los 4 P1 como bloqueantes del Sprint Review.
- El equipo de frontend debe confirmar si su codigo existe en otra rama y debe mergearse, o si realmente no se implemento.
- El equipo de backend debe revisar BUG-003 (race condition) y BUG-009 (auto-asignacion de responsable) antes de cualquier demo con datos reales.
- Antes del primer despliegue a cualquier entorno accesible, resolver BUG-002 y BUG-016 (credenciales hardcodeadas en seed).
