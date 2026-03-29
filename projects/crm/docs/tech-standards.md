# Estándares Técnicos: CRM Ciudad Moto

**Versión**: 1.0
**Fecha**: 2026-03-29
**Preparado por**: Líder Técnico — Equipo GEN
**Estado**: Pendiente de aprobación

---

## ADR-001: Framework de Servidor

**Fecha**: 2026-03-29
**Status**: Accepted

### Context
El backend corre sobre Node.js. Se debe elegir entre Express, Fastify, Hapi y otros frameworks HTTP.

### Decision
**Fastify v4**

### Rationale
Fastify supera a Express en throughput (~3x en benchmarks reales con cargas sostenidas) y tiene soporte nativo de TypeScript, validación de esquemas integrada con JSON Schema/Zod, y un ecosistema de plugins maduro. Para un CRM con integraciones externas (Gmail, WhatsApp), la validación de entrada en capa de framework es un beneficio directo, no un extra. Express sigue siendo válido, pero su ecosistema fragmentado de middleware obliga a ensamblar piezas que Fastify trae consolidadas.

### Consequences
El equipo debe aprender el sistema de plugins de Fastify. La documentación es sólida. El costo de onboarding es bajo comparado con la ganancia operativa.

---

## ADR-002: ORM y Acceso a Base de Datos

**Fecha**: 2026-03-29
**Status**: Accepted

### Context
Se necesita una capa de acceso a PostgreSQL. Las opciones principales son Prisma, TypeORM, Drizzle y node-postgres puro.

### Decision
**Prisma v5**

### Rationale
Prisma genera tipos TypeScript directamente del schema, eliminando una clase entera de errores de runtime. Su CLI de migraciones (`prisma migrate`) es predecible y auditado en git. Para un equipo que probablemente no tiene todos sus miembros con experiencia profunda en SQL complejo, el query builder de Prisma reduce errores sin sacrificar acceso a SQL raw cuando se necesita (vía `$queryRaw`). Drizzle es más performante pero su DX para migraciones es menos madura. TypeORM tiene deuda técnica acumulada y decoradores legacy.

### Consequences
El schema de la base de datos vive en `prisma/schema.prisma` y es la fuente de verdad. Cualquier cambio de estructura pasa por una migración generada y versionada.

---

## ADR-003: Estrategia de Autenticación

**Fecha**: 2026-03-29
**Status**: Accepted

### Context
El sistema tiene dos roles (Vendedor, Dueño) con permisos idénticos en MVP. Se necesita auth segura para una app web desktop sin mobile.

### Decision
**JWT con Access Token (15 min) + Refresh Token (7 días) en HttpOnly Cookie**

### Rationale
- El access token se almacena en memoria del cliente (no localStorage), evitando XSS persistente.
- El refresh token viaja exclusivamente en cookie HttpOnly + Secure + SameSite=Strict, lo que lo hace inaccessible a JavaScript del navegador.
- No se usa ninguna librería de auth externa (Auth0, Clerk) porque la complejidad no justifica el costo para dos usuarios en MVP.
- La librería `@fastify/jwt` maneja la firma y verificación. `bcrypt` (12 rounds) para hashing de contraseñas.
- Un endpoint `POST /auth/refresh` renueva el access token usando el refresh token de la cookie.
- Logout invalida el refresh token en base de datos (tabla `refresh_tokens` con columna `revoked`).

### Consequences
Se necesita una tabla `refresh_tokens` en la base de datos. El frontend nunca toca el refresh token directamente. Esta estrategia escala sin cambios si en el futuro se agregan roles con permisos diferenciados.

---

## ADR-004: Integración Gmail API

**Fecha**: 2026-03-29
**Status**: Accepted

### Context
El CRM debe enviar y recibir emails desde una cuenta Gmail y vincularlos automáticamente a clientes por dirección de email.

### Decision
**Gmail API v1 con OAuth 2.0 + Google Cloud Pub/Sub para recepción en tiempo real**

### Rationale
- OAuth 2.0 con la cuenta corporativa de Ciudad Moto: el dueño autoriza una sola vez. El refresh token de OAuth se guarda encriptado en base de datos (columna `encrypted_token`, AES-256-GCM).
- Para recibir emails entrantes sin polling, se configura un **Gmail Push Notification** hacia un topic de Google Cloud Pub/Sub. El backend expone un endpoint webhook que Google llama cuando llega un email nuevo. El mensaje contiene solo el `historyId`; el backend hace un `users.history.list` para obtener los mensajes nuevos.
- Los emails se vinculan a clientes haciendo match por `from` address contra el campo `email` de la tabla `clients`.
- Los emails sin match se guardan en una cola de "no vinculados" para revisión manual.

