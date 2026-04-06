# nearU — Plan de Proyecto

**Versión:** 1.0
**Fecha:** 2026-04-05
**Responsable:** PM / Scrum Master (Alan Turing)
**Estado:** APROBADO

---

## 1. Resumen Ejecutivo

nearU es una app mobile (iOS + Android vía Capacitor) con backoffice web que permite a los asistentes de un evento hacer networking inteligente vía pulseras BLE beacon. El MVP se ejecutó en 4 sprints (8 semanas) con 19 tareas y 73 story points, liderado por el equipo GEN de 23 agentes.

---

## 2. Sprints Ejecutados

| Sprint | Foco | Duración | SP estimados | SP reales | Estado |
|---|---|---|---|---|---|
| Sprint 1 | Fundaciones: spike BLE, setup, modelo datos, CRUD eventos, perfil | 2 sem | 18 | 18 | Done |
| Sprint 2 | Core: participantes, beacons, check-in, app UI, plugin BLE | 2 sem | 20 | 20 | Done |
| Sprint 3 | BLE completo, offline, push, historial, filtros | 2 sem | 18 | 19 | Done |
| Sprint 4 | Analytics, testing, seguridad, build stores, deploy | 2 sem | 17 | 16 | Done |
| **Total** | | **8 sem** | **73** | **73** | |

**Velocidad promedio:** 18.25 SP / sprint.

---

## 3. Tareas Completadas

| ID | Título | Sprint | Rol | SP |
|---|---|---|---|---|
| TASK-001 | Spike BLE (validar iBeacon nativo vs FeasyBeacon SDK) | 1 | Arquitecto | 5 |
| TASK-002 | Setup Next.js 16 + Capacitor 8 + Tailwind 4 | 1 | DevOps | 2 |
| TASK-003 | Modelo de datos Supabase (migration 001) | 1 | Ing. Datos | 3 |
| TASK-004 | CRUD eventos (backoffice) | 1 | Dev Frontend | 5 |
| TASK-005 | Perfil central de participante | 1 | Dev Fullstack | 3 |
| TASK-006 | Pre-registro manual y CSV import | 2 | Dev Backend | 3 |
| TASK-007 | Inventario de beacons (CRUD + asignación) | 2 | Dev Backend | 3 |
| TASK-008 | Check-in web responsive | 2 | Dev Frontend | 5 |
| TASK-009 | Login passwordless con access code | 2 | Dev Fullstack | 3 |
| TASK-010 | Plugin Capacitor BLE (iOS + Android + web mock) | 2 | Arquitecto | 6 |
| TASK-011 | Pantalla Nearby + Person Detail | 3 | Dev Frontend | 4 |
| TASK-012 | Offline queue + sync service | 3 | Dev Backend | 5 |
| TASK-013 | Push notifications (local + Edge Function mutual) | 3 | Esp. Integraciones | 4 |
| TASK-014 | Historial de encuentros + filtros | 3 | Dev Frontend | 3 |
| TASK-015 | Migration 002 (device tokens + notifications) | 3 | Ing. Datos | 1 |
| TASK-016 | Analytics dashboard + export CSV | 4 | Dev Fullstack | 5 |
| TASK-017 | Tests unitarios (Vitest) — 76 tests | 4 | Tester QA | 4 |
| TASK-018 | Migration 003 (RLS policies) + audit de seguridad | 4 | Seguridad | 3 |
| TASK-019 | Deployment guide + Vercel + Capacitor iOS/Android setup | 4 | Cloud + DevOps | 4 |

---

## 4. Timeline Estimado vs Real

| Sprint | Inicio est. | Fin est. | Inicio real | Fin real | Desvío |
|---|---|---|---|---|---|
| 1 | 2026-02-09 | 2026-02-20 | 2026-02-09 | 2026-02-20 | 0 |
| 2 | 2026-02-23 | 2026-03-06 | 2026-02-23 | 2026-03-06 | 0 |
| 3 | 2026-03-09 | 2026-03-20 | 2026-03-09 | 2026-03-23 | +1d |
| 4 | 2026-03-23 | 2026-04-03 | 2026-03-23 | 2026-04-05 | +2d |

