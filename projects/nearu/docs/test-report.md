# nearU — Test Report

**Versión:** 1.0
**Fecha:** 2026-04-05
**Responsable:** Tester QA (Richard Feynman)
**Estado:** PASSING (76/76)

---

## 1. Resumen Ejecutivo

Se ejecutó una suite completa de tests unitarios con **Vitest 4.1** sobre los módulos críticos de lógica de negocio. **76 tests en 11 archivos, 100% passing.** No se encontraron bugs abiertos al cierre del Sprint 4.

---

## 2. Stack de Testing

| Componente | Tecnología |
|---|---|
| Test runner | Vitest 4.1.2 |
| DOM mock | jsdom 29 |
| Assertions | @testing-library/jest-dom 6.9 |
| React testing | @testing-library/react 16.3 |
| Coverage | Vitest built-in (v8 provider) |

---

## 3. Plan de Tests

### 3.1 Alcance
- Tests unitarios de toda la lógica en `src/lib/`.
- Tests de resolución beacon → participant.
- Tests de cola offline y sync service.
- Tests de utilidades BLE (RSSI → distancia, filtrado).
- Tests de analytics y export CSV.

### 3.2 Fuera de Alcance (MVP)
- E2E con Playwright (previsto post-MVP).
- Tests de performance bajo carga real.
- Tests en dispositivo físico (validación manual durante desarrollo).

---

## 4. Cobertura por Módulo

| Módulo | Archivo de test | Tests | Estado |
|---|---|---|---|
| Autenticación | `auth.test.ts` | 7 | ✔ |
| Participants | `participants.test.ts` | 8 | ✔ |
| Events | `events.test.ts` | 7 | ✔ |
| Beacons | `beacons.test.ts` | 6 | ✔ |
| Encounters | `encounters.test.ts` | 8 | ✔ |
| Offline store | `offline-store.test.ts` | 7 | ✔ |
| Sync service | `sync-service.test.ts` | 6 | ✔ |
| CSV export | `csv-export.test.ts` | 5 | ✔ |
| Notifications | `notifications.test.ts` | 7 | ✔ |
| Analytics | `analytics.test.ts` | 8 | ✔ |
| BLE utils | `ble-utils.test.ts` | 7 | ✔ |
| **Total** | **11 archivos** | **76** | **76/76 ✔** |

---

## 5. Casos de Prueba Críticos

### 5.1 BLE Detection
- Cálculo de distancia desde RSSI con `txPower` conocido.
- Filtrado por UUID de evento (descarta beacons ajenos).
- Manejo de RSSI inestable (promedio móvil).
- Umbral de 5m (excluir lo que esté fuera).

### 5.2 Beacon → Participant Resolution
- Resolver `minor` a `participant_id` vía JOIN `beacons → event_participants → participants`.
- Caso: beacon no asignado → retorna null sin error.
- Caso: beacon asignado a otro evento → retorna null.
- Caso: múltiples participantes históricos con mismo beacon → solo el activo.

### 5.3 Offline Sync
- Enqueue en localStorage cuando no hay conexión.
- Batch POST al recuperar red (hasta 500 rows).
- Dedupe por `(observer_id, observed_id, detected_at)`.
- Retry con backoff exponencial en caso de fallo de red.
- Clear de cola tras sync exitoso.

### 5.4 Mutual Detection
- Si A detectó a B y B detectó a A en ventana <5 min → trigger Edge Function.
- Push a ambos vía FCM/APNs.
- No duplicar notificación si el par ya fue notificado.

### 5.5 Analytics
- Count de interacciones únicas (A↔B cuenta como una).
- Top networkers ordenados por cantidad de encuentros únicos.
- Picos horarios por bucket de 1 hora.
- Duración promedio de encuentro.

### 5.6 CSV Export
- Escape correcto de comas y comillas en campos.
- UTF-8 con BOM para compatibilidad Excel.
- Headers en español.

---

## 6. Bugs Encontrados y Resueltos Durante el Sprint

| # | Módulo | Severidad | Descripción | Estado |
|---|---|---|---|---|
| BUG-01 | BLE utils | P2 | Distancia negativa con RSSI > txPower | Fixed (clamp a 0) |
| BUG-02 | Sync service | P2 | Dedupe fallaba por timestamps con milisegundos | Fixed (trunc a segundos) |
| BUG-03 | Analytics | P3 | Top networkers contaba encuentros duplicados | Fixed (DISTINCT en query) |
| BUG-04 | CSV export | P3 | Caracteres con acento se rompían en Excel | Fixed (BOM UTF-8) |
| BUG-05 | Notifications | P2 | Push local se disparaba para mismo participante 2 veces | Fixed (cache 5min en cliente) |
| BUG-06 | Offline store | P2 | Cola no se limpiaba tras sync parcial | Fixed (marcar por ID, no bulk) |

**Total:** 6 bugs encontrados y resueltos durante el ciclo. **0 bugs abiertos al cierre.**

---

## 7. Cobertura de Criterios de Aceptación

| User Story | CA Gherkin cubiertos | Estado |
|---|---|---|
| US-01 Check-in | 4/4 | ✔ |
| US-02 Login con código | 3/3 | ✔ |
| US-03 Detección BLE | 4/4 | ✔ |
| US-04 Historial | 3/3 | ✔ |
| US-05 Analytics | 4/4 | ✔ |

---

## 8. Conclusión

La suite de tests da cobertura suficiente a toda la lógica de negocio crítica del MVP. Los 76 tests pasan consistentemente. Se recomienda complementar con E2E en Playwright y tests en dispositivo físico antes del release a producción.

**Veredicto QA:** **GO** para Sprint Review y demo.

---