### Consequences
Se requiere una cuenta Google Cloud con Pub/Sub habilitado. El webhook debe estar en HTTPS (obligatorio para Pub/Sub). El token de OAuth debe rotarse automáticamente usando el refresh token almacenado. Agregar una dependencia: `googleapis` (SDK oficial de Google).

---

## ADR-005: Integración WhatsApp Business API

**Fecha**: 2026-03-29
**Status**: Accepted

### Context
El CRM debe enviar y recibir mensajes de WhatsApp y vincularlos a clientes.

### Decision
**WhatsApp Business Platform (Cloud API) — Meta for Developers**

### Rationale
- La Cloud API de Meta no requiere hosting propio de WhatsApp Business API server (la opción on-premise). Meta hostea la infraestructura.
- Los mensajes entrantes llegan vía webhook HTTP a un endpoint del backend. El número de teléfono del remitente se usa para hacer match contra el campo `whatsapp_number` de la tabla `clients`.
- Los mensajes salientes se envían vía `POST https://graph.facebook.com/v18.0/{phone-number-id}/messages`.
- Para mensajes iniciados por el negocio (outbound fuera de ventana de 24h), se requieren **Message Templates** pre-aprobados por Meta. Esto es una restricción de la plataforma, no del diseño.
- Autenticación: Bearer token del System User de Meta guardado encriptado en variables de entorno / secret manager.

### Consequences
Se necesita una cuenta Meta Business verificada con número de teléfono dedicado. El webhook debe verificarse con el token de verificación de Meta (handshake inicial). Los mensajes de texto libre solo pueden enviarse dentro de la ventana de 24h tras el último mensaje del cliente. Fuera de esa ventana, solo templates. El equipo debe coordinar con Ciudad Moto la aprobación de templates en Meta.

---

## 1. Stack Completo y Versiones

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| Runtime | Node.js | 20 LTS | LTS activo, soporte hasta 2026-04 |
| Lenguaje | TypeScript | 5.x | Strict mode. Tipos en compilación, no en runtime |
| Framework HTTP | Fastify | 4.x | Ver ADR-001 |
| ORM | Prisma | 5.x | Ver ADR-002 |
| Base de datos | PostgreSQL | 16 | Última versión estable |
| Auth | @fastify/jwt + bcrypt | jwt 8.x / bcrypt 5.x | Ver ADR-003 |
| Validación | Zod | 3.x | Schema-first, integra con Fastify |
| Variables de entorno | dotenv + zod | — | Variables tipadas y validadas al startup |
| Testing backend | Vitest + supertest | — | Más rápido que Jest, misma API |
| Frontend | React | 18.x | LTS de facto |
| Build tool | Vite | 5.x | Significativamente más rápido que CRA/Webpack |
| Routing frontend | React Router | 6.x | Data router pattern |
| Estado global | Zustand | 4.x | Mínima boilerplate, suficiente para el scope |
| HTTP client | TanStack Query + axios | TQ 5.x / axios 1.x | Cache, loading states, refetch automático |
| UI components | shadcn/ui + Tailwind CSS | — | Componentes sin lock-in, customizables, Tailwind v3 |
| Formularios | React Hook Form + Zod | RHF 7.x | Rendimiento, integración con Zod para validación |
| Kanban | @dnd-kit | 6.x | Accesible, sin dependencias pesadas |
| Linter | ESLint 9 + typescript-eslint | — | Flat config |
| Formatter | Prettier | 3.x | Integrado con ESLint |
| Pre-commit hooks | Husky + lint-staged | — | Bloquea commits con errores de lint |
| Integración Google | googleapis | 126.x | SDK oficial |

---

## 2. Estructura de Carpetas

### Backend (`/backend`)