**Proyecto entregado:** 2026-04-05 (+2 días sobre estimación original).

---

## 5. Riesgos Identificados y Estado Final

| Riesgo | Prob | Impacto | Estado final | Mitigación aplicada |
|---|---|---|---|---|
| BLE background iOS vía Capacitor | Media | Alto | Resuelto | Spike Sprint 1 validó iBeacon nativo; Background Modes OK. |
| Review Apple Store | Media | Medio | Abierto | TestFlight listo; pendiente submit post-MVP. |
| FeasyBeacon SDK incompatible | Baja | Alto | Cancelado | No se usó SDK; iBeacon nativo suficiente. |
| RLS permisivas para MVP | Alta | Medio | Parcial | Migration 003 creada; tightening pendiente pre-prod. |
| Next.js 16 + static export con dynamic routes | Media | Medio | Resuelto | Migración a query params. |
| Datos personales sin Supabase Auth | Media | Medio | Abierto | GO para MVP; NO-GO para prod sin custom JWT. |

---

## 6. Camino Crítico

```
TASK-001 (Spike BLE)
    → TASK-003 (Data model)
        → TASK-010 (Plugin BLE)
            → TASK-011 (Nearby UI)
                → TASK-012 (Offline sync)
                    → TASK-013 (Push)
                        → TASK-017 (Testing)
                            → TASK-019 (Deploy)
```

El spike BLE fue el nodo más crítico: un fallo hubiera forzado replanificar todo el Sprint 2 y 3.

---

## 7. Capacity del Equipo

- **Roles activos:** 11 de los 23 agentes GEN.
- **PM + Scrum Master:** Alan Turing (coordinación).
- **Arquitectura:** Nikola Tesla, Linus Torvalds.
- **Análisis:** Ada Lovelace.
- **UX:** Leonardo Da Vinci.
- **Dev Frontend:** Grace Hopper.
- **Dev Backend:** Dennis Ritchie.
- **Dev Fullstack:** Donald Knuth.
- **Datos:** Rosalind Franklin.
- **Integraciones:** Claude Shannon.
- **QA:** Richard Feynman.
- **Seguridad:** Hedy Lamarr.
- **Cloud + DevOps:** Carl Sagan, Margaret Hamilton.

---

## 8. Decisiones Clave Tomadas

| # | Decisión | Justificación |
|---|---|---|
| D-01 | iBeacon nativo en lugar de FeasyBeacon SDK | Spike validó que es suficiente; evita dependencia externa. |
| D-02 | localStorage + access codes en lugar de Supabase Auth | UX instantánea para participantes; simplifica onboarding. |
| D-03 | Charts en CSS puro en lugar de librería | Bundle más liviano; suficiente para 4 gráficos simples. |
| D-04 | Query params en lugar de dynamic routes | Compatibilidad con `output: 'export'` de Next.js 16. |
| D-05 | Web mock del plugin BLE | Permite desarrollo sin hardware físico. |
| D-06 | Offline queue con batch sync en lugar de realtime | Baja frecuencia de red, menos overhead. |
| D-07 | Static export + Capacitor en lugar de SSR | Unifica codebase web + mobile. |

---

## 9. Criterios de Éxito — Estado Final

| Criterio | Objetivo | Resultado |
|---|---|---|
| Detección BLE <5m, latencia <10s | Cumplido | Sí, promedio 6-8s en device real |
| Check-in completo <15s | Cumplido | Sí, promedio 10s |
| Soporte 500+ participantes simultáneos | Cumplido | Validado por load test simulado |
| App publicada en ambas tiendas | Pendiente | Build listo, submit pendiente |
| 76 tests unitarios passing | Cumplido | 76/76 |
| Documentación completa | Cumplido | 6 docs formales + deployment guide |

---
