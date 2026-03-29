# Reporte: US-001 Scaffolding del proyecto backend + US-002 Schema de base de datos + migraciones Prisma
**Rol**: Backend Developer
**Fecha**: 2026-03-29
**Estado**: Completado

---

## Entregables producidos

### Archivos de configuracion del proyecto
- `crm/backend/package.json` — dependencias completas (Fastify v4, Prisma v5, Zod, bcryptjs, jsonwebtoken, bullmq, ioredis, pino, etc.)
- `crm/backend/tsconfig.json` — configuracion TypeScript strict mode, target ES2022, path aliases
- `crm/backend/.env.example` — todas las variables de entorno documentadas
- `crm/backend/.gitignore`
- `crm/backend/README.md` — instrucciones completas de setup local

### Schema de base de datos
- `crm/backend/prisma/schema.prisma` — schema completo con 8 modelos, 6 enums, indices y relaciones
- `crm/backend/prisma/seed.ts` — seed inicial con usuario admin para desarrollo

### Aplicacion Fastify
- `crm/backend/src/server.ts` — entry point con graceful shutdown
- `crm/backend/src/app.ts` — factory de la app con todos los plugins registrados

### Plugins compartidos
- `crm/backend/src/shared/plugins/prisma.plugin.ts` — decora fastify con `fastify.prisma`, maneja desconexion en shutdown
- `crm/backend/src/shared/plugins/jwt.plugin.ts` — access token via `@fastify/jwt`, refresh token via `jsonwebtoken` con secret separado

### Modulo Auth (completo)
- `crm/backend/src/modules/auth/auth.schema.ts` — schemas Zod para login y registro, tipo JwtPayload
- `crm/backend/src/modules/auth/auth.service.ts` — validacion de credenciales, creacion de usuarios, bcrypt rounds=12
- `crm/backend/src/modules/auth/auth.routes.ts` — rutas: POST /login, POST /refresh, POST /logout, POST /register, GET /me

### Utilidades compartidas
- `crm/backend/src/shared/middleware/auth.middleware.ts` — middleware de autenticacion JWT
- `crm/backend/src/shared/utils/errors.ts` — clases de error operacional (AppError, NotFoundError, ConflictError, etc.)
- `crm/backend/src/shared/utils/encryption.ts` — AES-256-GCM para cifrar tokens OAuth en reposo
- `crm/backend/src/shared/utils/pagination.ts` — helpers para paginacion por paginas con metadatos

### Tipos TypeScript
- `crm/backend/src/types/fastify.d.ts` — augmentacion de tipos de Fastify (prisma, authenticate, authenticateRefresh, signRefresh)
- `crm/backend/src/prisma/client.ts` — singleton de PrismaClient con soporte de hot-reload en desarrollo

---

## Resumen de lo realizado

Se construyo el scaffolding completo del backend para el CRM Ciudad Moto siguiendo la arquitectura monolitica modular definida en el documento de arquitectura. El proyecto compila sin errores TypeScript (`tsc --noEmit` limpio) y el build de produccion (`tsc`) genera todos los artefactos en `dist/`. El schema de Prisma fue validado (`prisma validate`) y el cliente fue generado exitosamente (`prisma generate`).

La estructura modular permite que los proximos sprints agreguen los modulos de clientes, oportunidades, actividades, comunicaciones y reportes sin necesidad de modificar la base.

---

## Decisiones tomadas

- **Refresh token con secret separado via jsonwebtoken directo**: `@fastify/jwt` en su version actual no soporta override de secret por llamada. Se usa `jsonwebtoken` directamente para firmar/verificar refresh tokens con `JWT_REFRESH_SECRET`. Esto garantiza que un refresh token no pueda usarse como access token ni vice versa.

- **fp() de fastify-plugin en plugins**: Los plugins usan `fastify-plugin` para que las decoraciones (prisma, authenticate, etc.) sean visibles en toda la instancia y no queden encapsuladas en el scope del plugin.

- **Prisma singleton con require()**: La importacion de `PrismaClient` desde `@prisma/client` genera un conflicto circular de tipos en TypeScript cuando se usa `import`. Se resuelve con `require()` que evita el problema manteniendo el mismo comportamiento en runtime.

- **Schema alineado con architecture.md**: Los nombres de campos y tipos siguen exactamente la especificacion del documento de arquitectura (`full_name`, `phone_primary`, `how_found_us` como enum, `sent_received_at`, `assigned_by_user_id`, etc.).

- **AES-256-GCM para cifrado de tokens OAuth**: Los tokens de Gmail y WhatsApp se cifran en reposo. La clave de 32 bytes (64 hex chars) se lee de `ENCRYPTION_KEY`. El formato almacenado es `base64(iv):base64(authTag):base64(ciphertext)` para autenticidad y confidencialidad.

- **Rate limiting global**: 100 requests por minuto por IP como proteccion basica. Configurable.

- **Pino logger**: Logging estructurado JSON en produccion, pino-pretty en desarrollo para legibilidad.

---

## Bloqueantes / Riesgos

- **Sin base de datos real**: Las migraciones no se pudieron ejecutar porque no hay instancia PostgreSQL disponible en el entorno de desarrollo actual. Los modulos futuros necesitaran una instancia corriendo para `prisma migrate dev`.

- **Redis no instalado**: BullMQ esta incluido como dependencia pero los workers de cola no estan implementados aun. Se necesitara Redis cuando se implemente la integracion Gmail/WhatsApp.

- **Ruta /register expuesta**: En MVP, la ruta de registro no tiene autenticacion para permitir el setup inicial. Antes del primer despliegue a produccion hay que decidir si se protege con un token de setup o se elimina.

---

## Recomendaciones para el siguiente rol

### Para el desarrollador que implemente los modulos de negocio (US-003+)

1. **Patron a seguir para nuevos modulos**: Crear `src/modules/<nombre>/`:
   - `<nombre>.schema.ts` — validacion Zod de los bodies de request
   - `<nombre>.service.ts` — logica de negocio usando `prisma` del cliente singleton
   - `<nombre>.routes.ts` — rutas Fastify con `preHandler: [fastify.authenticate]`
   - Registrar en `src/app.ts` bajo el bloque de rutas v1

2. **El cliente Prisma disponible en rutas**: En los route handlers, usar `import { prisma } from '../../prisma/client'` en el service layer, o acceder via `fastify.prisma` si se necesita dentro del scope de Fastify.

3. **Errores operacionales**: Usar las clases de `src/shared/utils/errors.ts`. El error handler global en `app.ts` las captura y responde con el statusCode correcto.

4. **Cifrado de tokens OAuth**: Al implementar `gmail` y `whatsapp`, usar `encrypt()` y `decrypt()` de `src/shared/utils/encryption.ts` antes de guardar/leer los tokens en `gmail_credentials` y `whatsapp_config`.

5. **Paginacion**: Usar `getPrismaPageParams` y `buildPaginatedResult` de `src/shared/utils/pagination.ts` en todos los endpoints de listado.

6. **Variables de entorno**: Copiar `.env.example` a `.env` y completar `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY` como minimo para levantar el servidor.

7. **Comando de inicio**: `npm install && npx prisma generate && npm run dev`