```
backend/
├── prisma/
│   ├── schema.prisma          # Fuente de verdad del schema de BD
│   └── migrations/            # Migraciones generadas, versionadas en git
├── src/
│   ├── config/
│   │   ├── env.ts             # Validación de variables de entorno con Zod
│   │   └── database.ts        # Instancia de Prisma Client (singleton)
│   ├── modules/               # Un directorio por módulo de negocio
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts # Schemas Zod de request/response
│   │   │   └── auth.test.ts
│   │   ├── clients/
│   │   │   ├── clients.routes.ts
│   │   │   ├── clients.service.ts
│   │   │   ├── clients.repository.ts  # Queries a Prisma
│   │   │   ├── clients.schema.ts
│   │   │   └── clients.test.ts
│   │   ├── pipeline/
│   │   ├── activities/
│   │   ├── communications/
│   │   │   ├── gmail/
│   │   │   │   ├── gmail.service.ts
│   │   │   │   └── gmail.webhook.ts
│   │   │   └── whatsapp/
│   │   │       ├── whatsapp.service.ts
│   │   │       └── whatsapp.webhook.ts
│   │   └── reports/
│   ├── shared/
│   │   ├── errors/
│   │   │   ├── AppError.ts    # Clase base de errores de dominio
│   │   │   └── error-handler.ts
│   │   ├── middleware/
│   │   │   └── authenticate.ts
│   │   └── utils/
│   │       └── crypto.ts      # Encriptación de tokens OAuth/WhatsApp
│   ├── app.ts                 # Registro de plugins y routes en Fastify
│   └── server.ts              # Entry point: arranca el servidor
├── .env.example
├── package.json
└── tsconfig.json
```

### Frontend (`/frontend`)

```
frontend/
├── public/
├── src/
│   ├── assets/                # Imágenes, íconos estáticos
│   ├── components/            # Componentes reutilizables sin lógica de negocio
│   │   ├── ui/                # Re-exports de shadcn/ui customizados
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   └── Sidebar.tsx
│   │   └── common/
│   │       ├── DataTable.tsx
│   │       └── ConfirmDialog.tsx
│   ├── modules/               # Espejo de los módulos del backend
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── useAuth.ts
│   │   ├── clients/
│   │   │   ├── ClientsListPage.tsx
│   │   │   ├── ClientProfilePage.tsx
│   │   │   ├── ClientForm.tsx
│   │   │   ├── useClients.ts  # TanStack Query hooks
│   │   │   └── clients.types.ts
│   │   ├── pipeline/
│   │   ├── activities/
│   │   ├── communications/
│   │   └── reports/
│   ├── lib/
│   │   ├── api.ts             # Instancia de axios con interceptors (token, refresh)
│   │   └── queryClient.ts     # Instancia de TanStack Query Client
│   ├── store/
│   │   └── authStore.ts       # Zustand: access token en memoria
│   ├── router/
│   │   └── index.tsx          # React Router: rutas protegidas y públicas
│   ├── styles/
│   │   └── globals.css        # Tailwind base + variables CSS
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── vite.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## 3. Convenciones de Código

### Naming

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos TypeScript | kebab-case | `clients.service.ts` |
| Archivos React | PascalCase | `ClientForm.tsx` |
| Componentes React | PascalCase | `ClientProfilePage` |
| Funciones / variables | camelCase | `findClientByDni` |
| Constantes globales | UPPER_SNAKE_CASE | `MAX_PAGINATION_LIMIT` |
| Tipos e Interfaces | PascalCase | `CreateClientInput` |
| Tablas en BD | snake_case plural | `clients`, `refresh_tokens` |
| Columnas en BD | snake_case | `first_name`, `created_at` |
| Branches Git | prefijo/descripcion-kebab | `feature/client-duplicate-detection` |

### TypeScript

- `strict: true` en `tsconfig.json`. No se acepta `@ts-ignore` sin comentario explicando por qué.
- Prohibido `any`. Si una forma externa es desconocida, usar `unknown` y hacer narrowing explícito.
- Interfaces para objetos de dominio, `type` para uniones y utilidades.
- Los enums de TypeScript están prohibidos. Usar `as const` objects en su lugar.

```typescript
// Correcto
const OPPORTUNITY_STAGE = {
  NEW: 'new',
  CONTACTED: 'contacted',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost',
} as const;

type OpportunityStage = typeof OPPORTUNITY_STAGE[keyof typeof OPPORTUNITY_STAGE];
```

### Formatting

Prettier con esta configuración en `prettier.config.ts`:

```typescript
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
};
```

No se discuten preferencias de formato en code reviews. Prettier es la fuente de verdad.

### Linting

ESLint con reglas relevantes activadas:

- `no-console`: warn en producción (usar logger de Fastify o `console` solo en dev)
- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/no-floating-promises`: error (todas las promesas deben ser awaited o manejadas)
- `react-hooks/exhaustive-deps`: error

