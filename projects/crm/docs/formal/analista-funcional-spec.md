# Especificacion Funcional Formal
# CRM Ciudad Moto

**Version**: 1.0
**Fecha**: 2026-03-29
**Autor**: Analista Funcional -- Equipo GEN
**Estado**: Aprobado internamente -- Listo para desarrollo
**Documento de referencia**: `projects/crm/docs/functional-spec.md` (v1.0)

---

## Tabla de Contenidos

1. [Objetivo del Documento](#1-objetivo-del-documento)
2. [Alcance del Proyecto](#2-alcance-del-proyecto)
3. [Requerimientos Funcionales](#3-requerimientos-funcionales)
4. [Requerimientos No Funcionales](#4-requerimientos-no-funcionales)
5. [Integraciones](#5-integraciones)
6. [Procesos de Negocio](#6-procesos-de-negocio)
7. [Diagramas de Flujo](#7-diagramas-de-flujo)
8. [Modelo de Datos](#8-modelo-de-datos)
9. [Criterios de Aceptacion](#9-criterios-de-aceptacion)
10. [Exclusiones](#10-exclusiones)

---

## 1. Objetivo del Documento

Este documento constituye la Especificacion Funcional Formal del sistema CRM para Ciudad Moto. Su proposito es:

- Servir como **fuente unica de verdad** para los requerimientos del sistema, unificando la especificacion original, los wireframes aprobados, el modelo de datos implementado y los endpoints existentes.
- Proporcionar al equipo de desarrollo una **referencia completa y sin ambiguedades** de lo que el sistema debe hacer, como debe comportarse, y cuales son los limites del alcance.
- Establecer los **criterios de aceptacion** en formato Gherkin que permitan validar objetivamente si cada funcionalidad fue implementada correctamente.
- Documentar los **procesos de negocio** que el sistema soporta, sus flujos principales y alternativos, y las reglas de negocio que los gobiernan.

**Audiencia**: Equipo de desarrollo (frontend, backend, QA), PM, y stakeholders de Ciudad Moto.

---

## 2. Alcance del Proyecto

### 2.1 Descripcion General

Ciudad Moto es una cadena dedicada a la venta de motocicletas. El CRM Ciudad Moto es un sistema web de escritorio que permite gestionar el ciclo comercial completo: desde el primer contacto con un cliente potencial hasta el cierre de una venta.

El sistema centraliza la informacion de clientes, el seguimiento de oportunidades de venta a traves de un pipeline visual (Kanban), el registro de actividades comerciales (llamadas, reuniones, tareas) y las comunicaciones con clientes via Gmail y WhatsApp.

### 2.2 Usuarios del Sistema

| Rol | Descripcion | Permisos |
|-----|-------------|----------|
| **Vendedor** | Opera el CRM en el dia a dia. Registra clientes, gestiona oportunidades, agenda actividades, se comunica con clientes. | Acceso completo a todas las funcionalidades. |
| **Dueno** | Utiliza el sistema con las mismas capacidades que el vendedor. Consulta reportes de gestion. | Identico al vendedor. Sin diferenciacion de permisos en el MVP. |

**Nota**: No existe diferenciacion de roles ni sistema de permisos en este MVP. Todos los usuarios autenticados tienen acceso identico a todas las funcionalidades.

### 2.3 Contexto de Negocio

- **Problema que resuelve**: Ciudad Moto gestiona sus clientes y ventas de forma manual o dispersa (hojas de calculo, notas sueltas, WhatsApp personal). Esto genera perdida de oportunidades, falta de seguimiento, y ausencia de historial centralizado.
- **Valor de negocio**: Centralizar la gestion comercial para no perder oportunidades de venta, mejorar el seguimiento de clientes, y tener visibilidad del estado del embudo de ventas.
- **Metricas de exito**: Reduccion de oportunidades sin seguimiento, aumento en la tasa de conversion del pipeline, tiempo promedio de respuesta a consultas.

### 2.4 Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | React JS |
| Backend | Node.js (Fastify) |
| ORM | Prisma v5 |
| Base de datos | PostgreSQL |
| Autenticacion | JWT (bcrypt para passwords) |
| Integraciones | Gmail API (mock), WhatsApp Business API (mock) |
| Deploy frontend | Vercel |

### 2.5 Modulos del Sistema

| ID | Modulo | Descripcion |
|----|--------|-------------|
| M-01 | Gestion de Clientes | Alta, edicion, consulta, perfil centralizado y deteccion de duplicados. |
| M-02 | Pipeline de Ventas | Seguimiento de oportunidades comerciales por etapas en vista Kanban. |
| M-03 | Actividades | Registro y seguimiento de llamadas, reuniones y tareas vinculadas a clientes u oportunidades. |
| M-04 | Comunicaciones | Integracion con Gmail y WhatsApp para enviar/recibir mensajes desde el CRM. |
| M-05 | Reportes | Reportes basicos de gestion comercial en pantalla. |
| M-06 | Autenticacion | Acceso seguro al sistema mediante email y contrasena. |

---

## 3. Requerimientos Funcionales

### M-01 -- Gestion de Clientes

#### RF-01: Alta de cliente

**Descripcion**: El sistema debe permitir registrar un nuevo cliente con los datos de contacto, ubicacion, origen y notas internas.

**Campos**:

| Campo | Tipo | Obligatorio | Validacion / Notas |
|-------|------|-------------|---------------------|
| Nombre (`firstName`) | VarChar(100) | Si | No vacio |
| Apellido (`lastName`) | VarChar(100) | Si | No vacio |
| DNI (`dni`) | VarChar(20) | Si | Unico en el sistema. Constraint a nivel de BD. |
| Telefono principal (`phonePrimary`) | VarChar(30) | Si | Unico en el sistema. Constraint a nivel de BD. |
| Telefono alternativo (`phoneAlt`) | VarChar(30) | No | |
| Correo electronico (`email`) | VarChar(255) | No | Formato email valido. Se usa para vincular emails de Gmail. |
| Numero de WhatsApp (`whatsappNumber`) | VarChar(30) | No | Puede coincidir con telefono principal. Se usa para vincular mensajes de WhatsApp. |
| Localidad / Ciudad (`city`) | VarChar(100) | No | |
| Provincia (`province`) | VarChar(100) | No | |
| Fecha de nacimiento (`birthDate`) | Date | No | |
| Como nos conocio (`howFoundUs`) | Enum | No | Valores: `instagram`, `facebook`, `google`, `referido`, `visita_directa`, `otro` |
| Notas internas (`notes`) | Text | No | Campo de texto libre |

**Campos automaticos**: `id` (UUID), `isActive` (default: true), `createdAt`, `updatedAt`.

**Endpoint existente**: `POST /api/clients` (modulo `clients`)

---

#### RF-02: Deteccion de duplicados en el alta

**Descripcion**: Antes de persistir un nuevo cliente, el sistema debe verificar si ya existe un registro con el mismo DNI o el mismo telefono principal. Si se detecta coincidencia, el sistema muestra una alerta con los datos del cliente existente y permite al usuario decidir si continua con el alta o cancela la operacion.

**Reglas de negocio**:
- BR-01: La verificacion se realiza contra DNI y telefono principal simultaneamente.
- BR-02: Si hay coincidencia, se muestra el nombre completo y DNI del cliente existente.
- BR-03: El usuario puede forzar el alta si lo considera apropiado (por ejemplo, DNI repetido por error de carga anterior).
- BR-04: La unicidad de DNI y telefono principal esta reforzada a nivel de base de datos (`@unique` en Prisma schema).

---

#### RF-03: Edicion de cliente

**Descripcion**: El sistema debe permitir editar todos los campos del perfil de un cliente en cualquier momento. La deteccion de duplicados (RF-02) tambien debe ejecutarse al modificar DNI o telefono principal.

**Reglas de negocio**:
- BR-05: Si se cambia el DNI o telefono principal, se ejecuta la misma logica de deteccion de duplicados que en el alta.
- BR-06: El campo `updatedAt` se actualiza automaticamente en cada edicion.

**Endpoint existente**: `PUT /api/clients/:id` (modulo `clients`)

---

#### RF-04: Consulta y busqueda de clientes

**Descripcion**: El sistema ofrece una vista de listado de clientes con busqueda y filtros.

**Busqueda por**: nombre, apellido, DNI, telefono, email.

**Columnas del listado** (segun wireframe aprobado):
- Checkbox de seleccion
- Nombre completo (formato: Apellido, Nombre)
- Telefono principal
- Interes (modelo de moto de la oportunidad activa, si existe)
- Estado (Activo / Lead / Inactivo)
- Menu de acciones (`[...]`)

**Filtros disponibles** (segun wireframe):
- Sucursal
- Estado (Activo / Inactivo)
- Filtros activos visibles como chips removibles

**Paginacion**: 25 registros por pagina con navegacion numerada.

**Endpoint existente**: `GET /api/clients` (modulo `clients`)

---

#### RF-05: Perfil del cliente

**Descripcion**: Cada cliente tiene una pagina de perfil que centraliza toda su informacion en un layout de dos columnas (segun wireframe aprobado).

**Columna izquierda (33%)**:
- Datos personales: DNI, edad (calculada desde fecha de nacimiento), ciudad, origen
- Preferencias: moto de interes, presupuesto
- Notas internas editables

**Columna derecha (67%) -- Tabs**:
- **Oportunidades** (tab por defecto): listado de oportunidades asociadas con etapa actual, modelo, fecha estimada de cierre. Boton `[+ Nueva oportunidad]`.
- **Actividad**: historial de actividades (llamadas, reuniones, tareas).
- **Comunicaciones**: historial unificado de emails y WhatsApp, cronologico, con indicacion de canal y direccion.
- **Archivos**: (placeholder para futuras versiones).

**Encabezado del perfil**:
- Iniciales del cliente en avatar
- Nombre completo
- Email, telefono, estado activo/inactivo
- Botones: `[Editar]`, `[+ Actividad]`

**Endpoint existente**: `GET /api/clients/:id` (modulo `clients`)

---

#### RF-06: Eliminacion logica de clientes

**Descripcion**: El sistema permite marcar un cliente como inactivo (`isActive = false`). No se elimina fisicamente de la base de datos.

**Reglas de negocio**:
- BR-07: Clientes inactivos NO aparecen en listados por defecto.
- BR-08: Clientes inactivos son consultables mediante filtro explicito de estado.
- BR-09: El indice `@@index([isActive])` en la BD optimiza las consultas filtradas.

**Endpoint existente**: `DELETE /api/clients/:id` (soft delete, modulo `clients`)

---

### M-02 -- Pipeline de Ventas

#### RF-07: Creacion de oportunidad

**Descripcion**: El sistema permite crear una oportunidad de venta asociada a un cliente existente.

**Campos**:

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| Cliente vinculado (`clientId`) | UUID (FK) | Si | Referencia a un cliente existente |
| Modelo de moto de interes (`motoInterest`) | Text | No | Texto libre |
| Usuario responsable (`assignedUserId`) | UUID (FK) | No | Por defecto el usuario logueado |
| Etapa actual (`stage`) | Enum | Si | Default: `consulta` |

**Campos automaticos**: `id` (UUID), `isOpen` (default: true), `createdAt`, `updatedAt`.

**Regla de negocio**:
- BR-10: Al crear la oportunidad, se registra automaticamente la primera entrada en `OpportunityHistory` con `fromStage = null` y `toStage = consulta`.

**Endpoint existente**: `POST /api/opportunities` (modulo `opportunities`)

---

#### RF-08: Etapas del pipeline

**Descripcion**: El pipeline consta de 4 etapas fijas, en este orden:

| Orden | Etapa | Enum value |
|-------|-------|------------|
| 1 | Consulta | `consulta` |
| 2 | Prueba de manejo | `prueba_manejo` |
| 3 | Presupuesto | `presupuesto` |
| 4 | Cierre | `cierre` |

Las etapas estan definidas como enum `OpportunityStage` en el schema de BD, lo que garantiza integridad referencial.

---

#### RF-09: Movimiento entre etapas

**Descripcion**: El sistema permite mover una oportunidad a cualquier etapa del pipeline de forma manual, sin restriccion de orden secuencial. Se puede saltar etapas hacia adelante o hacia atras.

**Reglas de negocio**:
- BR-11: Cada cambio de etapa genera un registro en `OpportunityHistory` con: oportunidad, etapa origen, etapa destino, usuario que realizo el cambio, y fecha/hora.
- BR-12: El historial de cambios es inmutable (solo insercion, nunca edicion ni borrado).

**Implementacion en wireframe**: Drag & drop entre columnas del tablero Kanban.

**Endpoint existente**: `PATCH /api/opportunities/:id` (modulo `opportunities`)

---

#### RF-10: Cierre de oportunidad

**Descripcion**: Al mover una oportunidad a la etapa "Cierre", el sistema solicita al usuario que indique el resultado.

**Campos de cierre**:

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| Resultado (`result`) | Enum | Si (al cerrar) | `ganado` o `perdido` |
| Motivo de perdida (`lossReason`) | Text | Solo si resultado = `perdido` | Texto libre |

**Reglas de negocio**:
- BR-13: Al cerrar como `ganado` o `perdido`, el campo `isOpen` se establece en `false`.
- BR-14: Una oportunidad cerrada puede ser reabierta (cambiarla a otra etapa restablece `isOpen = true`).

---

#### RF-11: Vista del pipeline (Kanban)

**Descripcion**: Vista tipo tablero Kanban con una columna por etapa (segun wireframe aprobado).

**Cada columna muestra**:
- Nombre de la etapa
- Cantidad de oportunidades
- Valor total (si aplica)

**Cada tarjeta muestra**:
- Nombre del cliente
- Modelo de moto de interes
- Fecha estimada de cierre o valor
- Iconos de alerta: reloj (proximo a vencer), advertencia (vencido)

**Interacciones**:
- Drag & drop entre columnas para cambiar etapa
- Click en tarjeta abre panel lateral con detalle rapido (sin navegar fuera del Kanban)
- Boton `[+ Agregar]` en cada columna crea oportunidad directamente en esa etapa
- Filtros disponibles: vendedor responsable, sucursal

**Endpoint existente**: `GET /api/opportunities` (modulo `opportunities`)

---

#### RF-12: Independencia del stock

**Descripcion**: El pipeline de ventas es completamente independiente del inventario de motos. El sistema NO valida disponibilidad de stock al crear ni gestionar oportunidades. El campo `motoInterest` es texto libre, no esta vinculado a un catalogo de productos.

---

### M-03 -- Actividades

#### RF-13: Tipos de actividad

**Descripcion**: El sistema soporta tres tipos de actividad, definidos como enum `ActivityType`:

| Tipo | Enum value | Descripcion |
|------|------------|-------------|
| Llamada | `llamada` | Llamada telefonica al cliente |
| Reunion / Visita | `reunion` | Reunion presencial o virtual |
| Tarea | `tarea` | Tarea interna pendiente de realizacion |

---

#### RF-14: Creacion de actividad

**Descripcion**: El sistema permite crear una actividad vinculada obligatoriamente a un cliente y opcionalmente a una oportunidad.

**Campos**:

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| Tipo (`type`) | Enum | Si | `llamada`, `reunion`, `tarea` |
| Titulo / Asunto (`title`) | VarChar(255) | Si | |
| Cliente vinculado (`clientId`) | UUID (FK) | Si | |
| Oportunidad vinculada (`opportunityId`) | UUID (FK) | No | |
| Fecha y hora (`scheduledAt`) | Timestamptz | Si | Fecha programada de la actividad |
| Fecha de vencimiento (`dueAt`) | Timestamptz | No | Para actividades con deadline |
| Usuario responsable (`responsibleUserId`) | UUID (FK) | Si | Default: usuario logueado |
| Notas / Resumen (`summary`) | Text | No | |
| Estado (`status`) | Enum | Si | Default: `pendiente` |

**Endpoint existente**: `POST /api/activities` (modulo `activities`)

---

#### RF-15: Registro del resultado de una actividad

**Descripcion**: Al marcar una actividad como "Realizada" (`status = realizada`), el sistema permite (no obliga) registrar un resumen en el campo `summary`.

**Regla de negocio**:
- BR-15: El cambio de estado de `pendiente` a `realizada` es irreversible en el flujo normal (no se puede "desmarcar" como pendiente).

**Endpoint existente**: `PATCH /api/activities/:id` (modulo `activities`)

---

#### RF-16: Listado de actividades

**Descripcion**: Vista de listado de actividades con capacidad de filtrado.

**Filtros disponibles**:
- Estado: pendiente / realizada
- Tipo: llamada / reunion / tarea
- Usuario responsable
- Rango de fechas

**Reglas visuales**:
- BR-16: Actividades vencidas (`dueAt` < fecha actual) con estado `pendiente` se destacan visualmente con icono de advertencia.
- BR-17: Actividades proximas a vencer (dentro de las proximas 24 horas) se destacan con icono de reloj.

**Indices de BD que soportan este listado**: `@@index([status])`, `@@index([scheduledAt])`, `@@index([responsibleUserId])`.

**Endpoint existente**: `GET /api/activities` (modulo `activities`)

---

#### RF-17: Actividades en el perfil del cliente

**Descripcion**: El historial de actividades de un cliente es visible desde el tab "Actividad" en su perfil (RF-05). Muestra todas las actividades donde `clientId` coincide con el cliente actual, ordenadas cronologicamente.

---

### M-04 -- Comunicaciones (Gmail y WhatsApp)

#### RF-18: Vinculacion de cuentas

**Descripcion**: El sistema permite conectar cuentas externas de comunicacion a nivel de configuracion del sistema.

**Gmail**:
- Se pueden vincular una o mas cuentas de Gmail.
- La vinculacion se realiza via OAuth 2.0.
- Las credenciales se almacenan encriptadas en la tabla `gmail_credentials` (campos `accessTokenEnc`, `refreshTokenEnc`).
- Cada registro almacena: direccion de Gmail, tokens encriptados, expiracion del token, history ID de Pub/Sub, y estado activo.

**WhatsApp**:
- Se vincula una unica cuenta de WhatsApp Business.
- La configuracion se almacena en la tabla `whatsapp_config` con: `phoneNumberId`, token de API encriptado (`apiTokenEnc`), y token de verificacion de webhook (`webhookVerifyToken`).

**Nota MVP**: Ambas integraciones se implementan como mocks funcionales. Los providers (`gmail.provider.ts`, `whatsapp.provider.ts`) encapsulan la logica de integracion y pueden reemplazarse por implementaciones reales sin cambios en el resto del sistema.

---

#### RF-19: Envio de email desde el CRM

**Descripcion**: Desde el perfil de un cliente o desde una oportunidad, el sistema permite redactar y enviar un email al correo electronico registrado del cliente, utilizando la cuenta de Gmail vinculada.

**Reglas de negocio**:
- BR-18: El email enviado se registra en la tabla `messages` con `channel = gmail`, `direction = outbound`.
- BR-19: Se requiere que el cliente tenga un email registrado para poder enviarle un correo.
- BR-20: El `externalId` del mensaje se genera para garantizar idempotencia (`@@unique([channel, externalId])`).

**Endpoint existente**: `POST /api/communications/email/send` (modulo `communications`)

---

#### RF-20: Recepcion de emails

**Descripcion**: El sistema recibe los emails entrantes de la cuenta de Gmail vinculada. Si el remitente coincide con el correo electronico de un cliente registrado, el email se vincula automaticamente a ese cliente.

**Reglas de negocio**:
- BR-21: La vinculacion automatica se realiza comparando `fromAddress` con el campo `email` de la tabla `clients` (indice `@@index([email])` lo optimiza).
- BR-22: Si no hay coincidencia, el mensaje queda con `clientId = null` (bandeja general, RF-24).
- BR-23: El campo `subject` se almacena para emails (hasta 500 caracteres).

**Endpoint existente**: Webhook / polling via `gmail.provider.ts`

---

#### RF-21: Envio de mensajes de WhatsApp desde el CRM

**Descripcion**: Desde el perfil de un cliente o desde una oportunidad, el sistema permite enviar un mensaje de WhatsApp al numero registrado del cliente.

**Reglas de negocio**:
- BR-24: El mensaje enviado se registra en la tabla `messages` con `channel = whatsapp`, `direction = outbound`.
- BR-25: Se requiere que el cliente tenga un `whatsappNumber` registrado para poder enviarle un mensaje.

**Endpoint existente**: `POST /api/communications/whatsapp/send` (modulo `communications`)

---

#### RF-22: Recepcion de mensajes de WhatsApp

**Descripcion**: El sistema recibe los mensajes de WhatsApp entrantes via webhook. Si el numero remitente coincide con el `whatsappNumber` de un cliente registrado, el mensaje se vincula automaticamente a ese cliente.

**Reglas de negocio**:
- BR-26: La vinculacion automatica se realiza comparando `fromAddress` con el campo `whatsappNumber` de la tabla `clients` (indice `@@index([whatsappNumber])` lo optimiza).
- BR-27: Si no hay coincidencia, el mensaje queda con `clientId = null` (bandeja general, RF-24).

**Endpoint existente**: Webhook via `whatsapp.provider.ts`

---

#### RF-23: Historial de comunicaciones en el perfil del cliente

**Descripcion**: El tab "Comunicaciones" del perfil del cliente (RF-05) muestra el historial unificado de emails y mensajes de WhatsApp.

**Datos mostrados por mensaje**:
- Fecha y hora (`sentReceivedAt`)
- Canal: Gmail o WhatsApp (`channel`)
- Direccion: enviado o recibido (`direction`)
- Asunto (solo para emails, campo `subject`)
- Contenido del mensaje (`body`)

**Ordenamiento**: Cronologico descendente (mas reciente primero).

**Sub-filtros** (segun wireframe): botones `[WhatsApp]` y `[Email]` para filtrar por canal.

**Indice de BD**: `@@index([clientId])` optimiza la consulta del historial por cliente.

---

#### RF-24: Comunicaciones no vinculadas (Bandeja General)

**Descripcion**: Los emails y mensajes de WhatsApp recibidos cuyo remitente no coincida con ningun cliente registrado quedan en una bandeja de entrada general (`clientId = null`).

**Acciones disponibles desde la bandeja**:
- Asignar manualmente a un cliente existente (establece `clientId` y opcionalmente `assignedByUserId`).
- Crear un nuevo cliente a partir del mensaje (flujo que pre-rellena datos del remitente).

**Indice de BD**: `@@index([clientId, channel])` optimiza la consulta de mensajes no vinculados.

---

### M-05 -- Reportes

#### RF-25: Reporte de clientes nuevos por periodo

**Descripcion**: Reporte que muestra la cantidad de clientes dados de alta en un rango de fechas seleccionable.

**Parametros de entrada**: Fecha desde, Fecha hasta.

**Datos del reporte**:
- Cantidad total de clientes nuevos en el periodo
- Detalle por cliente: nombre completo, fecha de alta (`createdAt`), como nos conocio (`howFoundUs`)

**Visualizacion**: En pantalla (no se exporta a Excel/PDF en el MVP).

**Endpoint existente**: `GET /api/reports/new-clients` (modulo `reports`)

---

#### RF-26: Reporte de actividades por vendedor

**Descripcion**: Reporte que muestra, para un rango de fechas seleccionable, la cantidad de actividades realizadas agrupadas por usuario responsable, desglosadas por tipo de actividad.

**Parametros de entrada**: Fecha desde, Fecha hasta.

**Datos del reporte**:
- Agrupacion por usuario responsable
- Desglose por tipo: llamadas, reuniones, tareas
- Solo actividades con `status = realizada`

**Endpoint existente**: `GET /api/reports/activities-by-user` (modulo `reports`)

---

### M-06 -- Autenticacion

#### RF-27: Login

**Descripcion**: El sistema requiere autenticacion mediante email y contrasena para acceder a cualquier funcionalidad. Todas las rutas de la aplicacion (excepto login) requieren sesion activa.

**Reglas de negocio**:
- BR-28: Las contrasenas se almacenan hasheadas con bcrypt (`passwordHash` en tabla `users`).
- BR-29: El sistema emite un token JWT al autenticarse exitosamente.
- BR-30: Las sesiones expiran tras un periodo de inactividad configurable.

**Endpoint existente**: `POST /api/auth/login` (modulo `auth`)

---

#### RF-28: Gestion de usuarios

**Descripcion**: El sistema permite crear, editar y desactivar usuarios.

**Campos por usuario**:

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| Nombre completo (`fullName`) | VarChar(150) | Si | |
| Email (`email`) | VarChar(255) | Si | Unico. Funciona como nombre de usuario. |
| Contrasena (`passwordHash`) | VarChar(255) | Si | Se almacena hasheada. |
| Activo (`isActive`) | Boolean | Si | Default: true |

**Regla de negocio**:
- BR-31: No existe diferenciacion de roles ni permisos en el MVP. Todos los usuarios tienen acceso identico.

**Endpoint existente**: Modulo `auth` (registro y gestion)

---

#### RF-29: Cierre de sesion

**Descripcion**: El sistema permite al usuario cerrar su sesion de forma explicita. Al cerrar sesion, el token JWT se invalida (o se descarta en el cliente).

**Endpoint existente**: `POST /api/auth/logout` (modulo `auth`)

---

## 4. Requerimientos No Funcionales

### RNF-01: Rendimiento

Las pantallas principales deben cargar en menos de 3 segundos con hasta 5.000 registros de clientes en la base de datos. Esto aplica a:
- Listado de clientes (RF-04)
- Pipeline Kanban (RF-11)
- Listado de actividades (RF-16)

**Indices de BD que soportan rendimiento**: El schema Prisma incluye indices optimizados en `clients` (email, whatsappNumber, isActive), `opportunities` (clientId, assignedUserId, stage, isOpen), `activities` (clientId, opportunityId, responsibleUserId, status, scheduledAt), y `messages` (channel+fromAddress, clientId, clientId+channel).

### RNF-02: Disponibilidad

El sistema debe estar disponible al menos el 99% del tiempo en horario comercial (lunes a sabado, 8:00 a 20:00 hs).

### RNF-03: Seguridad -- Autenticacion

- Todas las rutas requieren sesion activa (JWT valido).
- Las contrasenas se almacenan hasheadas con bcrypt.
- Las sesiones expiran tras un periodo de inactividad configurable.
- Los tokens JWT deben tener una expiracion definida.

### RNF-04: Seguridad -- Datos

- Comunicacion cliente-servidor exclusivamente via HTTPS.
- Credenciales de integraciones (Gmail OAuth tokens, WhatsApp API token) almacenadas encriptadas en BD (campos `accessTokenEnc`, `refreshTokenEnc`, `apiTokenEnc`).
- Credenciales de integraciones nunca se exponen en el frontend.
- Variables de entorno para configuracion sensible (`DATABASE_URL`, secrets de JWT, etc.).

### RNF-05: Usabilidad

- Interfaz diseñada para pantallas de escritorio (resolucion minima 1366x768).
- No se requiere soporte mobile en el MVP.
- Layout con sidebar fijo de 160px y area de contenido principal (segun wireframe aprobado).

### RNF-06: Compatibilidad de navegadores

El sistema debe funcionar correctamente en las versiones actuales de:
- Google Chrome
- Microsoft Edge

### RNF-07: Integridad de datos

- No pueden existir dos clientes con el mismo DNI (constraint `@unique` en BD).
- No pueden existir dos clientes con el mismo telefono principal (constraint `@unique` en BD).
- Esta restriccion se aplica tanto a nivel de aplicacion (validacion antes de guardar) como a nivel de base de datos (constraints).
- Los mensajes tienen unicidad compuesta por canal + ID externo (`@@unique([channel, externalId])`).

### RNF-08: Trazabilidad

Los cambios de etapa en las oportunidades quedan registrados en la tabla `opportunity_history` con:
- Oportunidad afectada
- Etapa origen (`fromStage`, nullable para la creacion)
- Etapa destino (`toStage`)
- Usuario que realizo el cambio (`changedByUserId`)
- Fecha y hora del cambio (`changedAt`)

Esto permite reconstruir el historial completo de movimientos de cada oportunidad.

---

## 5. Integraciones

### 5.1 Gmail (Mock en MVP)

**Objetivo**: Permitir enviar y recibir emails desde el CRM, vinculandolos automaticamente al perfil del cliente.

**Approach tecnico**:
- **Provider**: `communications/providers/gmail.provider.ts` encapsula toda la logica de integracion con Gmail API.
- **Autenticacion**: OAuth 2.0. Los tokens se almacenan encriptados en `gmail_credentials`.
- **Envio**: Se invoca Gmail API para enviar el email y se registra en la tabla `messages`.
- **Recepcion**: Via Gmail Push Notifications (Pub/Sub) o polling periodico. Los emails entrantes se procesan, se busca coincidencia con clientes por email, y se almacenan en `messages`.
- **Mock**: En el MVP, el provider simula las respuestas de Gmail API. La estructura del codigo es identica a la implementacion real, permitiendo reemplazo sin cambios en el service ni en los routes.

**Modelo de datos de soporte**: `GmailCredential` (tokens OAuth encriptados, estado, historyId de Pub/Sub).

### 5.2 WhatsApp Business API (Mock en MVP)

**Objetivo**: Permitir enviar y recibir mensajes de WhatsApp desde el CRM, vinculandolos automaticamente al perfil del cliente.

**Approach tecnico**:
- **Provider**: `communications/providers/whatsapp.provider.ts` encapsula toda la logica de integracion con WhatsApp Business API.
- **Configuracion**: Se almacena en `whatsapp_config` (phone number ID, API token encriptado, webhook verify token).
- **Envio**: Se invoca WhatsApp Business API para enviar el mensaje y se registra en la tabla `messages`.
- **Recepcion**: Via webhook. WhatsApp envia notificaciones de mensajes entrantes al endpoint del CRM. El sistema verifica la firma, busca coincidencia con clientes por `whatsappNumber`, y almacena en `messages`.
- **Mock**: En el MVP, el provider simula las respuestas de WhatsApp Business API. Misma logica de reemplazo transparente que Gmail.

**Modelo de datos de soporte**: `WhatsappConfig` (configuracion unica del negocio).

### 5.3 Patron de integracion

Ambas integraciones siguen el mismo patron de arquitectura:

```
Routes (API endpoints)
  |
  v
Service (logica de negocio, vinculacion a clientes)
  |
  v
Provider (abstraccion de la API externa -- mock o real)
```

Este patron permite:
- Cambiar de mock a implementacion real sin tocar el service.
- Testear el flujo completo sin depender de servicios externos.
- Agregar nuevos canales de comunicacion (ej: SMS) con minimo impacto.

---

## 6. Procesos de Negocio

### 6.1 Proceso: Alta de cliente con deteccion de duplicados

**Actor**: Vendedor / Dueno
**Precondicion**: Usuario autenticado en el sistema.
**Trigger**: El usuario hace click en `[+ Nuevo cliente]`.

**Flujo principal**:
1. El usuario accede al formulario de alta de cliente.
2. El usuario completa los campos obligatorios (nombre, apellido, DNI, telefono principal) y opcionalmente los demas campos.
3. El usuario hace click en "Guardar".
4. El sistema verifica si existe un cliente con el mismo DNI o telefono principal.
5. No se detectan duplicados.
6. El sistema persiste el cliente con `isActive = true` y timestamps automaticos.
7. El sistema redirige al perfil del cliente recien creado.

**Flujo alternativo A -- Duplicado detectado**:
- En el paso 4, el sistema detecta coincidencia.
- 4a. El sistema muestra una alerta con los datos del cliente existente (nombre, DNI).
- 4b. El usuario decide:
  - Cancelar: vuelve al formulario con los datos precargados.
  - Forzar alta: el sistema intenta persistir. Si hay constraint violation a nivel BD, se muestra error.
  - Ver existente: el sistema navega al perfil del cliente existente.

**Flujo alternativo B -- Error de validacion**:
- En el paso 3, faltan campos obligatorios o el formato es invalido.
- 3a. El sistema muestra los errores de validacion inline.
- 3b. El usuario corrige y reintenta.

**Postcondicion**: Cliente registrado en el sistema y visible en el listado.

---

### 6.2 Proceso: Pipeline de ventas (Consulta a Cierre)

**Actor**: Vendedor / Dueno
**Precondicion**: Existe al menos un cliente registrado.
**Trigger**: El usuario crea una nueva oportunidad o arrastra una tarjeta en el Kanban.

**Flujo principal**:
1. El usuario crea una oportunidad asociada a un cliente, indicando modelo de moto de interes.
2. La oportunidad se crea en etapa "Consulta" por defecto.
3. El sistema registra el historial inicial (fromStage=null, toStage=consulta).
4. El vendedor interactua con el cliente (llamadas, reuniones, presupuestos).
5. El vendedor mueve la oportunidad entre etapas segun avanza la negociacion (drag & drop en Kanban).
6. Cada movimiento se registra en el historial con fecha, etapa origen/destino, y usuario.
7. Cuando la oportunidad llega a "Cierre", el sistema solicita resultado.
8. El vendedor indica "Ganado" o "Perdido".
9. Si "Perdido": se registra motivo en texto libre.
10. La oportunidad se marca como cerrada (`isOpen = false`).

**Flujo alternativo A -- Salto de etapas**:
- En el paso 5, el vendedor puede mover la oportunidad a cualquier etapa (no es secuencial).
- Ejemplo: de "Consulta" directo a "Presupuesto" si el cliente ya sabe lo que quiere.

**Flujo alternativo B -- Reapertura**:
- Una oportunidad cerrada puede moverse a otra etapa, lo que restablece `isOpen = true`.

**Postcondicion**: Oportunidad cerrada con resultado registrado y historial completo de movimientos.

---

### 6.3 Proceso: Gestion de actividades

**Actor**: Vendedor / Dueno
**Precondicion**: Existe al menos un cliente registrado.
**Trigger**: El usuario hace click en `[+ Actividad]` desde el perfil del cliente o desde el listado.

**Flujo principal**:
1. El usuario selecciona tipo de actividad (llamada, reunion, tarea).
2. El usuario completa titulo, fecha/hora programada, y opcionalmente vincula a una oportunidad.
3. La actividad se crea con estado "Pendiente".
4. La actividad aparece en el listado de actividades y en el perfil del cliente.
5. Cuando la actividad se realiza, el vendedor la marca como "Realizada".
6. Opcionalmente, el vendedor registra un resumen de lo conversado/acordado.

**Flujo alternativo -- Actividad vencida**:
- Si llega la fecha de vencimiento (`dueAt`) y la actividad sigue en estado "Pendiente", se destaca visualmente en el listado con icono de advertencia.

**Postcondicion**: Actividad registrada en el historial del cliente con su estado final.

---

### 6.4 Proceso: Comunicaciones (envio, recepcion, vinculacion)

**Actor**: Vendedor / Dueno (envio); Sistema (recepcion automatica)
**Precondicion**: Cuentas de Gmail y/o WhatsApp vinculadas en configuracion.

**Flujo de envio**:
1. El usuario accede al perfil de un cliente.
2. Desde el tab "Comunicaciones", selecciona canal (WhatsApp o Email).
3. Redacta el mensaje y lo envia.
4. El sistema invoca el provider correspondiente (Gmail o WhatsApp).
5. El mensaje se registra en `messages` con `direction = outbound` y `clientId` del cliente.
6. El mensaje aparece en el historial de comunicaciones del cliente.

**Flujo de recepcion**:
1. El sistema recibe un mensaje entrante via webhook (WhatsApp) o push notification (Gmail).
2. El sistema extrae la direccion/numero del remitente.
3. El sistema busca en la tabla `clients` si existe un cliente con ese email (Gmail) o whatsappNumber (WhatsApp).
4. Si hay coincidencia: el mensaje se almacena con `clientId` del cliente encontrado.
5. Si no hay coincidencia: el mensaje se almacena con `clientId = null` (bandeja general).

**Flujo de vinculacion manual (bandeja general)**:
1. El usuario accede a la bandeja de mensajes no vinculados.
2. Selecciona un mensaje.
3. El sistema permite: asignar a cliente existente (buscar y seleccionar) o crear nuevo cliente.
4. El mensaje se actualiza con el `clientId` correspondiente y `assignedByUserId` del usuario que lo asigno.

**Postcondicion**: Mensaje almacenado y vinculado al cliente (automatica o manualmente).

---

## 7. Diagramas de Flujo

### 7.1 Flujo de alta de cliente con deteccion de duplicados

```
                          INICIO
                            |
                            v
                +-----------------------+
                | Usuario hace click en |
                | [+ Nuevo cliente]     |
                +-----------------------+
                            |
                            v
                +-----------------------+
                | Mostrar formulario    |
                | de alta de cliente    |
                +-----------------------+
                            |
                            v
                +-----------------------+
                | Usuario completa      |
                | campos y hace click   |
                | en [Guardar]          |
                +-----------------------+
                            |
                            v
                +-----------------------+
                | Validar campos        |
                | obligatorios y        |
                | formatos              |
                +-----------------------+
                       |         |
                  [invalido]  [valido]
                       |         |
                       v         v
              +------------+  +-----------------------+
              | Mostrar    |  | Buscar en BD clientes |
              | errores    |  | con mismo DNI o       |
              | inline     |  | telefono principal    |
              +------------+  +-----------------------+
                       |              |           |
                       |        [sin match]  [con match]
                       |              |           |
                       v              v           v
              +------------+  +----------+  +-----------------------+
              | Usuario    |  | Persistir|  | Mostrar alerta:       |
              | corrige    |  | cliente  |  | "Ya existe cliente    |
              | datos      |  | en BD    |  |  [Nombre] con mismo  |
              +------------+  +----------+  |  DNI/telefono"        |
                       |           |        +-----------------------+
                       |           |           |        |        |
                       |           |      [Cancelar] [Forzar] [Ver exist.]
                       |           |           |        |        |
                       |           |           v        v        v
                       |           |     +--------+ +------+ +--------+
                       |           |     |Volver  | |Intenta| |Navegar |
                       |           |     |al form.| |guardar| |a perfil|
                       |           |     +--------+ +------+ |existente|
                       |           |                    |     +--------+
                       |           |              [BD error]       |
                       |           |                    |          |
                       |           |                    v          |
                       |           |            +------------+    |
                       |           |            |Mostrar     |    |
                       |           |            |error de    |    |
                       |           |            |constraint  |    |
                       |           |            +------------+    |
                       |           |                              |
                       |           v                              |
                       |    +-----------------------+             |
                       |    | Redirigir al perfil   |             |
                       |    | del cliente creado     |             |
                       |    +-----------------------+             |
                       |              |                           |
                       v              v                           v
                          FIN (cliente creado o navegacion)
```

### 7.2 Flujo del pipeline de ventas (Consulta a Cierre)

```
                          INICIO
                            |
                            v
                +-----------------------+
                | Usuario crea          |
                | oportunidad para      |
                | un cliente            |
                +-----------------------+
                            |
                            v
                +-----------------------+
                | Oportunidad se crea   |
                | en etapa CONSULTA     |
                | (o la etapa elegida)  |
                +-----------------------+
                            |
                            v
                +-----------------------+
                | Registrar en          |
                | OpportunityHistory:   |
                | from=null, to=etapa   |
                +-----------------------+
                            |
                            v
          +----------------------------------+
          |                                  |
          |   LOOP: GESTION DE OPORTUNIDAD   |
          |                                  |
          |   +------------------------+     |
          |   | Oportunidad visible    |     |
          |   | en Kanban en su etapa  |     |
          |   +------------------------+     |
          |              |                   |
          |              v                   |
          |   +------------------------+     |
          |   | Vendedor interactua    |     |
          |   | con el cliente         |     |
          |   | (actividades, calls,   |     |
          |   |  mensajes, etc.)       |     |
          |   +------------------------+     |
          |              |                   |
          |              v                   |
          |   +------------------------+     |
          |   | Vendedor mueve la      |     |
          |   | oportunidad de etapa   |     |
          |   | (drag & drop)          |     |
          |   +------------------------+     |
          |         |            |           |
          |   [No es Cierre]  [Es Cierre]   |
          |         |            |           |
          |         v            v           |
          |   +-----------+  +------------+ |
          |   | Registrar |  | Solicitar  | |
          |   | cambio en |  | resultado: | |
          |   | historial |  | Ganado o   | |
          |   +-----------+  | Perdido    | |
          |         |        +------------+ |
          |         |         |          |  |
          |         |    [Ganado]   [Perdido]|
          |         |         |          |  |
          |         |         |          v  |
          |         |         |   +--------+|
          |         |         |   |Registrar||
          |         |         |   |motivo de||
          |         |         |   |perdida  ||
          |         |         |   +--------+|
          |         |         |       |     |
          |         |         v       v     |
          |         |    +---------------+  |
          |         |    | isOpen=false   |  |
          |         |    | Registrar en   |  |
          |         |    | historial      |  |
          |         |    +---------------+  |
          |         |           |           |
          |    [continuar]      |           |
          |         |           |           |
          +---------|-----------|-----------|
                    |           |
                    v           v
                          FIN
              (oportunidad cerrada con resultado)
```

### 7.3 Flujo de comunicaciones (envio, recepcion, vinculacion)

```
=== FLUJO DE ENVIO ===

              INICIO
                |
                v
    +-----------------------+
    | Usuario en perfil     |
    | del cliente, tab      |
    | Comunicaciones        |
    +-----------------------+
                |
                v
    +-----------------------+
    | Seleccionar canal:    |
    | [WhatsApp] o [Email]  |
    +-----------------------+
           |            |
      [WhatsApp]     [Email]
           |            |
           v            v
    +------------+ +------------+
    | Verificar  | | Verificar  |
    | cliente    | | cliente    |
    | tiene      | | tiene      |
    | whatsapp   | | email      |
    | Number     | | registrado |
    +------------+ +------------+
      |       |      |       |
    [No]    [Si]   [No]    [Si]
      |       |      |       |
      v       v      v       v
    +----+ +------+ +----+ +------+
    |Msg | |Abrir | |Msg | |Abrir |
    |de  | |editor| |de  | |editor|
    |error| |de msg| |error| |de   |
    +----+ +------+ +----+ |email |
              |             +------+
              v                |
    +-----------------------+  |
    | Usuario redacta y     |<-+
    | envia el mensaje      |
    +-----------------------+
              |
              v
    +-----------------------+
    | Invocar provider      |
    | (gmail o whatsapp)    |
    +-----------------------+
              |
              v
    +-----------------------+
    | Registrar en tabla    |
    | messages:             |
    | channel, direction=   |
    | outbound, clientId    |
    +-----------------------+
              |
              v
    +-----------------------+
    | Mensaje visible en    |
    | historial del cliente |
    +-----------------------+
              |
              v
             FIN


=== FLUJO DE RECEPCION ===

              INICIO
                |
                v
    +-----------------------+
    | Mensaje entrante via  |
    | webhook (WA) o push   |
    | notification (Gmail)  |
    +-----------------------+
                |
                v
    +-----------------------+
    | Extraer remitente:    |
    | email o numero WA     |
    +-----------------------+
                |
                v
    +-----------------------+
    | Buscar en tabla       |
    | clients donde         |
    | email = remitente  o  |
    | whatsappNumber =      |
    | remitente             |
    +-----------------------+
           |            |
      [Sin match]  [Con match]
           |            |
           v            v
    +------------+ +------------+
    | Guardar    | | Guardar    |
    | mensaje    | | mensaje    |
    | con        | | con        |
    | clientId   | | clientId   |
    | = NULL     | | del cliente|
    | (bandeja   | | encontrado |
    | general)   | +------------+
    +------------+       |
           |             v
           |      +------------------+
           |      | Mensaje visible  |
           |      | en historial del |
           |      | cliente          |
           |      +------------------+
           |             |
           v             v
    +-----------------------+
    | Mensaje almacenado    |
    +-----------------------+
              |
              v
             FIN


=== FLUJO DE VINCULACION MANUAL ===

              INICIO
                |
                v
    +-----------------------+
    | Usuario accede a      |
    | bandeja general       |
    | (mensajes sin         |
    | clientId)             |
    +-----------------------+
                |
                v
    +-----------------------+
    | Selecciona un mensaje |
    | no vinculado          |
    +-----------------------+
                |
                v
    +-----------------------+
    | Opcion:               |
    | [Asignar a existente] |
    | [Crear nuevo cliente] |
    +-----------------------+
           |            |
    [Asignar]     [Crear nuevo]
           |            |
           v            v
    +------------+ +------------------+
    | Buscar y   | | Abrir formulario |
    | seleccionar| | de alta con      |
    | cliente    | | datos pre-       |
    | existente  | | rellenados del   |
    +------------+ | remitente        |
           |       +------------------+
           |              |
           v              v
    +-----------------------+
    | Actualizar mensaje:   |
    | clientId = cliente    |
    | assignedByUserId =    |
    | usuario actual        |
    +-----------------------+
              |
              v
    +-----------------------+
    | Mensaje ahora visible |
    | en perfil del cliente |
    +-----------------------+
              |
              v
             FIN
```

---

## 8. Modelo de Datos

### 8.1 Diagrama de Entidades y Relaciones

```
    +------------------+          +---------------------+
    |      User        |          |    GmailCredential  |
    |------------------|          |---------------------|
    | id (PK, UUID)    |          | id (PK, UUID)       |
    | fullName         |          | gmailAddress (UQ)   |
    | email (UQ)       |          | accessTokenEnc      |
    | passwordHash     |          | refreshTokenEnc     |
    | isActive         |          | tokenExpiry         |
    | createdAt        |          | pubsubHistoryId     |
    +------------------+          | isActive            |
           |                      +---------------------+
           |
           | 1:N assignedOpportunities
           | 1:N opportunityHistories       +---------------------+
           | 1:N activities                 |   WhatsappConfig    |
           | 1:N assignedMessages           |---------------------|
           |                                | id (PK, UUID)       |
           v                                | phoneNumberId       |
    +------------------+    1:N             | apiTokenEnc         |
    |     Client       |----------+         | webhookVerifyToken  |
    |------------------|          |         | isActive            |
    | id (PK, UUID)    |          |         +---------------------+
    | firstName        |          |
    | lastName         |          |
    | dni (UQ)         |          |
    | phonePrimary (UQ)|          |
    | phoneAlt         |          |
    | email            |          |
    | whatsappNumber   |          |
    | city             |          |
    | province         |          |
    | birthDate        |          |
    | howFoundUs       |          |
    | notes            |          |
    | isActive         |          |
    | createdAt        |          |
    | updatedAt        |          |
    +------------------+          |
       |          |               |
       | 1:N      | 1:N          | 1:N
       v          v              v
  +-----------+ +----------+ +------------------+
  |Opportunity| | Activity | |     Message      |
  |-----------|  |----------|  |------------------|
  | id (PK)   | | id (PK)  | | id (PK, UUID)    |
  | clientId  | | type     | | channel          |
  | assigned  | | title    | | direction        |
  |  UserId   | | clientId | | clientId (FK,    |
  | motoInter.| | opport.Id| |   nullable)      |
  | stage     | | respons. | | externalId       |
  | result    | |  UserId  | | fromAddress      |
  | lossReason| | scheduled| | toAddress        |
  | isOpen    | |  At      | | subject          |
  | createdAt | | dueAt    | | body             |
  | updatedAt | | status   | | sentReceivedAt   |
  +-----------+ | summary  | | assignedByUserId |
       |        +----------+ | createdAt        |
       | 1:N                 +------------------+
       v                     UQ: channel+externalId
  +---------------------+
  | OpportunityHistory  |
  |---------------------|
  | id (PK, UUID)       |
  | opportunityId (FK)  |
  | changedByUserId(FK) |
  | fromStage (nullable)|
  | toStage             |
  | changedAt           |
  +---------------------+
```

### 8.2 Descripcion de Entidades

#### User (users)
Representa a los usuarios del sistema (vendedores y duenos). Sin diferenciacion de roles en el MVP. Es la entidad central de autenticacion y se referencia desde oportunidades (asignacion), historial de oportunidades (quien cambio la etapa), actividades (responsable), y mensajes (quien asigno manualmente un mensaje).

#### Client (clients)
Persona fisica registrada como cliente o prospecto. Entidad central del CRM. Tiene constraints de unicidad en `dni` y `phonePrimary`. El campo `email` se usa para vincular emails entrantes de Gmail. El campo `whatsappNumber` se usa para vincular mensajes entrantes de WhatsApp. Soporta eliminacion logica via `isActive`.

#### Opportunity (opportunities)
Oportunidad de venta asociada a un cliente. Tiene una etapa actual (`stage`) dentro del pipeline de 4 etapas. El campo `isOpen` indica si esta activa o cerrada. Al cerrarse, `result` indica si fue ganada o perdida, y `lossReason` registra el motivo de perdida.

#### OpportunityHistory (opportunity_history)
Registro inmutable de cambios de etapa en las oportunidades. Cada vez que una oportunidad cambia de etapa, se crea un nuevo registro. Permite trazabilidad completa (RNF-08).

#### Activity (activities)
Actividad comercial (llamada, reunion, tarea) vinculada a un cliente y opcionalmente a una oportunidad. Tiene estado (pendiente/realizada) y soporte para fecha de vencimiento.

#### Message (messages)
Registro unificado de comunicaciones via Gmail y WhatsApp. El campo `clientId` es nullable: cuando es null, el mensaje esta en la bandeja general (no vinculado a ningun cliente). La combinacion `channel + externalId` es unica para garantizar idempotencia en la recepcion de mensajes.

#### GmailCredential (gmail_credentials)
Almacena los tokens OAuth de las cuentas de Gmail vinculadas. Los tokens se almacenan encriptados. Una entrada por cuenta de Gmail conectada.

#### WhatsappConfig (whatsapp_config)
Configuracion de la cuenta de WhatsApp Business. Un unico registro activo para todo el negocio. Almacena el token de API encriptado y el token de verificacion de webhook.

### 8.3 Relaciones Principales

| Relacion | Cardinalidad | Descripcion |
|----------|-------------|-------------|
| Client -> Opportunity | 1:N | Un cliente puede tener multiples oportunidades de venta |
| Client -> Activity | 1:N | Un cliente puede tener multiples actividades asociadas |
| Client -> Message | 1:N | Un cliente puede tener multiples mensajes (emails y WhatsApp) |
| Opportunity -> OpportunityHistory | 1:N | Una oportunidad tiene multiples registros de cambios de etapa |
| Opportunity -> Activity | 1:N | Una oportunidad puede tener multiples actividades asociadas |
| User -> Opportunity | 1:N | Un usuario puede ser responsable de multiples oportunidades |
| User -> Activity | 1:N | Un usuario puede ser responsable de multiples actividades |
| User -> OpportunityHistory | 1:N | Un usuario puede haber cambiado etapas en multiples oportunidades |
| User -> Message | 1:N | Un usuario puede haber asignado manualmente multiples mensajes |

---

## 9. Criterios de Aceptacion

### 9.1 Gestion de Clientes

```gherkin
Feature: Alta de cliente (RF-01, RF-02)

  Scenario: Alta exitosa de un cliente nuevo
    Given el usuario esta autenticado en el sistema
    And esta en la pantalla de alta de cliente
    When completa Nombre "Laura", Apellido "Garcia", DNI "32111222", Telefono "1144556677"
    And hace click en "Guardar"
    Then el sistema crea el cliente exitosamente
    And redirige al perfil de Laura Garcia
    And el cliente aparece en el listado de clientes

  Scenario: Deteccion de duplicado por DNI
    Given existe un cliente "Marcos Perez" con DNI "28555333"
    And el usuario esta en la pantalla de alta de cliente
    When completa DNI "28555333" y hace click en "Guardar"
    Then el sistema muestra una alerta "Ya existe un cliente con DNI 28555333: Marcos Perez"
    And ofrece las opciones "Cancelar", "Forzar alta", "Ver existente"

  Scenario: Deteccion de duplicado por telefono principal
    Given existe un cliente "Diana Rossi" con telefono "1199887766"
    And el usuario esta en la pantalla de alta de cliente
    When completa Telefono principal "1199887766" y hace click en "Guardar"
    Then el sistema muestra una alerta indicando duplicado con Diana Rossi
    And ofrece las opciones "Cancelar", "Forzar alta", "Ver existente"

  Scenario: Validacion de campos obligatorios
    Given el usuario esta en la pantalla de alta de cliente
    When deja el campo Nombre vacio y hace click en "Guardar"
    Then el sistema muestra un error de validacion "El nombre es obligatorio"
    And no se crea ningun registro

Feature: Busqueda de clientes (RF-04)

  Scenario: Busqueda por nombre
    Given existen clientes "Laura Garcia", "Laura Martinez", "Pedro Lopez"
    When el usuario escribe "Laura" en el campo de busqueda
    Then el listado muestra "Laura Garcia" y "Laura Martinez"
    And no muestra "Pedro Lopez"

  Scenario: Filtro por estado inactivo
    Given existe un cliente inactivo "Carlos Gomez"
    When el usuario ve el listado de clientes sin filtros
    Then "Carlos Gomez" no aparece en el listado
    When el usuario aplica el filtro Estado = "Inactivo"
    Then "Carlos Gomez" aparece en el listado

Feature: Eliminacion logica (RF-06)

  Scenario: Desactivar un cliente
    Given existe un cliente activo "Laura Garcia"
    When el usuario selecciona "Desactivar" desde el menu de acciones
    And confirma la accion
    Then el cliente "Laura Garcia" se marca como inactivo
    And desaparece del listado por defecto
    But sigue existiendo en la base de datos
```

### 9.2 Pipeline de Ventas

```gherkin
Feature: Pipeline de ventas (RF-07, RF-08, RF-09, RF-10, RF-11)

  Scenario: Crear oportunidad
    Given existe un cliente "Laura Garcia"
    And el usuario esta en el perfil de Laura Garcia
    When hace click en "[+ Nueva oportunidad]"
    And completa modelo de moto "Honda CB 300"
    And hace click en "Crear"
    Then se crea una oportunidad en etapa "Consulta"
    And aparece una tarjeta en la columna "Consulta" del Kanban
    And se registra el historial: from=null, to=Consulta

  Scenario: Mover oportunidad entre etapas via drag and drop
    Given existe una oportunidad de "Laura Garcia" en etapa "Consulta"
    When el usuario arrastra la tarjeta a la columna "Presupuesto"
    Then la oportunidad se mueve a etapa "Presupuesto"
    And se registra en el historial: from=Consulta, to=Presupuesto, usuario, fecha

  Scenario: Cierre ganado
    Given existe una oportunidad de "Laura Garcia" en etapa "Presupuesto"
    When el usuario mueve la oportunidad a "Cierre"
    Then el sistema solicita resultado: "Ganado" o "Perdido"
    When el usuario selecciona "Ganado"
    Then la oportunidad se cierra con resultado "Ganado"
    And isOpen se establece en false

  Scenario: Cierre perdido con motivo
    Given existe una oportunidad de "Marcos Perez" en etapa "Prueba de manejo"
    When el usuario mueve la oportunidad a "Cierre"
    And selecciona "Perdido"
    And escribe motivo "Compro en la competencia"
    Then la oportunidad se cierra con resultado "Perdido" y motivo registrado
    And isOpen se establece en false

  Scenario: Vista Kanban muestra informacion correcta
    Given existen 3 oportunidades en "Consulta" y 2 en "Presupuesto"
    When el usuario accede al Pipeline
    Then la columna "Consulta" muestra "3 oport."
    And la columna "Presupuesto" muestra "2 oport."
    And cada tarjeta muestra nombre del cliente y modelo de moto
```

### 9.3 Actividades

```gherkin
Feature: Gestion de actividades (RF-13, RF-14, RF-15, RF-16)

  Scenario: Crear actividad de tipo llamada
    Given existe un cliente "Laura Garcia"
    And el usuario esta en el perfil de Laura Garcia
    When hace click en "[+ Actividad]"
    And selecciona tipo "Llamada"
    And completa titulo "Seguimiento presupuesto"
    And selecciona fecha y hora "2026-04-01 10:00"
    And hace click en "Crear"
    Then se crea la actividad con estado "Pendiente"
    And aparece en el tab "Actividad" del perfil de Laura Garcia
    And aparece en el listado general de actividades

  Scenario: Marcar actividad como realizada con resumen
    Given existe una actividad pendiente "Seguimiento presupuesto"
    When el usuario la marca como "Realizada"
    And escribe resumen "Laura confirmo interes, pide financiacion"
    Then el estado cambia a "Realizada"
    And el resumen queda registrado

  Scenario: Actividad vencida se destaca visualmente
    Given existe una actividad pendiente con dueAt "2026-03-28"
    And la fecha actual es "2026-03-29"
    When el usuario ve el listado de actividades
    Then la actividad se muestra con indicador visual de vencida

  Scenario: Filtrar actividades por estado
    Given existen 5 actividades pendientes y 3 realizadas
    When el usuario filtra por estado "Pendiente"
    Then el listado muestra solo las 5 actividades pendientes
```

### 9.4 Comunicaciones

```gherkin
Feature: Comunicaciones Gmail y WhatsApp (RF-19 a RF-24)

  Scenario: Enviar email a cliente
    Given existe un cliente "Laura Garcia" con email "laura@email.com"
    And hay una cuenta de Gmail vinculada
    When el usuario accede al perfil de Laura Garcia
    And selecciona "Email" en el tab Comunicaciones
    And redacta un email con asunto "Presupuesto Honda CB 300"
    And hace click en "Enviar"
    Then el email se envia via el provider de Gmail
    And se registra en messages con channel=gmail, direction=outbound
    And aparece en el historial de comunicaciones de Laura Garcia

  Scenario: Recibir email y vincular automaticamente
    Given existe un cliente "Laura Garcia" con email "laura@email.com"
    When el sistema recibe un email de "laura@email.com"
    Then el email se almacena con clientId de Laura Garcia
    And aparece en el historial de comunicaciones de Laura Garcia

  Scenario: Recibir mensaje de remitente desconocido
    Given no existe ningun cliente con email "nuevo@email.com"
    When el sistema recibe un email de "nuevo@email.com"
    Then el email se almacena con clientId = null
    And aparece en la bandeja general de mensajes no vinculados

  Scenario: Vincular manualmente un mensaje de la bandeja general
    Given existe un mensaje no vinculado de "nuevo@email.com" en la bandeja general
    And existe un cliente "Pedro Lopez"
    When el usuario selecciona el mensaje
    And elige "Asignar a cliente existente"
    And busca y selecciona "Pedro Lopez"
    Then el mensaje se actualiza con clientId de Pedro Lopez
    And aparece en el historial de comunicaciones de Pedro Lopez

  Scenario: Enviar WhatsApp a cliente
    Given existe un cliente "Marcos Perez" con whatsappNumber "1122334455"
    And hay una cuenta de WhatsApp Business vinculada
    When el usuario accede al perfil de Marcos Perez
    And selecciona "WhatsApp" en el tab Comunicaciones
    And escribe "Hola Marcos, tenemos una promo en Yamaha R3"
    And hace click en "Enviar"
    Then el mensaje se envia via el provider de WhatsApp
    And se registra en messages con channel=whatsapp, direction=outbound
```

### 9.5 Autenticacion

```gherkin
Feature: Autenticacion (RF-27, RF-28, RF-29)

  Scenario: Login exitoso
    Given existe un usuario con email "vendedor@ciudadmoto.com" y contrasena valida
    When el usuario ingresa email "vendedor@ciudadmoto.com" y contrasena correcta
    And hace click en "Iniciar sesion"
    Then el sistema emite un token JWT
    And redirige al dashboard principal

  Scenario: Login fallido con contrasena incorrecta
    Given existe un usuario con email "vendedor@ciudadmoto.com"
    When el usuario ingresa email "vendedor@ciudadmoto.com" y contrasena incorrecta
    Then el sistema muestra error "Credenciales invalidas"
    And no se emite token JWT
    And el usuario permanece en la pantalla de login

  Scenario: Acceso sin autenticacion
    Given el usuario no tiene sesion activa
    When intenta acceder a cualquier ruta del sistema
    Then el sistema redirige a la pantalla de login

  Scenario: Cierre de sesion
    Given el usuario tiene sesion activa
    When hace click en "Cerrar sesion"
    Then la sesion se invalida
    And el sistema redirige a la pantalla de login
```

### 9.6 Reportes

```gherkin
Feature: Reportes (RF-25, RF-26)

  Scenario: Reporte de clientes nuevos por periodo
    Given existen 3 clientes creados entre 2026-03-01 y 2026-03-31
    When el usuario accede al reporte "Clientes nuevos"
    And selecciona rango 2026-03-01 a 2026-03-31
    Then el reporte muestra 3 clientes
    And cada fila muestra nombre completo, fecha de alta y como nos conocio

  Scenario: Reporte de actividades por vendedor
    Given el vendedor "Juan" realizo 5 llamadas y 2 reuniones en marzo 2026
    And la vendedora "Maria" realizo 3 llamadas y 1 tarea en marzo 2026
    When el usuario accede al reporte "Actividades por vendedor"
    And selecciona rango 2026-03-01 a 2026-03-31
    Then el reporte muestra:
      | Vendedor | Llamadas | Reuniones | Tareas |
      | Juan     | 5        | 2         | 0      |
      | Maria    | 3        | 0         | 1      |
```

---

## 10. Exclusiones

Los siguientes elementos quedan **explicitamente fuera del alcance** de este MVP:

| # | Elemento excluido | Razon |
|---|-------------------|-------|
| 1 | Gestion de stock / inventario | El pipeline es independiente del stock. El campo `motoInterest` es texto libre. Posible integracion en fase futura. |
| 2 | Diferenciacion de roles y permisos | Todos los usuarios tienen el mismo nivel de acceso. No hay rol "admin" vs "vendedor". Mejora futura. |
| 3 | Aplicacion movil (iOS / Android) | Solo se desarrolla version web de escritorio. |
| 4 | Diseno responsivo / mobile-first | La interfaz esta diseñada para escritorio (min. 1366x768). No hay adaptacion mobile. |
| 5 | Cotizador / presupuestador de motos | La etapa "Presupuesto" en el pipeline es un estado de la oportunidad, no un modulo de calculo de precios. |
| 6 | Integracion con sistemas contables o ERP | No contemplado en el MVP. |
| 7 | Integracion con redes sociales (Instagram, Facebook) | Solo Gmail y WhatsApp como canales de comunicacion. |
| 8 | Automatizaciones y campanas de marketing | No hay envios masivos, secuencias automatizadas, ni triggers automaticos. |
| 9 | Gestion de clientes juridicos (empresas) | Solo personas fisicas. El modelo `Client` no tiene campos de razon social, CUIT, etc. |
| 10 | Asignacion / reasignacion de clientes entre vendedores | No hay concepto de "propiedad" de cliente por vendedor. |
| 11 | Facturacion o gestion de pagos | No contemplado. |
| 12 | Exportacion de reportes a Excel / PDF | Los reportes se visualizan unicamente en pantalla. La exportacion es mejora futura. |
| 13 | Notificaciones internas | No hay sistema de notificaciones push, email, ni alertas automaticas al vencer actividades. |
| 14 | Migracion de datos historicos | El sistema arranca desde cero. No se migran datos de sistemas anteriores. |
| 15 | Multi-sucursal como entidad gestionable | Aunque el wireframe muestra un selector de sucursal, no existe una entidad `Branch` en el modelo de datos actual. La funcionalidad de sucursal no esta implementada en el MVP. |

---

*Documento elaborado por el Analista Funcional del equipo GEN a partir de la especificacion original, los wireframes aprobados, el schema Prisma implementado, y la estructura real de modulos del backend.*

*Fecha de elaboracion: 2026-03-29*
*Proxima revision: Al cierre del Sprint 1*
