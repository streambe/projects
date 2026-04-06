# Reporte: Arquitectura de Alto Nivel nearU
**Rol**: Software Architect
**Fecha**: 2026-04-05
**Estado**: En progreso (Iteracion 1 - pendiente aprobacion)

## Entregables producidos
- `projects/nearu/docs/technical-architecture.md`

## Resumen de lo realizado
Se diseno la arquitectura de alto nivel para nearU cubriendo: diagrama de contexto, diagrama de componentes, modelo de datos (7 tablas), esquema de mapeo iBeacon (ADR-001), estrategia offline sync (ADR-002), flujo de push notifications (ADR-003), flujo de auth passwordless, consideraciones de seguridad (RLS, rate limiting, beacon spoofing), notas de escalabilidad y topologia de deploy.

## Decisiones tomadas
- ADR-001: iBeacon UUID = evento, Minor = beacon -> participante (permite filtrar por evento y resolver identidad)
- ADR-002: Offline-first con SQLite local, batch sync, dedup en servidor
- ADR-003: Notificacion local inmediata + push mutuo via Edge Functions

## Bloqueantes / Riesgos
- Volumen de proximity_events a escala (10K rows/sec) requiere particionado y agregacion periodica
- FeasyBeacon SDK compatibility con Capacitor debe validarse con un spike tecnico antes del Sprint 1

## Recomendaciones para el siguiente rol
- Usuario debe revisar y aprobar la arquitectura (Iteracion 1)
- UX Designer puede arrancar wireframes en paralelo
- Se recomienda un spike tecnico de BLE scanning con Capacitor + FeasyBeacon antes de estimar EPIC-5
