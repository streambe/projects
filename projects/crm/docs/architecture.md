# Arquitectura de Alto Nivel: CRM Ciudad Moto

**Versión**: 1.0
**Fecha**: 2026-03-29
**Preparado por**: Arquitecto de Software — Equipo GEN
**Estado**: Pendiente de aprobación

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Diagrama de Componentes](#2-diagrama-de-componentes)
3. [Diseño de la Base de Datos](#3-diseño-de-la-base-de-datos)
4. [Flujo de Integraciones](#4-flujo-de-integraciones)
5. [ADR-001: Decisión de Arquitectura Principal](#5-adr-001-decisión-de-arquitectura-principal)
6. [Consideraciones de Seguridad](#6-consideraciones-de-seguridad)
7. [Estrategia de Despliegue](#7-estrategia-de-despliegue)

---

## 1. Visión General

El sistema es una aplicación web de escritorio para gestión comercial. La escala es acotada (~5.000 clientes, equipo pequeño de usuarios), lo que permite optar por una arquitectura **monolítica modular** en lugar de microservicios. Esta elección reduce la complejidad operacional sin sacrificar capacidad de evolución futura.

### Características de escala que guían las decisiones
- Usuarios concurrentes: bajo (estimado < 10 simultáneos)
- Volumen de datos: pequeño (5.000 clientes, historial de comunicaciones)
- Mensajes entrantes: esporádicos, no requieren procesamiento en tiempo real estricto
- Disponibilidad requerida: 99% en horario comercial

La arquitectura está orientada a **minimizar la superficie operacional** y **maximizar la velocidad de entrega**, priorizando tecnología madura y el stack ya definido.

---

## 2. Diagrama de Componentes

### 2.1 Vista de contexto (nivel sistema)

```
+------------------+        HTTPS         +---------------------------+
|                  | <------------------> |                           |
|    Navegador     |                      |     CRM Ciudad Moto       |
|  (Chrome/Edge)   |                      |     (aplicación web)      |
|                  |                      |                           |
+------------------+                      +---------------------------+
                                                      |
                          +--------------------------++--------------------------+
                          |                                                     |
                 +--------v--------+                              +-------------v------+
                 |   Gmail API     |                              | WhatsApp Business  |
                 |   (Google)      |                              |   API (Meta)       |
                 +-----------------+                              +--------------------+
                          ^                                                     ^
                          | OAuth 2.0                                           | Webhook (HTTPS POST)
                          | + Gmail Push Notifications (Pub/Sub)               | + REST API
                          |                                                     |
                 +--------+-----------------------------------------------------+------+
                 |                        BACKEND (Node.js)                            |
                 +--------------------------------------------------------------------+
```

### 2.2 Vista de contenedores (nivel despliegue)

```
+---------------------------------------------------------------------+
|  CLIENTE (Browser)                                                  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |  React SPA                                                    |  |
|  |                                                               |  |
|  |  [ Módulo Clientes ] [ Kanban Pipeline ] [ Actividades ]      |  |
|  |  [ Comunicaciones  ] [ Reportes        ] [ Auth/Login  ]      |  |
|  |                                                               |  |
|  |  React Query (server state) + React Router + Axios            |  |
|  +---------------------------------------------------------------+  |
+---------------------------------------------------------------------+
                           | HTTPS / REST + JSON
                           | JWT en header Authorization
+---------------------------------------------------------------------+
|  SERVIDOR (Node.js + Express)                                       |
|                                                                     |
|  +------------------+  +------------------+  +------------------+  |
|  |  API REST        |  |  Webhook         |  |  Jobs / Workers  |  |
|  |  /api/v1/*       |  |  /webhooks/      |  |  (polling Gmail) |  |
|  |                  |  |  gmail           |  |                  |  |
|  |  Auth middleware |  |  whatsapp        |  |  BullMQ + Redis  |  |
|  +------------------+  +------------------+  +------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |  Capa de Servicio (lógica de negocio)                         |  |
|  |                                                               |  |
|  |  ClienteService  |  PipelineService  |  ActividadService      |  |
|  |  GmailService    |  WhatsAppService  |  VinculacionService    |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |  Capa de Datos (Repositorios + Knex.js / pg)                  |  |
|  +---------------------------------------------------------------+  |
+---------------------------------------------------------------------+
                           | TCP (conexión pool)
+---------------------------------------------------------------------+
|  BASE DE DATOS: PostgreSQL                                          |
|  (tablas detalladas en sección 3)                                   |
+---------------------------------------------------------------------+

+---------------------+      +---------------------+
|  Redis              |      |  Almacenamiento      |
|  - Cola BullMQ      |      |  de Secretos         |
|  - Cache sesiones   |      |  (variables de env   |
|                     |      |   / secrets manager) |
+---------------------+      +---------------------+
```

### 2.3 Módulos internos del backend

| Módulo | Responsabilidad |
|--------|----------------|
| `auth` | Login, JWT, hash de contraseñas, gestión de usuarios |
| `clientes` | CRUD de clientes, detección de duplicados |
| `pipeline` | Oportunidades, movimiento de etapas, historial |
| `actividades` | CRUD de actividades, filtros, vencimientos |
| `comunicaciones` | Historial unificado, bandeja general, asignación manual |
| `gmail` | Envío via Gmail API, recepción via Pub/Sub push, vinculación |
| `whatsapp` | Envío via WhatsApp API, recepción via webhook, vinculación |
| `reportes` | Consultas agregadas de clientes nuevos y actividades |
| `vinculacion` | Lógica central de matching remitente -> cliente |

---

## 3. Diseño de la Base de Datos

### 3.1 Diagrama de relaciones

```
users
  |
  +--< activities (responsable)
  |
  +--< opportunity_history (usuario que cambió etapa)

clients
  |
  +--< opportunities ----< opportunity_history
  |
  +--< activities
  |
  +--< messages (historial unificado Gmail + WhatsApp)

messages
  |
  `-- puede estar sin cliente (bandeja general: client_id NULL)
```

### 3.2 Tablas principales

#### `users`
Usuarios del sistema (vendedores, dueños).

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID PK | |
| `full_name` | VARCHAR(150) | |
| `email` | VARCHAR(255) UNIQUE | Usado como username |
| `password_hash` | VARCHAR(255) | bcrypt |
| `is_active` | BOOLEAN | Default TRUE |
| `created_at` | TIMESTAMPTZ | |

---

#### `clients`
Personas físicas registradas como clientes o prospectos.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID PK | |
| `first_name` | VARCHAR(100) NOT NULL | |
| `last_name` | VARCHAR(100) NOT NULL | |
| `dni` | VARCHAR(20) UNIQUE NOT NULL | |
| `phone_primary` | VARCHAR(30) UNIQUE NOT NULL | |
| `phone_alt` | VARCHAR(30) | |
| `email` | VARCHAR(255) | Usado para matching con Gmail |
| `whatsapp_number` | VARCHAR(30) | Usado para matching con WhatsApp |
| `city` | VARCHAR(100) | |
| `province` | VARCHAR(100) | |
| `birth_date` | DATE | |
| `how_found_us` | VARCHAR(50) | ENUM: instagram, facebook, google, referido, visita_directa, otro |
| `notes` | TEXT | |
| `is_active` | BOOLEAN | Default TRUE (baja lógica) |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

Indices adicionales: `email`, `whatsapp_number` (para lookups de vinculación rápida).

---

#### `opportunities`
Oportunidades de venta en el pipeline.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID PK | |
| `client_id` | UUID FK -> clients | NOT NULL |
| `assigned_user_id` | UUID FK -> users | Usuario responsable |
| `moto_interest` | TEXT | Modelo de moto de interés (texto libre) |
| `stage` | VARCHAR(30) | ENUM: consulta, prueba_manejo, presupuesto, cierre |
| `result` | VARCHAR(20) | NULL, ganado, perdido (se completa al llegar a cierre) |
| `loss_reason` | TEXT | Motivo si result = perdido |
| `is_open` | BOOLEAN | FALSE cuando se cierra |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

#### `opportunity_history`
Trazabilidad de cambios de etapa (RNF-08).

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID PK | |
| `opportunity_id` | UUID FK -> opportunities | |
| `changed_by_user_id` | UUID FK -> users | |
| `from_stage` | VARCHAR(30) | NULL si es creación |
| `to_stage` | VARCHAR(30) | |
| `changed_at` | TIMESTAMPTZ | |

---

#### `activities`
Llamadas, reuniones y tareas comerciales.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID PK | |
| `type` | VARCHAR(20) | ENUM: llamada, reunion, tarea |
| `title` | VARCHAR(255) NOT NULL | |
| `client_id` | UUID FK -> clients | NOT NULL |
| `opportunity_id` | UUID FK -> opportunities | NULLABLE |
| `responsible_user_id` | UUID FK -> users | NOT NULL |
| `scheduled_at` | TIMESTAMPTZ | Fecha y hora programada |
| `due_at` | TIMESTAMPTZ | Vencimiento (para tareas) |
| `status` | VARCHAR(20) | ENUM: pendiente, realizada |
| `summary` | TEXT | Resultado/resumen al marcar como realizada |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

#### `messages`
Historial unificado de comunicaciones (Gmail + WhatsApp).

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID PK | |
| `channel` | VARCHAR(20) | ENUM: gmail, whatsapp |
| `direction` | VARCHAR(10) | ENUM: inbound, outbound |
| `client_id` | UUID FK -> clients | NULLABLE (NULL = bandeja general) |
| `external_id` | VARCHAR(255) | ID del mensaje en Gmail o WhatsApp API. UNIQUE por canal. |
| `from_address` | VARCHAR(255) | Email o número de teléfono del remitente |
| `to_address` | VARCHAR(255) | Email o número del destinatario |
| `subject` | VARCHAR(500) | Solo para Gmail |
| `body` | TEXT | Contenido del mensaje |
| `sent_received_at` | TIMESTAMPTZ | Timestamp real del mensaje |
| `assigned_by_user_id` | UUID FK -> users | Quién asignó manualmente (si aplica) |
| `created_at` | TIMESTAMPTZ | Momento en que el sistema lo registró |

Indice en `(channel, from_address)` para el proceso de vinculación automática.
Indice en `client_id` para recuperar historial del cliente.

---

#### `gmail_credentials`
Tokens OAuth de las cuentas de Gmail vinculadas.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID PK | |
| `gmail_address` | VARCHAR(255) UNIQUE | |
| `access_token_enc` | TEXT | Token cifrado en reposo |
| `refresh_token_enc` | TEXT | Token cifrado en reposo |
| `token_expiry` | TIMESTAMPTZ | |
| `pubsub_history_id` | VARCHAR(100) | Último historyId procesado de Gmail Pub/Sub |
| `is_active` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |

---

#### `whatsapp_config`
Configuración de la cuenta de WhatsApp Business API.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID PK | Registro único |
| `phone_number_id` | VARCHAR(100) | ID del número en Meta |
| `api_token_enc` | TEXT | Token cifrado en reposo |
| `webhook_verify_token` | VARCHAR(100) | Token de verificación del webhook |
| `is_active` | BOOLEAN | |
| `updated_at` | TIMESTAMPTZ | |

---

### 3.3 Relaciones clave (resumen)

```
clients (1) ----< (N) opportunities
clients (1) ----< (N) activities
clients (1) ----< (N) messages          [client_id puede ser NULL en messages]
opportunities (1) ----< (N) activities
opportunities (1) ----< (N) opportunity_history
users (1) ----< (N) activities           [responsible_user_id]
users (1) ----< (N) opportunity_history  [changed_by_user_id]
```

---

## 4. Flujo de Integraciones

### 4.1 Gmail — mensajes entrantes

```
Google Gmail
(cuenta vinculada)
      |
      | 1. Nuevo email llega a la bandeja de Gmail
      |
      v
Google Cloud Pub/Sub
(suscripción configurada por el sistema al vincular la cuenta)
      |
      | 2. Pub/Sub envía notificación push (HTTP POST)
      |    a: POST https://crm.ciudadmoto.com/webhooks/gmail
      |
      v
Backend — Webhook /webhooks/gmail
      |
      | 3. Verifica autenticidad del push (token de suscripción)
      | 4. Extrae historyId del payload
      | 5. Llama a Gmail API: users.history.list desde último historyId
      |    para obtener los mensajes nuevos
      |
      v
GmailService.procesarEmailEntrante(mensaje)
      |
      | 6. Extrae: from_address (email del remitente), subject, body
      | 7. Verifica si external_id ya existe en messages (idempotencia)
      |
      v
VinculacionService.buscarClientePorEmail(from_address)
      |
      | 8a. Si encuentra cliente:
      |     -> Inserta en messages con client_id = cliente.id
      |
      | 8b. Si NO encuentra cliente:
      |     -> Inserta en messages con client_id = NULL
      |        (queda en bandeja general para asignación manual)
      |
      v
messages (tabla)
      |
      v
Frontend — Bandeja general o perfil del cliente
```

**Nota sobre el modelo de push de Gmail**: Gmail no envía el contenido del email en el push de Pub/Sub. Solo envía una notificación de que hay cambios. El backend debe luego consultar la API de Gmail para obtener los mensajes nuevos usando `users.history.list`. Esto requiere persistir el `historyId` procesado en `gmail_credentials.pubsub_history_id`.

---

### 4.2 Gmail — mensajes salientes

```
Frontend (perfil cliente / oportunidad)
      |
      | 1. Usuario redacta y envía email
      |    POST /api/v1/comunicaciones/gmail/enviar
      |
      v
Backend — ComunicacionesController
      |
      | 2. Valida que el cliente tenga email registrado
      | 3. Obtiene tokens OAuth de gmail_credentials
      | 4. Refresca token si está expirado (OAuth refresh flow)
      |
      v
Gmail API — users.messages.send
      |
      | 5. Confirma envío, obtiene messageId de Gmail
      |
      v
Backend — inserta en messages
      (direction: outbound, client_id, external_id, body, etc.)
      |
      v
Frontend — muestra en historial del cliente
```

---

### 4.3 WhatsApp — mensajes entrantes

```
Meta WhatsApp Business Platform
      |
      | 1. Cliente envía mensaje al número de WhatsApp Business
      |
      v
Meta envía HTTP POST al webhook registrado:
POST https://crm.ciudadmoto.com/webhooks/whatsapp
      |
      v
Backend — Webhook /webhooks/whatsapp
      |
      | 2. Verifica firma HMAC-SHA256 del payload (usando app secret de Meta)
      | 3. Parsea payload: extrae from (número E.164), body, timestamp, wamid
      | 4. Verifica si wamid ya existe en messages (idempotencia)
      |
      v
VinculacionService.buscarClientePorWhatsApp(from_number)
      |
      | 5a. Si encuentra cliente (match por whatsapp_number):
      |     -> Inserta en messages con client_id = cliente.id
      |
      | 5b. Si NO encuentra cliente:
      |     -> Inserta en messages con client_id = NULL
      |        (bandeja general)
      |
      v
messages (tabla)
```

---

### 4.4 WhatsApp — mensajes salientes

```
Frontend (perfil cliente / oportunidad)
      |
      | 1. Usuario redacta y envía mensaje de WhatsApp
      |    POST /api/v1/comunicaciones/whatsapp/enviar
      |
      v
Backend — ComunicacionesController
      |
      | 2. Valida que el cliente tenga whatsapp_number registrado
      | 3. Llama a WhatsApp Business API:
      |    POST https://graph.facebook.com/v19.0/{phone_number_id}/messages
      |    Body: { to, type: "text", text: { body } }
      |
      v
Meta confirma envío (wamid en respuesta)
      |
      v
Backend — inserta en messages
      (direction: outbound, client_id, wamid como external_id)
```

---

### 4.5 Lógica de vinculación automática (VinculacionService)

Este servicio es el corazón de la integración. Su lógica es simple y determinista:

```
Para Gmail:
  SELECT id FROM clients
  WHERE email = :from_address
    AND is_active = TRUE
  LIMIT 1

Para WhatsApp:
  SELECT id FROM clients
  WHERE whatsapp_number = :from_number
    AND is_active = TRUE
  LIMIT 1
```

**Reglas de negocio aplicadas**:
- La búsqueda es exacta (no fuzzy matching). Esto evita vinculaciones incorrectas.
- Si hay coincidencia: el mensaje se vincula al cliente y aparece en su perfil.
- Si no hay coincidencia: `client_id = NULL`, aparece en la bandeja general.
- Desde la bandeja general, el usuario puede asignar manualmente el mensaje a un cliente existente (actualiza `client_id`) o crear un nuevo cliente con esos datos.
- La idempotencia se garantiza verificando `external_id` antes de insertar, de modo que si el webhook se procesa dos veces, no se generan mensajes duplicados.

---

### 4.6 Bandeja General — asignación manual

```
Frontend — Bandeja General
      |
      | Lista mensajes donde client_id IS NULL
      | ordenados por sent_received_at DESC
      |
      | Opciones por mensaje:
      |   [A] Asignar a cliente existente
      |       -> PATCH /api/v1/mensajes/:id/asignar
      |          { client_id: "uuid-del-cliente" }
      |          Backend: UPDATE messages SET client_id = ?, assigned_by_user_id = ?
      |
      |   [B] Crear nuevo cliente con estos datos
      |       -> Lleva al formulario de alta de cliente (M-01)
      |          con email/teléfono prelleno
      |          Al crear el cliente, se reasignan sus mensajes pendientes
```

---

## 5. ADR-001: Decisión de Arquitectura Principal

### ADR-001 — Arquitectura Monolítica Modular vs. Microservicios

**Fecha**: 2026-03-29
**Estado**: Aprobado (propuesto)
**Decisores**: Arquitecto de Software, Tech Lead

---

#### Contexto

El sistema debe soportar ~5.000 clientes, un equipo de usuarios pequeño (estimado < 10 personas), y debe ser entregado por un equipo de desarrollo acotado. El sistema tiene integraciones con servicios externos (Gmail API, WhatsApp Business API) que requieren manejo de webhooks, tokens OAuth, y procesamiento asíncrono de mensajes entrantes.

Se evaluaron dos alternativas arquitectónicas principales.

---

#### Opción A: Arquitectura Monolítica Modular (ELEGIDA)

Un único proceso Node.js que expone la API REST, procesa los webhooks de Gmail y WhatsApp, y ejecuta los jobs de procesamiento de mensajes mediante BullMQ con Redis.

El código se organiza en módulos bien definidos (clientes, pipeline, actividades, comunicaciones, etc.) con separación clara de responsabilidades, pero sin separación de procesos ni red entre ellos.

**Ventajas**:
- Despliegue simple: un solo servicio para operar y monitorear.
- Transacciones de base de datos simples: no se necesita coordinación distribuida para operaciones que cruzan módulos (ej: crear cliente + mensaje en una sola transacción PostgreSQL).
- Menor latencia interna: las llamadas entre módulos son llamadas de función, no HTTP.
- Curva de aprendizaje baja: el equipo opera un solo repositorio y un solo proceso.
- Suficiente para la escala requerida con margen amplio.

**Desventajas**:
- Si el sistema crece significativamente, puede ser necesario extraer módulos a servicios separados. Los seams (interfaces claras entre módulos) están diseñados para facilitar esa extracción si alguna vez fuera necesaria.

---

#### Opción B: Microservicios

Servicios separados para: API principal, servicio Gmail, servicio WhatsApp, servicio de notificaciones.

**Ventajas**:
- Escala independiente de cada servicio.
- Aislamiento de fallas.

**Desventajas para este caso**:
- Complejidad operacional desproporcionada para la escala del sistema.
- Requiere service discovery, comunicación inter-servicio, rastreo distribuido.
- Transacciones distribuidas para operaciones simples (ej: vincular un mensaje a un cliente requeriría coordinación entre servicios).
- El equipo necesitaría operar múltiples pipelines de CI/CD, múltiples contenedores, múltiples configuraciones de red.
- No hay beneficio real de escala independiente cuando el volumen total es bajo.

---

#### Decisión

Se elige la **Arquitectura Monolítica Modular (Opción A)**.

La escala del sistema (5.000 clientes, < 10 usuarios concurrentes) no justifica la complejidad operacional de microservicios. El monolito modular con seams claros entre módulos permite:

1. Entregar valor más rápido.
2. Reducir el costo de infraestructura y operación.
3. Mantener la posibilidad de extraer módulos como servicios independientes en el futuro si la escala lo exigiera, sin necesidad de reescribir la lógica de negocio.

**Consecuencia de esta decisión**: el procesamiento asíncrono de mensajes entrantes (Gmail push + WhatsApp webhooks) se resuelve con una cola en BullMQ/Redis dentro del mismo servidor, en lugar de un servicio de mensajería distribuida. Esto es suficiente y operacionalmente simple para la escala proyectada.

---

## 6. Consideraciones de Seguridad

### Autenticación y sesiones
- Login con email + contraseña. Contraseñas hasheadas con **bcrypt** (factor de costo >= 12).
- Sesiones basadas en **JWT** firmados con HS256 o RS256.
- JWT de corta duración (ej: 1 hora) + refresh token de mayor duración almacenado en cookie HttpOnly.
- Expiración de sesión por inactividad configurable.
- Todas las rutas de la API requieren JWT válido como middleware.

### Protección de credenciales de integraciones
- Los tokens OAuth de Gmail y el API token de WhatsApp se almacenan **cifrados en reposo** en la base de datos (cifrado a nivel de aplicación con AES-256-GCM, clave maestra en variable de entorno / secrets manager).
- Nunca se exponen al frontend. El frontend solo llama a endpoints propios del backend; el backend es el único que habla con Gmail API y WhatsApp API.

### Seguridad de webhooks
- **WhatsApp**: validación de firma HMAC-SHA256 de cada payload usando el `App Secret` de Meta. Rechaza cualquier request sin firma válida.
- **Gmail Pub/Sub**: validación del token de suscripción de Cloud Pub/Sub.

### Transporte
- HTTPS obligatorio en todos los endpoints (frontend -> backend, backend -> Gmail API, backend -> WhatsApp API).
- El webhook de WhatsApp debe estar en HTTPS (requerido por Meta).

### Base de datos
- Conexión a PostgreSQL via SSL.
- Pool de conexiones con PgBouncer o pool nativo de `pg`.
- Consultas con parámetros bind (nunca interpolación de strings) para prevenir SQL injection.

---

## 7. Estrategia de Despliegue

### Ambiente de producción recomendado

| Componente | Servicio recomendado | Alternativa |
|------------|---------------------|-------------|
| Frontend (React SPA) | Vercel / Cloudflare Pages | Nginx en mismo servidor |
| Backend (Node.js) | Railway / Fly.io / Cloud Run | VPS con Docker |
| PostgreSQL | Supabase / Railway PostgreSQL | VPS con Docker + backups |
| Redis (BullMQ) | Upstash Redis / Railway Redis | VPS con Docker |

### Variables de entorno requeridas (no hardcodear nunca)

```
DATABASE_URL
REDIS_URL
JWT_SECRET
JWT_REFRESH_SECRET
ENCRYPTION_KEY              # Para cifrar tokens de Gmail/WhatsApp en DB
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_PUBSUB_TOPIC
WHATSAPP_APP_SECRET         # Para verificar firma HMAC del webhook
```

### Observabilidad mínima (MVP)

- Logging estructurado (JSON) en el backend con niveles: error, warn, info, debug.
- Logs de todos los webhooks entrantes (para diagnóstico de integraciones).
- Logs de errores en procesamiento de mensajes (con el mensaje original para reintento manual si fuera necesario).
- Monitor de uptime (UptimeRobot o similar) sobre el endpoint `/health`.

---

## Apéndice: Preguntas Abiertas con Impacto Arquitectónico

Las siguientes preguntas del documento funcional (sección 7) tienen impacto directo en decisiones de arquitectura y deben resolverse antes del inicio del desarrollo:

| Pregunta | Impacto arquitectónico |
|----------|------------------------|
| Q-01: ¿Una o varias cuentas de Gmail? | Si son múltiples cuentas, la tabla `gmail_credentials` puede tener N filas. Si es una sola, la lógica de OAuth es más simple. El diseño actual soporta ambos casos. |
| Q-02: ¿Un número de WhatsApp o uno por vendedor? | La API de WhatsApp Business estándar opera con un número por cuenta. Si hay múltiples números, se necesita una cuenta de WhatsApp Business distinta (o API Business Premium). Impacta el diseño de `whatsapp_config`. |
| Q-03: ¿Notificaciones por actividades vencidas? | Si se requieren, se agrega un job de BullMQ con scheduler (cron) que verifica actividades vencidas pendientes y emite notificaciones. No cambia la arquitectura base pero agrega un módulo. |

---

*Documento sujeto a revisión y aprobación antes del inicio del desarrollo.*
