# Arquitectura Tecnica: CRM Ciudad Moto

**Version**: 1.0
**Fecha**: 2026-03-29
**Preparado por**: Arquitecto de Software -- Equipo GEN
**Estado**: Documento formal de referencia

---

## Tabla de Contenidos

1. [Resumen de Arquitectura](#1-resumen-de-arquitectura)
2. [Stack Tecnologico](#2-stack-tecnologico)
3. [Diagrama de Componentes](#3-diagrama-de-componentes)
4. [Diagrama de Capas](#4-diagrama-de-capas)
5. [Modulos del Sistema](#5-modulos-del-sistema)
6. [Modelo de Datos / DER](#6-modelo-de-datos--der)
7. [Autenticacion y Seguridad](#7-autenticacion-y-seguridad)
8. [API Design](#8-api-design)
9. [Decisiones de Arquitectura (ADRs)](#9-decisiones-de-arquitectura-adrs)
10. [Diagrama de Despliegue](#10-diagrama-de-despliegue)

---

## 1. Resumen de Arquitectura

### 1.1 Vision General

CRM Ciudad Moto es una aplicacion web de escritorio para gestion comercial de una
concesionaria de motos. Permite gestionar clientes, oportunidades de venta (pipeline
Kanban), actividades comerciales (llamadas, reuniones, tareas) y comunicaciones
unificadas (Gmail y WhatsApp).

### 1.2 Tipo de Arquitectura: Monolito Modular

El sistema sigue una arquitectura **monolito modular** con las siguientes caracteristicas:

- **Un unico proceso Node.js** expone la API REST, recibe webhooks y ejecuta logica
  de negocio.
- **Modulos de negocio independientes** (auth, clients, opportunities, activities,
  communications, reports) con separacion clara de responsabilidades.
- **Seams bien definidos** entre modulos que permiten extraccion a microservicios en
  el futuro sin reescribir logica de negocio.
- **Comunicacion interna por llamadas de funcion**, no por red, lo que elimina la
  latencia y complejidad de coordinacion distribuida.

### 1.3 Principios Arquitectonicos

| Principio | Aplicacion en el Sistema |
|-----------|--------------------------|
| **Simplicidad operacional** | Un solo servicio de backend desplegable reduce la superficie de operacion y monitoreo. |
| **Separacion de responsabilidades** | Cada modulo encapsula su propia logica de negocio, validacion, rutas y acceso a datos. |
| **Seguridad por diseno** | JWT con refresh token en HttpOnly cookie, tokens de integracion cifrados en reposo (AES-256-GCM), validacion de webhooks antes de cualquier procesamiento. |
| **Evolucion sin reescritura** | Interfaces claras entre modulos permiten extraccion a servicios independientes si la escala lo exige. |
| **Observabilidad** | Logging estructurado (Pino via Fastify), health check dedicado, logs de webhooks entrantes. |
| **Validacion en la frontera** | Zod schemas validan toda entrada del usuario en capa de framework antes de llegar a logica de negocio. |

### 1.4 Caracteristicas de Escala

| Dimension | Valor Esperado |
|-----------|---------------|
| Usuarios concurrentes | < 10 simultaneos |
| Volumen de clientes | ~5.000 registros |
| Mensajes entrantes | Esporadicos, no requieren tiempo real estricto |
| Disponibilidad requerida | 99% en horario comercial |

Estas caracteristicas justifican la eleccion de un monolito modular sobre microservicios:
la complejidad operacional de una arquitectura distribuida no aporta valor a esta escala.

---

## 2. Stack Tecnologico

### 2.1 Backend

| Tecnologia | Version | Justificacion |
|-----------|---------|---------------|
| **Node.js** | 20 LTS | Runtime LTS activo con soporte hasta 2026-04. Ecosistema maduro para APIs REST. |
| **TypeScript** | 5.x | Strict mode habilitado. Elimina errores de runtime a traves de tipos en compilacion. Prohibido `any`. |
| **Fastify** | 4.x | 3x mas throughput que Express en benchmarks reales. Validacion de esquemas integrada, sistema de plugins maduro, soporte nativo de TypeScript. |
| **Prisma** | 5.x | Genera tipos TS directamente del schema. Migraciones predecibles y versionadas en git. Acceso a SQL raw via `$queryRaw` cuando se necesita. |
| **PostgreSQL** | 16 | Ultima version estable. Soporte de UUID, JSONB, indices parciales, full-text search. Base de datos relacional probada para CRM. |
| **Zod** | 3.x | Validacion schema-first integrada con Fastify. Mismos schemas compartibles con el frontend. |
| **@fastify/jwt + bcrypt** | jwt 8.x / bcrypt 5.x | JWT para access tokens, bcrypt (12 rounds) para hashing de contrasenas. Sin dependencia de servicios de auth externos. |
| **Vitest** | latest | Testing framework mas rapido que Jest, misma API. Integracion nativa con TypeScript. |
| **Redis** | 7.x | Cola de trabajos asincrona (BullMQ), cache de sesiones. Desplegado como servicio separado en Docker. |

### 2.2 Frontend

| Tecnologia | Version | Justificacion |
|-----------|---------|---------------|
| **React** | 18.x | Libreria UI de facto. Ecosistema extenso, documentacion solida, equipo familiarizado. |
| **Vite** | 5.x | Build tool significativamente mas rapido que CRA/Webpack. HMR instantaneo en desarrollo. |
| **TypeScript** | 5.x | Mismo nivel de strictness que el backend. Tipos compartidos. |
| **React Router** | 6.x | Data router pattern para carga de datos declarativa. |
| **TanStack Query** | 5.x | Cache de server state, loading states, refetch automatico. Reemplaza la necesidad de estado global para datos del servidor. |
| **Axios** | 1.x | HTTP client con interceptors para manejo automatico de tokens y refresh. |
| **Zustand** | 4.x | Estado global minimalista. Usado exclusivamente para auth state (access token en memoria). |
| **shadcn/ui + Tailwind CSS** | v3 | Componentes sin lock-in, completamente customizables. Tailwind para estilos utilitarios. |
| **React Hook Form + Zod** | RHF 7.x | Formularios de alto rendimiento con validacion integrada via Zod (mismos schemas del backend). |
| **@dnd-kit** | 6.x | Drag and drop accesible para el Kanban del pipeline. Sin dependencias pesadas. |

### 2.3 Infraestructura y Tooling

| Tecnologia | Proposito |
|-----------|-----------|
| **Docker Compose** | Entorno de desarrollo local (PostgreSQL 16, Redis 7, backend, frontend). |
| **GitHub Actions** | CI pipeline: lint, type-check, tests para backend y frontend. |
| **Vercel** | Deploy del frontend (SPA estática). |
| **Render** | Deploy del backend (Node.js) y PostgreSQL gestionado. |
| **ESLint 9 + Prettier** | Linting y formateo automatico. Flat config. |
| **Husky + lint-staged** | Pre-commit hooks que bloquean commits con errores de lint. |
| **Swagger/OpenAPI** | Documentacion automatica de API (solo en desarrollo). |

---

## 3. Diagrama de Componentes

### 3.1 Vista General del Sistema

```
+=====================================================================+
|                        NAVEGADOR (Chrome/Edge)                       |
|                                                                      |
|  +----------------------------------------------------------------+  |
|  |                     REACT SPA (Vite)                           |  |
|  |                                                                |  |
|  |  +----------+ +----------+ +-----------+ +------------------+  |  |
|  |  | Clientes | | Pipeline | |Actividades| | Comunicaciones   |  |  |
|  |  | (CRUD +  | | (Kanban  | | (Agenda + | | (Bandeja Gmail + |  |  |
|  |  |  perfil) | | dnd-kit) | |  filtros) | |  WhatsApp)       |  |  |
|  |  +----------+ +----------+ +-----------+ +------------------+  |  |
|  |  +----------+ +----------+                                     |  |
|  |  | Reportes | |   Auth   |                                     |  |
|  |  | (charts) | | (login)  |                                     |  |
|  |  +----------+ +----------+                                     |  |
|  |                                                                |  |
|  |  [ TanStack Query ]  [ Zustand (auth) ]  [ React Router ]     |  |
|  +----------------------------------------------------------------+  |
+=====================================================================+
          |                                          |
          | HTTPS / REST + JSON                      | JWT en header
          | (Axios con interceptors)                 | Authorization: Bearer
          v                                          v
+=====================================================================+
|                    FASTIFY SERVER (Node.js 20)                       |
|                                                                      |
|  +--------------------------------------------------------------+   |
|  |                    PLUGINS DE SEGURIDAD                       |   |
|  |  [ Helmet ]  [ CORS ]  [ Rate Limit ]  [ Cookie ]  [ JWT ]   |   |
|  +--------------------------------------------------------------+   |
|                                                                      |
|  +--------------------------------------------------------------+   |
|  |                     API GATEWAY  /api/v1/                     |   |
|  |                                                               |   |
|  |  /auth/*  /clients/*  /opportunities/*  /activities/*         |   |
|  |  /communications/*  /reports/*  /webhooks/*                   |   |
|  +--------------------------------------------------------------+   |
|                               |                                      |
|  +--------------------------------------------------------------+   |
|  |                  MODULOS DE NEGOCIO                            |   |
|  |                                                               |   |
|  |  +--------+ +----------+ +---------------+ +-------------+   |   |
|  |  |  Auth  | | Clients  | | Opportunities | | Activities  |   |   |
|  |  +--------+ +----------+ +---------------+ +-------------+   |   |
|  |  +----------------+ +-----------+                             |   |
|  |  | Communications | |  Reports  |                             |   |
|  |  +----------------+ +-----------+                             |   |
|  +--------------------------------------------------------------+   |
|                               |                                      |
|  +--------------------------------------------------------------+   |
|  |                    PRISMA CLIENT (ORM)                        |   |
|  +--------------------------------------------------------------+   |
+=====================================================================+
          |                           |                    |
          v                           v                    v
  +---------------+          +--------------+      +--------------+
  | PostgreSQL 16 |          |   Redis 7    |      | Mock Gmail / |
  | (Render)      |          | (BullMQ +    |      | WhatsApp     |
  |               |          |  cache)      |      | Providers    |
  | 8 tablas      |          +--------------+      +--------------+
  | principales   |                                       |
  +---------------+                              (En MVP: providers
                                                  mock devuelven
                                                  respuestas simuladas)
```

### 3.2 Flujo de Comunicaciones con Mock Providers

```
                    +-------------------------------+
                    |    Communications Module       |
                    |                               |
                    |  communications.service.ts    |
                    |  communications.routes.ts     |
                    +-------------------------------+
                         |                    |
                         v                    v
              +------------------+  +-------------------+
              | gmail.provider   |  | whatsapp.provider  |
              |   .ts            |  |   .ts              |
              +------------------+  +-------------------+
                    |                        |
          +---------+---------+    +---------+---------+
          |                   |    |                   |
          v                   v    v                   v
    [MOCK MODE]         [REAL MODE]  [MOCK MODE]  [REAL MODE]
    Devuelve            Gmail API    Devuelve     WhatsApp
    respuesta           v1 OAuth     respuesta    Business
    simulada            + Pub/Sub    simulada     Cloud API
```

Los providers estan disenados con una interfaz comun que permite alternar entre modo
mock y modo real sin cambiar la logica del servicio de comunicaciones. En el MVP se
trabaja con mock providers que simulan envios y recepciones exitosas.

---

## 4. Diagrama de Capas

```
+=======================================================================+
|                        CAPA DE PRESENTACION                           |
|                                                                       |
|   React SPA + TanStack Query + Zustand + React Router + shadcn/ui    |
|                                                                       |
|   Responsabilidades:                                                  |
|   - Renderizado de UI y manejo de interacciones                       |
|   - Cache de server state (TanStack Query)                            |
|   - Auth state en memoria (Zustand)                                   |
|   - Validacion de formularios (React Hook Form + Zod)                 |
+=======================================================================+
        |
        | HTTP/REST + JSON (Axios)
        | JWT Bearer Token
        v
+=======================================================================+
|                         CAPA DE API (Routing)                         |
|                                                                       |
|   Fastify Routes + Plugins de Seguridad                               |
|                                                                       |
|   Archivos: *.routes.ts + *.schema.ts                                 |
|                                                                       |
|   Responsabilidades:                                                  |
|   - Recepcion y parsing de HTTP requests                              |
|   - Validacion de entrada con Zod schemas                             |
|   - Autenticacion (JWT middleware)                                     |
|   - Rate limiting, CORS, Helmet                                       |
|   - Serializacion de respuestas                                       |
|   - Documentacion OpenAPI/Swagger                                     |
+=======================================================================+
        |
        | Llamada de funcion (in-process)
        v
+=======================================================================+
|                       CAPA DE SERVICIO (Negocio)                      |
|                                                                       |
|   Archivos: *.service.ts                                              |
|                                                                       |
|   Responsabilidades:                                                  |
|   - Logica de negocio y reglas de dominio                             |
|   - Orquestacion de operaciones entre modulos                         |
|   - Coordinacion con providers externos (Gmail, WhatsApp)             |
|   - Validacion de reglas de negocio (duplicados, transiciones)        |
|   - Transformacion de datos entre capas                               |
+=======================================================================+
        |
        | Llamada de funcion (in-process)
        v
+=======================================================================+
|                    CAPA DE REPOSITORIO (Acceso a Datos)               |
|                                                                       |
|   Prisma Client (singleton) + Queries tipados                         |
|                                                                       |
|   Responsabilidades:                                                  |
|   - CRUD contra PostgreSQL                                            |
|   - Construccion de queries con filtros, paginacion, ordenamiento     |
|   - Transacciones de base de datos (Prisma.$transaction)              |
|   - Indices optimizados para patrones de consulta frecuentes          |
|   - SQL raw via $queryRaw para consultas complejas (reportes)         |
+=======================================================================+
        |
        | TCP (connection pool via Prisma)
        v
+=======================================================================+
|                       CAPA DE PERSISTENCIA                            |
|                                                                       |
|   PostgreSQL 16                                                       |
|                                                                       |
|   - 8 tablas principales + enums                                      |
|   - UUID como primary keys                                            |
|   - Timestamps con timezone (TIMESTAMPTZ)                             |
|   - Indices para lookups de vinculacion (email, whatsapp_number)      |
|   - Soft delete (is_active) en lugar de DELETE fisico                 |
+=======================================================================+
```

### 4.1 Regla de Dependencia

Las dependencias fluyen en una sola direccion: de arriba hacia abajo. Ninguna capa
inferior conoce ni depende de la capa superior.

```
Presentacion  -->  API  -->  Servicio  -->  Repositorio  -->  Persistencia
```

Ningun archivo `.service.ts` importa de `.routes.ts`. Ningun archivo de Prisma
conoce la existencia de Fastify. Esta regla se aplica por convencion y se verifica
en code review.

---

## 5. Modulos del Sistema

### 5.1 Modulo Auth (`/modules/auth/`)

| Aspecto | Detalle |
|---------|---------|
| **Responsabilidad** | Registro, login, logout, renovacion de tokens JWT, gestion de sesiones. |
| **Archivos** | `auth.routes.ts`, `auth.service.ts`, `auth.schema.ts` |
| **Endpoints** | `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh` |
| **Dependencias** | @fastify/jwt, bcrypt, Prisma (tablas: `users`, `refresh_tokens`) |
| **Seguridad** | Contrasenas hasheadas con bcrypt (12 rounds). Access token JWT (15 min). Refresh token en HttpOnly cookie (7 dias). Revocacion en logout. |

### 5.2 Modulo Clients (`/modules/clients/`)

| Aspecto | Detalle |
|---------|---------|
| **Responsabilidad** | CRUD de clientes, deteccion de duplicados por DNI/telefono, busqueda con paginacion, baja logica. |
| **Archivos** | `clients.routes.ts`, `clients.service.ts`, `clients.schema.ts` |
| **Endpoints** | `GET /clients`, `POST /clients`, `GET /clients/:id`, `PATCH /clients/:id`, `DELETE /clients/:id` |
| **Sub-recursos** | `GET /clients/:id/communications`, `GET /clients/:id/opportunities`, `GET /clients/:id/activities` |
| **Dependencias** | Prisma (tabla: `clients`). Indices en `email`, `whatsapp_number`, `is_active`. |
| **Reglas de negocio** | DNI unico, telefono primario unico. Delete es soft delete (`is_active = false`). |

### 5.3 Modulo Opportunities (`/modules/opportunities/`)

| Aspecto | Detalle |
|---------|---------|
| **Responsabilidad** | Gestion del pipeline de ventas. Creacion de oportunidades, movimiento entre etapas (Kanban), cierre con resultado (ganado/perdido), historial de cambios. |
| **Archivos** | `opportunities.routes.ts`, `opportunities.service.ts`, `opportunities.schema.ts` |
| **Endpoints** | `GET /opportunities`, `POST /opportunities`, `PATCH /opportunities/:id` |
| **Etapas del pipeline** | `consulta` -> `prueba_manejo` -> `presupuesto` -> `cierre` |
| **Dependencias** | Prisma (tablas: `opportunities`, `opportunity_history`). Indices en `client_id`, `assigned_user_id`, `stage`, `is_open`. |
| **Reglas de negocio** | Cada cambio de etapa genera un registro en `opportunity_history` con usuario responsable, etapa origen y etapa destino. Al cerrar: se registra `result` (ganado/perdido) y `loss_reason` si aplica. |

### 5.4 Modulo Activities (`/modules/activities/`)

| Aspecto | Detalle |
|---------|---------|
| **Responsabilidad** | CRUD de actividades comerciales (llamadas, reuniones, tareas). Filtros por tipo, estado, fecha. Vinculacion a clientes y opcionalmente a oportunidades. |
| **Archivos** | `activities.routes.ts`, `activities.service.ts`, `activities.schema.ts` |
| **Endpoints** | `GET /activities`, `POST /activities`, `PATCH /activities/:id` |
| **Tipos** | `llamada`, `reunion`, `tarea` |
| **Estados** | `pendiente`, `realizada` |
| **Dependencias** | Prisma (tabla: `activities`). Indices en `client_id`, `opportunity_id`, `responsible_user_id`, `status`, `scheduled_at`. |
| **Reglas de negocio** | Al marcar como realizada, se registra un `summary` con el resultado de la actividad. El campo `due_at` permite controlar vencimientos. |

### 5.5 Modulo Communications (`/modules/communications/`)

| Aspecto | Detalle |
|---------|---------|
| **Responsabilidad** | Historial unificado de comunicaciones (Gmail + WhatsApp). Envio de mensajes, recepcion via webhooks, vinculacion automatica a clientes, bandeja general para mensajes no vinculados, asignacion manual. |
| **Archivos** | `communications.routes.ts`, `communications.service.ts`, `communications.schema.ts`, `providers/gmail.provider.ts`, `providers/whatsapp.provider.ts` |
| **Endpoints** | `GET /communications`, `POST /communications/gmail/send`, `POST /communications/whatsapp/send`, `PATCH /communications/:id/assign`, `POST /webhooks/gmail`, `POST /webhooks/whatsapp`, `GET /webhooks/whatsapp` |
| **Dependencias** | Prisma (tablas: `messages`, `gmail_credentials`, `whatsapp_config`). Gmail API (googleapis). WhatsApp Business Cloud API. |
| **Reglas de negocio** | Vinculacion automatica por email (Gmail) o whatsapp_number (WhatsApp). Match exacto, no fuzzy. Mensajes sin match van a bandeja general (`client_id = NULL`). Idempotencia garantizada por `external_id` unico por canal. Tokens de integracion cifrados con AES-256-GCM. |
| **Providers** | Gmail y WhatsApp providers con interfaz comun. Soportan modo mock para desarrollo sin dependencias externas. |

### 5.6 Modulo Reports (`/modules/reports/`)

| Aspecto | Detalle |
|---------|---------|
| **Responsabilidad** | Consultas agregadas para dashboards. Clientes nuevos por periodo, actividades por estado, oportunidades por etapa, conversion del pipeline. |
| **Archivos** | `reports.routes.ts`, `reports.service.ts`, `reports.schema.ts` |
| **Endpoints** | `GET /reports/clients-new`, `GET /reports/activities-summary`, `GET /reports/pipeline-summary` |
| **Dependencias** | Prisma ($queryRaw para consultas agregadas complejas). |
| **Observacion** | Los reportes son de solo lectura. No modifican datos. Usan queries optimizados con indices existentes. |

---

## 6. Modelo de Datos / DER

### 6.1 Diagrama de Entidad-Relacion

```
+==================+          +====================+          +========================+
|      USERS       |          |      CLIENTS       |          |    GMAIL_CREDENTIALS   |
+==================+          +====================+          +========================+
| id          [PK] |          | id            [PK] |          | id              [PK]   |
| full_name        |          | first_name         |          | gmail_address   [UQ]   |
| email       [UQ] |          | last_name          |          | access_token_enc       |
| password_hash    |          | dni           [UQ] |          | refresh_token_enc      |
| is_active        |          | phone_primary [UQ] |          | token_expiry           |
| created_at       |          | phone_alt          |          | pubsub_history_id      |
+==================+          | email         [IX] |          | is_active              |
      |                       | whatsapp_number[IX]|          | created_at             |
      |                       | city               |          +========================+
      |                       | province           |
      |                       | birth_date         |          +========================+
      |                       | how_found_us       |          |   WHATSAPP_CONFIG      |
      |                       | notes              |          +========================+
      |                       | is_active     [IX] |          | id              [PK]   |
      |                       | created_at         |          | phone_number_id        |
      |                       | updated_at         |          | api_token_enc          |
      |                       +====================+          | webhook_verify_token   |
      |                          |         |      |           | is_active              |
      |                          |         |      |           | updated_at             |
      |                          |         |      |           +========================+
      |            +-------------+         |      |
      |            |                       |      +------------------------+
      |            |                       |                               |
      |            v                       v                               v
      |   +====================+  +==================+          +====================+
      |   |   OPPORTUNITIES    |  |   ACTIVITIES     |          |     MESSAGES       |
      |   +====================+  +==================+          +====================+
      |   | id            [PK] |  | id          [PK] |          | id            [PK] |
      |   | client_id     [FK] |--| client_id   [FK] |          | channel            |
      +-->| assigned_user [FK] |  | opportunity [FK] |---+      | direction          |
      |   | moto_interest      |  | responsible [FK] |---+--+   | client_id     [FK] |
      |   | stage              |  | type             |   |  |   | external_id        |
      |   | result             |  | title            |   |  |   | from_address       |
      |   | loss_reason        |  | scheduled_at[IX] |   |  |   | to_address         |
      |   | is_open       [IX] |  | due_at           |   |  |   | subject            |
      |   | created_at         |  | status      [IX] |   |  |   | body               |
      |   | updated_at         |  | summary          |   |  |   | sent_received_at   |
      |   +====================+  | created_at       |   |  |   | assigned_by   [FK] |
      |            |              | updated_at       |   |  |   | created_at         |
      |            |              +==================+   |  |   +====================+
      |            |                                     |  |      [UQ: channel +
      |            v                                     |  |       external_id]
      |   +========================+                     |  |
      |   |  OPPORTUNITY_HISTORY   |                     |  |
      |   +========================+                     |  |
      +-->| id                [PK] |                     |  |
          | opportunity_id    [FK] |                     |  |
          | changed_by_user   [FK] |<--------------------+  |
          | from_stage             |                        |
          | to_stage               |                        |
          | changed_at             |                        |
          +========================+                        |
                                                            |
          (users.id es FK destino para  <-------------------+
           activities.responsible_user_id,
           opportunity_history.changed_by_user_id,
           messages.assigned_by_user_id)
```

### 6.2 Relaciones Principales

```
users (1) ----------< (N) opportunities        [assigned_user_id]
users (1) ----------< (N) activities            [responsible_user_id]
users (1) ----------< (N) opportunity_history   [changed_by_user_id]
users (1) ----------< (N) messages              [assigned_by_user_id]

clients (1) --------< (N) opportunities         [client_id]
clients (1) --------< (N) activities            [client_id]
clients (1) --------< (N) messages              [client_id, NULLABLE]

opportunities (1) --< (N) opportunity_history   [opportunity_id]
opportunities (1) --< (N) activities            [opportunity_id, NULLABLE]
```

### 6.3 Tablas del Sistema

| Tabla | Registros Esperados | Proposito |
|-------|--------------------:|-----------|
| `users` | ~5-10 | Vendedores y duenos del sistema |
| `clients` | ~5.000 | Clientes y prospectos |
| `opportunities` | ~10.000-20.000 | Oportunidades de venta en pipeline |
| `opportunity_history` | ~30.000-60.000 | Trazabilidad de cambios de etapa |
| `activities` | ~15.000-30.000 | Llamadas, reuniones, tareas comerciales |
| `messages` | ~50.000+ | Historial unificado Gmail + WhatsApp |
| `gmail_credentials` | 1-3 | Tokens OAuth de cuentas Gmail vinculadas |
| `whatsapp_config` | 1 | Configuracion de WhatsApp Business API |

### 6.4 Indices Clave

| Tabla | Indice | Proposito |
|-------|--------|-----------|
| `clients` | `email` | Vinculacion automatica con Gmail |
| `clients` | `whatsapp_number` | Vinculacion automatica con WhatsApp |
| `clients` | `is_active` | Filtro de baja logica |
| `opportunities` | `client_id` | Oportunidades por cliente |
| `opportunities` | `stage` | Agrupacion Kanban |
| `opportunities` | `is_open` | Filtro pipeline activo |
| `activities` | `scheduled_at` | Ordenamiento por agenda |
| `activities` | `status` | Filtro pendiente/realizada |
| `messages` | `(channel, external_id)` UQ | Idempotencia de webhooks |
| `messages` | `(channel, from_address)` | Vinculacion automatica |
| `messages` | `client_id` | Historial por cliente |

---

## 7. Autenticacion y Seguridad

### 7.1 Estrategia de Autenticacion

El sistema utiliza **JWT con dual-token pattern**:

```
+--------+                               +--------+                      +--------+
| Client |                               | Server |                      |  DB    |
+--------+                               +--------+                      +--------+
    |                                         |                               |
    |  POST /auth/login {email, password}     |                               |
    |---------------------------------------->|                               |
    |                                         |  bcrypt.compare(password,     |
    |                                         |    user.password_hash)        |
    |                                         |------------------------------>|
    |                                         |  user record                  |
    |                                         |<------------------------------|
    |                                         |                               |
    |                                         |  Genera access_token JWT      |
    |                                         |  (sub: userId, exp: 15min)    |
    |                                         |                               |
    |                                         |  Genera refresh_token (UUID)  |
    |                                         |  Guarda hash en BD            |
    |                                         |------------------------------>|
    |                                         |                               |
    |  Response:                              |                               |
    |  Body: { accessToken, user }            |                               |
    |  Set-Cookie: refreshToken=<token>;      |                               |
    |    HttpOnly; Secure; SameSite=Strict    |                               |
    |<----------------------------------------|                               |
    |                                         |                               |
    |  Requests subsiguientes:                |                               |
    |  Authorization: Bearer <accessToken>    |                               |
    |---------------------------------------->|                               |
    |                                         |  Verifica JWT                 |
    |                                         |  (firma + expiracion)         |
    |                                         |                               |
```

### 7.2 Flujo de Renovacion de Token

```
    |  Access token expirado (401)            |                               |
    |<----------------------------------------|                               |
    |                                         |                               |
    |  POST /auth/refresh                     |                               |
    |  (cookie enviada automaticamente)       |                               |
    |---------------------------------------->|                               |
    |                                         |  Valida refresh_token:        |
    |                                         |  - Existe en BD               |
    |                                         |  - No revocado                |
    |                                         |  - No expirado (7 dias)       |
    |                                         |------------------------------>|
    |                                         |                               |
    |  Response:                              |                               |
    |  Body: { accessToken (nuevo) }          |                               |
    |<----------------------------------------|                               |
```

### 7.3 Almacenamiento de Tokens en Frontend

| Token | Almacenamiento | Motivo |
|-------|---------------|--------|
| **Access Token** | Memoria (Zustand store) | No persiste en disco. Inmune a XSS via localStorage. Se pierde al cerrar tab (renovacion automatica via cookie). |
| **Refresh Token** | Cookie HttpOnly + Secure + SameSite=Strict | Inaccesible desde JavaScript. Protegido contra CSRF por SameSite=Strict. Solo se envia al endpoint `/auth/refresh`. |
| **Datos de usuario** | Zustand store | ID, nombre, email para mostrar en UI. No son sensibles. |

### 7.4 Seguridad de la API (Plugins Fastify)

| Plugin | Configuracion | Proposito |
|--------|---------------|-----------|
| **@fastify/helmet** | CSP habilitado en produccion | Headers HTTP de seguridad (X-Content-Type-Options, X-Frame-Options, etc.) |
| **@fastify/cors** | Origin explicito, credentials: true | Previene requests desde origenes no autorizados |
| **@fastify/rate-limit** | 100 requests/minuto por IP | Proteccion contra abuso y DDoS basico |
| **@fastify/cookie** | -- | Soporte para HttpOnly cookies (refresh token) |
| **@fastify/jwt** | -- | Firma y verificacion de JWT |

### 7.5 Cifrado de Tokens de Integracion

Los tokens OAuth de Gmail y el Bearer token de WhatsApp se almacenan cifrados:

```
                  +------------------+
                  | Variable de      |
                  | Entorno:         |
                  | TOKEN_ENCRYPTION |
                  | _KEY             |
                  +--------+---------+
                           |
                           v
+------------+    +------------------+    +------------------+
| Token      |--->| AES-256-GCM     |--->| access_token_enc |
| (plaintext)|    | encrypt()       |    | (ciphertext en   |
|            |    | (crypto.ts)     |    |  base de datos)  |
+------------+    +------------------+    +------------------+

+------------------+    +------------------+    +------------+
| access_token_enc |--->| AES-256-GCM     |--->| Token      |
| (ciphertext)     |    | decrypt()       |    | (plaintext)|
+------------------+    +------------------+    +------------+
```

### 7.6 Validacion de Webhooks

| Origen | Mecanismo | Consecuencia de fallo |
|--------|-----------|----------------------|
| **Gmail / Pub/Sub** | Verificacion del JWT del header Authorization contra certificados publicos de Google | Request rechazado (403). No se procesa. |
| **WhatsApp / Meta** | Verificacion de firma HMAC-SHA256 en header `X-Hub-Signature-256` usando el `APP_SECRET` de Meta | Request rechazado (403). No se escribe nada en BD. |

Ambas verificaciones ocurren **antes** de cualquier procesamiento o escritura en base de datos.

### 7.7 Resumen de Controles de Seguridad por Capa

| Capa | Control |
|------|---------|
| **Transporte** | HTTPS obligatorio en todos los endpoints |
| **Red** | CORS restringido a origen explicito |
| **Aplicacion** | Helmet headers, rate limiting, validacion Zod en frontera |
| **Autenticacion** | JWT + refresh token HttpOnly, bcrypt 12 rounds |
| **Datos** | Tokens cifrados AES-256-GCM, queries parametrizados (Prisma), soft delete |
| **Integraciones** | Verificacion de firma en webhooks, tokens nunca expuestos al frontend |
| **Infraestructura** | Secrets en variables de entorno, SSL en conexion a BD |

---

## 8. API Design

### 8.1 Convenciones REST

| Convencion | Detalle |
|------------|---------|
| **Recursos** | Sustantivos en plural: `/clients`, `/opportunities`, `/activities` |
| **Sub-recursos** | Para relaciones directas: `/clients/:id/communications` |
| **Versionado** | Prefijo `/api/v1/` en todos los endpoints desde el dia uno |
| **Metodos HTTP** | GET (lectura), POST (creacion), PATCH (edicion parcial), DELETE (baja logica) |
| **Acciones no-CRUD** | Verbos solo cuando es inevitable: `POST /auth/refresh`, `POST /auth/logout` |
| **Paginacion** | `?page=1&perPage=20&search=juan&sortBy=createdAt&sortOrder=desc` |

### 8.2 Tabla Completa de Endpoints

```
METODO  ENDPOINT                                    DESCRIPCION
------  ------------------------------------------  ----------------------------------------
POST    /api/v1/auth/login                          Login (retorna JWT + cookie)
POST    /api/v1/auth/logout                         Logout (revoca refresh token)
POST    /api/v1/auth/refresh                        Renueva access token via cookie

GET     /api/v1/clients                             Listado con search y paginacion
POST    /api/v1/clients                             Crear cliente
GET     /api/v1/clients/:id                         Perfil completo
PATCH   /api/v1/clients/:id                         Edicion parcial
DELETE  /api/v1/clients/:id                         Baja logica (soft delete)
GET     /api/v1/clients/:id/communications          Historial de comunicaciones del cliente
GET     /api/v1/clients/:id/opportunities           Oportunidades del cliente
GET     /api/v1/clients/:id/activities              Actividades del cliente

GET     /api/v1/opportunities                       Listado (filtro por etapa, usuario)
POST    /api/v1/opportunities                       Crear oportunidad
PATCH   /api/v1/opportunities/:id                   Actualizar / mover etapa

GET     /api/v1/activities                          Listado (filtro por tipo, estado, fecha)
POST    /api/v1/activities                          Registrar actividad
PATCH   /api/v1/activities/:id                      Actualizar / marcar realizada

GET     /api/v1/communications                      Bandeja general + historial unificado
POST    /api/v1/communications/gmail/send           Enviar email via Gmail
POST    /api/v1/communications/whatsapp/send        Enviar mensaje via WhatsApp
PATCH   /api/v1/communications/:id/assign           Asignar mensaje a cliente

POST    /api/v1/webhooks/gmail                      Webhook Pub/Sub (Google)
POST    /api/v1/webhooks/whatsapp                   Webhook Meta (mensajes entrantes)
GET     /api/v1/webhooks/whatsapp                   Verificacion webhook Meta (handshake)

GET     /api/v1/reports/clients-new                 Clientes nuevos por periodo
GET     /api/v1/reports/activities-summary           Resumen de actividades
GET     /api/v1/reports/pipeline-summary             Estado del pipeline

GET     /health                                     Health check (sin auth)
```

### 8.3 Formato de Respuesta Estandar

**Recurso unico (exitoso)**:
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Juan",
    "lastName": "Perez",
    "dni": "30123456",
    "createdAt": "2026-03-29T10:30:00Z"
  }
}
```

**Coleccion con paginacion (exitosa)**:
```json
{
  "data": [
    { "id": "...", "firstName": "Juan", "..." : "..." },
    { "id": "...", "firstName": "Maria", "..." : "..." }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "perPage": 20,
    "totalPages": 8
  }
}
```

**Error**:
```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Ya existe un cliente con el DNI 30123456."
}
```

### 8.4 Codigos HTTP

| Codigo | Situacion |
|--------|-----------|
| **200** | OK con datos |
| **201** | Recurso creado |
| **204** | OK sin cuerpo (logout) |
| **400** | Validacion fallida (Zod schema) |
| **401** | No autenticado (JWT ausente o expirado) |
| **403** | No autorizado / webhook con firma invalida |
| **404** | Recurso no encontrado |
| **409** | Conflicto (DNI duplicado, telefono duplicado) |
| **429** | Rate limit excedido (100 req/min) |
| **500** | Error interno (mensaje generico en produccion) |

### 8.5 Manejo de Errores

El error handler global de Fastify distingue tres categorias:

1. **Errores operacionales** (`AppError`): errores esperados de la logica de negocio
   (cliente no encontrado, duplicado). Se retornan con el codigo HTTP y mensaje apropiados.

2. **Errores de validacion** (Fastify/Zod): input que no cumple el schema. Se retornan
   como 400 con el mensaje de validacion.

3. **Errores inesperados**: cualquier excepcion no controlada. En produccion se retorna
   un mensaje generico (500) sin exponer internals. En desarrollo se muestra el mensaje
   real para facilitar debugging.

---

## 9. Decisiones de Arquitectura (ADRs)

### ADR-001: Monolito Modular vs Microservicios

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-03-29 |
| **Estado** | Aceptado |
| **Decision** | Monolito modular |

**Contexto**: Sistema con ~5.000 clientes, < 10 usuarios concurrentes, equipo de desarrollo
acotado. Integraciones con Gmail API y WhatsApp Business API.

**Alternativa descartada**: Microservicios (API, servicio Gmail, servicio WhatsApp, servicio
notificaciones). Descartada por complejidad operacional desproporcionada: service discovery,
comunicacion inter-servicio, transacciones distribuidas, multiples pipelines CI/CD, sin
beneficio real de escala independiente a este volumen.

**Trade-offs de la decision**:
- (+) Despliegue simple: un solo servicio.
- (+) Transacciones de BD simples sin coordinacion distribuida.
- (+) Llamadas entre modulos por funcion, no por red.
- (+) Un solo repo, un solo pipeline CI/CD.
- (-) Si el sistema crece significativamente, se debera extraer modulos a servicios.
- (mitigacion) Los seams entre modulos estan disenados para facilitar esa extraccion.

---

### ADR-002: Mock Providers vs Integracion Real

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-03-29 |
| **Estado** | Aceptado |
| **Decision** | Providers con interfaz comun que soportan modo mock y modo real |

**Contexto**: Las integraciones con Gmail API y WhatsApp Business API requieren cuentas
configuradas, OAuth, webhooks HTTPS, y coordinacion con el cliente (Ciudad Moto) para
autorizaciones. Esto no debe bloquear el desarrollo del CRM.

**Decision**: Los providers (`gmail.provider.ts`, `whatsapp.provider.ts`) implementan una
interfaz comun. En desarrollo y MVP inicial, operan en modo mock retornando respuestas
simuladas. El service de comunicaciones llama al provider sin conocer si es mock o real.

**Trade-offs**:
- (+) Desarrollo y testing no dependen de servicios externos.
- (+) El equipo puede avanzar en paralelo con la configuracion de cuentas del cliente.
- (+) El switch a modo real es un cambio de configuracion, no de codigo.
- (-) Los bugs de integracion real no se descubren hasta activar el modo real.
- (mitigacion) Tests de integracion dedicados cuando se active el modo real.

---

### ADR-003: JWT Access Token en Memoria vs localStorage

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-03-29 |
| **Estado** | Aceptado |
| **Decision** | Access token en memoria (Zustand store), refresh token en HttpOnly cookie |

**Contexto**: El access token JWT debe almacenarse en el frontend para autenticar requests.
Las opciones son: localStorage, sessionStorage, memoria, o HttpOnly cookie.

**Alternativa descartada**: localStorage. Vulnerable a XSS: cualquier script inyectado puede
leer el token y enviarlo a un servidor externo.

**Decision**: El access token vive exclusivamente en una variable JavaScript en el Zustand
store. Se pierde al cerrar la tab o recargar la pagina. La renovacion se hace automaticamente
via el refresh token en cookie HttpOnly (SameSite=Strict, Secure, Path=/api/v1/auth/refresh).

**Trade-offs**:
- (+) Inmune a robo de token via XSS persistente.
- (+) El refresh token es inaccesible desde JavaScript.
- (-) Al recargar la pagina se pierde el access token y se necesita una renovacion.
- (mitigacion) El interceptor de Axios detecta 401 y hace refresh automatico. El usuario
  no percibe la renovacion.

---

### ADR-004: @dnd-kit para Kanban vs Alternativas

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-03-29 |
| **Estado** | Aceptado |
| **Decision** | @dnd-kit v6 para drag-and-drop del pipeline Kanban |

**Contexto**: El pipeline de oportunidades se visualiza como un tablero Kanban con columnas
por etapa (consulta, prueba_manejo, presupuesto, cierre). Las tarjetas deben ser arrastrables
entre columnas.

**Alternativas evaluadas**:
- **react-beautiful-dnd**: Deprecated por Atlassian. Sin mantenimiento activo.
- **react-dnd**: API compleja, mayor boilerplate, menos accesible.
- **@dnd-kit**: Accesible (ARIA compliant), modular, sin dependencias pesadas, API moderna
  basada en hooks, mantenido activamente.

**Trade-offs**:
- (+) Ligero y modular: solo se importan los modulos necesarios.
- (+) Accesible por defecto (teclado + screen reader).
- (+) API de hooks moderna, integra naturalmente con React.
- (-) Menos ejemplos y documentacion que react-beautiful-dnd (por ser mas nuevo).
- (mitigacion) La documentacion oficial es suficiente y hay ejemplos de Kanban.

---

### ADR-005: Fastify vs Express

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-03-29 |
| **Estado** | Aceptado |
| **Decision** | Fastify v4 |

**Contexto**: Se necesita un framework HTTP para Node.js que soporte TypeScript, validacion
de entrada, y tenga un ecosistema de plugins para seguridad (Helmet, CORS, rate limiting,
JWT, cookies).

**Alternativa descartada**: Express. Throughput inferior (~3x menos), ecosistema de middleware
fragmentado, TypeScript como ciudadano de segunda clase. Sigue siendo valido pero Fastify
trae consolidado lo que Express requiere ensamblar.

**Trade-offs**:
- (+) ~3x mas throughput en benchmarks reales.
- (+) Validacion de schemas integrada (JSON Schema / Zod).
- (+) Sistema de plugins encapsulado y declarativo.
- (+) Logging estructurado nativo (Pino).
- (-) Curva de aprendizaje del sistema de plugins.
- (mitigacion) Documentacion solida. Costo de onboarding bajo.

---

### ADR-006: Prisma vs Drizzle vs TypeORM

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-03-29 |
| **Estado** | Aceptado |
| **Decision** | Prisma v5 |

**Contexto**: Se necesita una capa de acceso a PostgreSQL con tipos TypeScript, migraciones
y acceso a SQL raw cuando sea necesario.

**Alternativas descartadas**:
- **Drizzle**: Mejor rendimiento pero DX de migraciones menos madura.
- **TypeORM**: Deuda tecnica acumulada, decoradores legacy, tipos menos fiables.

**Trade-offs**:
- (+) Tipos generados automaticamente del schema.
- (+) CLI de migraciones predecible y versionado en git.
- (+) Reduce errores sin sacrificar acceso a SQL raw ($queryRaw).
- (-) Overhead de rendimiento vs queries manuales (aceptable a esta escala).
- (-) Schema propio (no es SQL puro).
- (mitigacion) Para consultas criticas de rendimiento, se usa $queryRaw.

---

## 10. Diagrama de Despliegue

### 10.1 Arquitectura de Produccion

```
                            INTERNET
                               |
                               |  HTTPS
                               v
            +------------------------------------------+
            |                                          |
            |              CLOUDFLARE DNS              |
            |          (si se configura CDN)           |
            |                                          |
            +-----+------------------------------------+
                  |                          |
                  | HTTPS                    | HTTPS
                  v                          v
+---------------------------+    +---------------------------+
|         VERCEL            |    |         RENDER            |
|      (Frontend)           |    |       (Backend)           |
|                           |    |                           |
|  +---------------------+  |    |  +---------------------+  |
|  |   React SPA         |  |    |  |   Node.js 20        |  |
|  |   (build estatico)  |  |    |  |   Fastify Server    |  |
|  |                     |  |    |  |                     |  |
|  |   - HTML/CSS/JS     |  |    |  |   - API REST        |  |
|  |   - Assets          |  |    |  |   - Webhooks        |  |
|  |   - CDN global      |  |    |  |   - Error handler   |  |
|  +---------------------+  |    |  |   - Swagger (dev)   |  |
|                           |    |  +---------------------+  |
|  Deploy: push a main     |    |                           |
|  Preview: push a branch  |    |  Deploy: push a branch    |
+---------------------------+    |  Auto-migrate + seed      |
                                 +---------------------------+
                                          |           |
                            +-------------+           |
                            |                         |
                            v                         v
                 +--------------------+    +--------------------+
                 |   PostgreSQL 16    |    |     Redis 7        |
                 |   (Render DB)      |    |   (si se activa)   |
                 |                    |    |                    |
                 |  Plan: Free/Paid  |    |  - BullMQ queues   |
                 |  DB: ciudadmoto   |    |  - Session cache   |
                 |  User: crm        |    |                    |
                 |                    |    |  (En MVP: sin      |
                 |  8 tablas +       |    |   Redis, BullMQ    |
                 |  indices          |    |   deshabilitado)   |
                 |  SSL connection   |    |                    |
                 +--------------------+    +--------------------+
```

### 10.2 Arquitectura de Desarrollo Local (Docker Compose)

```
+===========================================================================+
|                        DOCKER COMPOSE (local)                             |
|                                                                           |
|  +--------------------+  +--------------------+  +--------------------+   |
|  |     frontend       |  |     backend        |  |       db           |   |
|  |                    |  |                    |  |                    |   |
|  |  Build: Dockerfile |  |  Build: Dockerfile |  |  postgres:16-      |   |
|  |  Puerto: 80        |  |  Puerto: 3000      |  |  alpine            |   |
|  |                    |  |                    |  |  Puerto: 5432      |   |
|  |  Depende de:       |  |  Depende de:       |  |                    |   |
|  |    backend         |  |    db (healthy)    |  |  DB: ciudadmoto    |   |
|  |                    |  |    redis (started) |  |  User: crm         |   |
|  +--------------------+  +--------------------+  +--------------------+   |
|                                                                           |
|  +--------------------+                                                   |
|  |      redis         |     Volumenes persistentes:                       |
|  |                    |       - pgdata  (PostgreSQL)                      |
|  |  redis:7-alpine    |       - redisdata (Redis)                        |
|  |  Sin puerto        |                                                   |
|  |  expuesto          |     Startup del backend:                          |
|  +--------------------+       prisma migrate deploy                       |
|                               prisma db seed                              |
|                               node dist/server.js                         |
+===========================================================================+
```

### 10.3 Pipeline CI/CD (GitHub Actions)

```
+-----------------------------------------------------------------+
|                    GITHUB ACTIONS - CI                            |
|                                                                  |
|  Trigger: push a project-crm / PR a gen                          |
|                                                                  |
|  +----------------------------+  +----------------------------+  |
|  |    JOB: Backend            |  |    JOB: Frontend           |  |
|  |                            |  |                            |  |
|  |  1. Checkout               |  |  1. Checkout               |  |
|  |  2. Setup Node.js 20      |  |  2. Setup Node.js 20      |  |
|  |  3. npm ci                 |  |  3. npm ci                 |  |
|  |  4. prisma generate        |  |  4. npm run lint           |  |
|  |  5. npm run lint           |  |  5. tsc -b --noEmit        |  |
|  |  6. tsc --noEmit           |  |  6. vitest run             |  |
|  |  7. vitest run (si hay)   |  |                            |  |
|  +----------------------------+  +----------------------------+  |
|                                                                  |
|  Ambos jobs corren en paralelo en ubuntu-latest                  |
+-----------------------------------------------------------------+
              |                                   |
              v                                   v
    [Backend pasa CI]                   [Frontend pasa CI]
              |                                   |
              +-----------------------------------+
                              |
                              v
                    [Merge a branch]
                              |
              +---------------+----------------+
              |                                |
              v                                v
     [Push a Render]                  [Push a Vercel]
     (auto-deploy)                    (auto-deploy)
              |                                |
              v                                v
     ciudadmoto-api                   SPA en CDN global
     .onrender.com                    .vercel.app
```

### 10.4 Variables de Entorno Requeridas

```
# --- Backend (Render) ---
DATABASE_URL                    # Connection string PostgreSQL (auto por Render)
JWT_SECRET                      # Secreto para firmar access tokens (auto-generado)
JWT_REFRESH_SECRET              # Secreto para refresh tokens (auto-generado)
CORS_ORIGIN                     # URL del frontend en Vercel
NODE_ENV=production             # Modo produccion
PORT=3000                       # Puerto del servidor

# --- Integraciones (cuando se activen) ---
TOKEN_ENCRYPTION_KEY            # Clave AES-256-GCM para cifrar tokens OAuth/WA
GOOGLE_CLIENT_ID                # OAuth de Gmail
GOOGLE_CLIENT_SECRET            # OAuth de Gmail
GOOGLE_PUBSUB_TOPIC             # Topic de Pub/Sub para push notifications
WHATSAPP_APP_SECRET             # Firma HMAC de webhooks Meta
WHATSAPP_PHONE_NUMBER_ID        # ID del numero en Meta
WHATSAPP_API_TOKEN              # Bearer token de Meta (cifrado en BD via TOKEN_ENCRYPTION_KEY)
```

### 10.5 URLs del Sistema

| Ambiente | URL | Servicio |
|----------|-----|----------|
| **Produccion frontend** | `https://frontend-two-mu-94.vercel.app` | Vercel |
| **Produccion backend** | `https://ciudadmoto-api.onrender.com` | Render |
| **Desarrollo local frontend** | `http://localhost:5173` | Vite dev server |
| **Desarrollo local backend** | `http://localhost:3000` | Fastify |
| **API docs (dev)** | `http://localhost:3000/docs` | Swagger UI |
| **Health check** | `https://ciudadmoto-api.onrender.com/health` | Fastify |

---

*Documento de referencia arquitectonica del sistema CRM Ciudad Moto.*
*Ultima actualizacion: 2026-03-29.*
*Cualquier cambio a la arquitectura requiere un nuevo ADR con justificacion documentada.*