### Commits

Conventional Commits obligatorio:

```
feat(clients): add duplicate detection on create
fix(auth): refresh token not revoked on logout
chore(deps): upgrade prisma to 5.12
refactor(pipeline): extract stage transition logic to service
test(communications): add whatsapp webhook signature verification
```

El scope es el nombre del módulo en minúscula. Husky bloquea el commit si no pasa lint-staged.

---

## 4. Estándares de API

### Diseño REST

- Recursos en plural, sustantivos: `/clients`, `/opportunities`, `/activities`
- Sub-recursos para relaciones: `/clients/:id/activities`, `/clients/:id/communications`
- Las acciones que no son CRUD usan verbos en la URL solo cuando es inevitable: `POST /auth/refresh`, `POST /auth/logout`

### Versionado

Prefijo `/api/v1/` en todos los endpoints. El versionado existe desde el día uno para no hacer un breaking change cuando haya que versionar.

### Tabla de Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout, revoca refresh token |
| POST | `/api/v1/auth/refresh` | Renueva access token |
| GET | `/api/v1/clients` | Listado con search y paginación |
| POST | `/api/v1/clients` | Crear cliente |
| GET | `/api/v1/clients/:id` | Perfil completo |
| PATCH | `/api/v1/clients/:id` | Edición parcial |
| DELETE | `/api/v1/clients/:id` | Eliminación lógica (soft delete) |
| GET | `/api/v1/clients/:id/communications` | Historial de comunicaciones |
| GET | `/api/v1/opportunities` | Listado de oportunidades |
| POST | `/api/v1/opportunities` | Crear oportunidad |
| PATCH | `/api/v1/opportunities/:id` | Actualizar / mover etapa |
| GET | `/api/v1/activities` | Listado de actividades |
| POST | `/api/v1/activities` | Registrar actividad |
| POST | `/api/v1/communications/gmail/send` | Enviar email |
| POST | `/api/v1/communications/whatsapp/send` | Enviar mensaje WA |
| POST | `/api/v1/webhooks/gmail` | Webhook Pub/Sub (Google) |
| POST | `/api/v1/webhooks/whatsapp` | Webhook Meta |
| GET | `/api/v1/webhooks/whatsapp` | Verificación webhook Meta |

### Formato de Respuesta

Todas las respuestas siguen esta estructura:

**Respuesta exitosa (recurso único)**
```json
{
  "data": {
    "id": "uuid",
    "firstName": "Juan",
    "lastName": "Pérez"
  }
}
```

**Respuesta exitosa (colección)**
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "perPage": 20,
    "totalPages": 8
  }
}
```

**Respuesta de error**
```json
{
  "error": {
    "code": "CLIENT_NOT_FOUND",
    "message": "No existe un cliente con el ID proporcionado.",
    "details": {}
  }
}
```

- `code`: constante en UPPER_SNAKE_CASE, usada programáticamente por el frontend.
- `message`: texto en español, legible por usuario si corresponde.
- `details`: objeto opcional con información adicional (ej: campos que fallaron validación).

### Códigos HTTP

| Situación | Código |
|-----------|--------|
| OK con datos | 200 |
| Creado | 201 |
| OK sin cuerpo (ej: logout) | 204 |
| Validación fallida | 400 |
| No autenticado | 401 |
| No autorizado | 403 |
| Recurso no encontrado | 404 |
| Conflicto (ej: DNI duplicado) | 409 |
| Error interno | 500 |

### Paginación

Query params estándar: `?page=1&perPage=20&search=juan&sortBy=createdAt&sortOrder=desc`

`perPage` máximo: 100. Default: 20.

---

## 5. Estrategia de Autenticación (detalle de implementación)

Ver ADR-003 para la decisión. Esta sección cubre la implementación concreta.

### Flujo de Login

```
1. POST /api/v1/auth/login  { email, password }
2. Backend verifica password con bcrypt.compare()
3. Genera access_token JWT (payload: { sub: userId }, exp: 15min)
4. Genera refresh_token (UUID v4, guardado hasheado en tabla refresh_tokens)
5. Response: { data: { accessToken, user: { id, name, email } } }
   Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh
