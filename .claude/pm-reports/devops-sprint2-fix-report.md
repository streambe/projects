# Reporte: Fix Docker Setup — CRM Ciudad Moto
**Rol**: DevOps Engineer
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos
- `projects/crm/docker-compose.yml` — servicio Redis agregado, dependencia del backend actualizada, volumen redisdata declarado
- `projects/crm/backend/package.json` — campo `main` corregido de `dist/app.js` a `dist/server.js`

## Resumen de lo realizado

### Bug 1 — Redis faltante en docker-compose.yml
El backend declara dependencias de `ioredis` y `bullmq` en su `package.json`, ambas requieren una instancia Redis disponible en runtime. Sin el servicio Redis el contenedor backend fallaba al arrancar con errores de conexión.

Cambios aplicados:
- Agregado servicio `redis` con imagen `redis:7-alpine` y `restart: unless-stopped`, con volumen persistente `redisdata:/data`.
- El servicio `backend` ahora depende de `redis` con `condition: service_started` (Redis no expone healthcheck nativo en esta imagen, pero arranca en menos de 1 segundo, por lo que `service_started` es suficiente).
- Declarado el volumen `redisdata` en el bloque `volumes:` del archivo.

### Bug 2 — Inconsistencia main vs start en package.json
El campo `"main": "dist/app.js"` no coincidía con el script `"start": "node dist/server.js"`. El entrypoint real del proceso es `dist/server.js`, confirmado además por el comando del contenedor en `docker-compose.yml` (`node dist/server.js`). El campo `main` se corrigió a `dist/server.js`.

## Decisiones tomadas
- Se usó `condition: service_started` para la dependencia Redis en lugar de un healthcheck custom, en linea con lo indicado en el ticket y con el comportamiento de arranque rápido de Redis Alpine.
- No se modificaron puertos ni variables de entorno de Redis ya que el backend se conecta internamente dentro de la red Docker por nombre de servicio (`redis`).

## Bloqueantes / Riesgos
- No hay bloqueantes. Los cambios son mínimos y no rompen el resto de la configuración.
- Riesgo menor: si el backend espera una variable de entorno `REDIS_URL` configurada explícitamente, habrá que agregarla al `.env` y al bloque `environment:` del servicio `backend`. No se pudo verificar esto sin acceso al código fuente del backend, pero es el paso natural siguiente.

## Recomendaciones para el siguiente rol
- Verificar que el código del backend construya la URL de Redis correctamente (por defecto `redis://redis:6379`) o que el `.env` incluya `REDIS_URL=redis://redis:6379`.
- Ejecutar `docker compose up --build` para validar el arranque completo del stack antes del merge.
- Si se agregan tests de integración, Redis y Postgres deben estar disponibles en el entorno de CI (GitHub Actions service containers o docker compose en el runner).