```

### Flujo de Renovación

```
1. Axios interceptor detecta 401 en cualquier request
2. POST /api/v1/auth/refresh (cookie enviada automáticamente)
3. Backend valida refresh_token: existe en BD, no revocado, no expirado
4. Genera nuevo access_token
5. Frontend actualiza accessToken en Zustand store
6. Reintenta el request original
```

### Almacenamiento en Frontend

- `accessToken`: solo en memoria (variable en Zustand store). Se pierde al cerrar la tab, forzando re-login o renovación via cookie.
- `refreshToken`: cookie HttpOnly, nunca accesible desde JS.
- Los datos básicos del usuario (`id`, `name`, `email`) se guardan en Zustand para mostrar en UI.

### Rutas Protegidas

En el frontend, un componente `ProtectedRoute` verifica si hay `accessToken` en el store. Si no hay, redirige a `/login`. El token se renueva en background antes de expirar (timer a los 14 min).

---

## 6. Decisiones sobre Integraciones

Ver ADR-004 (Gmail) y ADR-005 (WhatsApp) para las decisiones de plataforma. Esta sección cubre las consideraciones de implementación compartidas.

### Almacenamiento de Tokens Sensibles

Los tokens OAuth de Gmail y el Bearer token de Meta **no se guardan en texto plano**. Se encriptan con AES-256-GCM antes de persistir en base de datos. La clave de encriptación vive en variable de entorno `TOKEN_ENCRYPTION_KEY` (nunca en código). El módulo `src/shared/utils/crypto.ts` expone `encrypt(text)` y `decrypt(ciphertext)`.

### Vinculación de Comunicaciones a Clientes

La lógica de matching es la misma para Gmail y WhatsApp:

1. Llega mensaje entrante al webhook.
2. Se extrae el identificador del remitente (email address o número de teléfono).
3. Se busca en la tabla `clients` por `email` (Gmail) o `whatsapp_number` (WhatsApp).
4. Si hay match: se crea un registro en `communications` con `client_id` asignado.
5. Si no hay match: se crea el registro con `client_id = NULL` y `status = 'unlinked'`. Una vista en el frontend mostrará estas comunicaciones sin vincular para resolución manual.

### Verificación de Webhooks

- **Gmail / Pub/Sub**: el backend valida que el request viene de Google verificando el JWT incluido en el header `Authorization` del push de Pub/Sub contra los certificados públicos de Google.
- **WhatsApp / Meta**: el backend verifica la firma `X-Hub-Signature-256` de cada request usando HMAC-SHA256 con el `APP_SECRET` de Meta. Requests sin firma válida devuelven 403 inmediatamente.

Ambas verificaciones ocurren antes de cualquier procesamiento. Un webhook sin firma válida no escribe nada en la base de datos.

### Limitaciones Conocidas y Acciones Requeridas

| Limitación | Plataforma | Acción requerida |
|-----------|-----------|-----------------|
| Mensajes outbound fuera de ventana de 24h solo con templates aprobados | WhatsApp | Ciudad Moto debe crear y enviar templates a Meta para aprobación antes del go-live |
| OAuth de Gmail requiere autorización inicial del dueño | Gmail | Coordinar una sesión de configuración con el cliente para el flujo de autorización |
| El número de WhatsApp debe ser dedicado (no puede estar activo en la app móvil de WhatsApp) | WhatsApp | Ciudad Moto debe proveer un número de teléfono exclusivo para la integración |
| Pub/Sub requiere HTTPS público para el webhook | Gmail | El entorno de staging y producción deben tener SSL. Desarrollo local usa ngrok o similar |

---

## 7. Herramientas de Desarrollo Local

- **Docker Compose**: PostgreSQL local en contenedor. El equipo no instala Postgres directamente en la máquina.
- **ngrok**: para exponer webhooks locales durante desarrollo de las integraciones.
- Variables de entorno: cada dev copia `.env.example` a `.env.local`. El `.env.local` está en `.gitignore`. Nunca se commitea un `.env` con valores reales.

Archivo `docker-compose.yml` en la raíz del backend con servicio `db` (postgres:16) y `adminer` para inspección visual de la BD en desarrollo.

---

*Este documento debe ser revisado y aprobado por el cliente antes de comenzar el desarrollo. Una vez aprobado, se versiona en el repositorio y cualquier cambio requiere un nuevo ADR o la actualización del existente con nueva fecha y justificación.*
