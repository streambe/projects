# Acta de Constitucion - nearU

## 1. Datos Generales

| Campo | Valor |
|---|---|
| Proyecto | nearU |
| Fecha | 2026-04-05 |
| Sponsor | Gaston (Streambe) |
| Tipo | Nuevo |
| Branch | project-nearu |

## 2. Objetivo

Desarrollar una app mobile (iOS + Android via Capacitor) y backoffice web que permita a los asistentes de eventos hacer networking inteligente mediante pulseras BLE beacon FeasyBeacon FSC-BP107D. Al acercarse a menos de 5 metros, ambos participantes reciben informacion del otro en su telefono.

## 3. Alcance

### In scope

- App mobile nativa (Capacitor + Next.js) con deteccion BLE
- PWA para participantes sin app instalada (sin BLE)
- Backoffice web para organizadores (eventos, participantes, beacons, analytics)
- Check-in web responsive para personal en puerta
- Perfil central de participante (multi-evento)
- Notificaciones push
- Funcionamiento offline
- Analytics basicos

### Out of scope

- Chat/mensajeria entre participantes
- Integracion con CRMs
- Venta de entradas
- Mapas indoor / heatmaps
- Receptores BLE fijos en venue

## 4. Requerimientos Aprobados

26 requerimientos funcionales (RF-01 a RF-26) + 6 no funcionales (RNF-01 a RNF-06). Aprobados el 2026-04-05.

### EPIC-1: Gestion de Eventos (Backoffice Web)

- RF-01: CRUD eventos (nombre, descripcion, fecha inicio/fin, ubicacion, logo)
- RF-02: Ver, editar y cancelar eventos
- RF-03: Pre-registrar participantes (manual o CSV)
- RF-04: Dashboard analytics del evento
- RF-05: Gestionar inventario de pulseras

### EPIC-2: Check-in en Puerta (Web Responsive)

- RF-06: Web responsive simple para check-in
- RF-07: Buscar/crear participante, asignar pulsera, entregar codigo
- RF-08: Registrar devolucion de pulseras

### EPIC-3: Perfil Central de Participante

- RF-09: Perfil unico por email, persiste entre eventos
- RF-10: Datos pre-cargados si ya asistio a otro evento
- RF-11: Editar perfil desde la app

### EPIC-4: App Mobile (PWA + App Nativa)

- RF-12: PWA + app nativa via Capacitor
- RF-13: Login con codigo unico (sin password)
- RF-14: Listado real-time de personas cercanas (<5m) por proximidad
- RF-15: Tarjeta: nombre, apellido, empresa, rol, foto
- RF-16: Filtros por rol, empresa, busqueda por nombre
- RF-17: Notificacion push al detectar nueva persona en rango
- RF-18: Historial de encuentros con timestamps
- RF-19: Deteccion BLE offline, sync cuando hay conexion

### EPIC-5: Deteccion BLE

- RF-20: Escaneo BLE cada 5 segundos
- RF-21: Filtro por UUID del evento (iBeacon)
- RF-22: Distancia via RSSI, mostrar solo <5m
- RF-23: Deteccion mutua
- RF-24: Integracion con FeasyBeacon SDK

### EPIC-6: Analytics del Evento

- RF-25: Metricas: interacciones, top networkers, duracion, picos
- RF-26: Dashboard con graficos, exportable a CSV

### Requerimientos No Funcionales

- RNF-01: iOS 14+ y Android 10+
- RNF-02: Deteccion BLE en background
- RNF-03: Latencia de deteccion <10 segundos
- RNF-04: Soporte 500+ participantes simultaneos
- RNF-05: Datos encriptados en transito y reposo
- RNF-06: PWA instalable y offline (Service Worker)

## 5. Stack Aprobado

| Capa | Tecnologia |
|---|---|
| Frontend | Next.js (unico codebase) |
| Native wrapper | Capacitor (iOS + Android) |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| BLE | FeasyBeacon SDK via plugin Capacitor nativo |
| Deploy web | Vercel |
| Deploy native | App Store + Google Play |

## 6. Arquitectura Aprobada

- iBeacon UUID = evento, Minor = pulsera
- Offline: SQLite local + batch sync
- Push: notificacion local inmediata + push server-side para mutuidad
- 7 tablas: events, participants, event_participants, beacons, proximity_events, encounters, device_tokens

## 7. Plan de Trabajo

| Sprint | Foco | Duracion |
|---|---|---|
| Sprint 1 | Fundaciones: spike BLE, setup, modelo datos, CRUD eventos, perfil | 2 semanas |
| Sprint 2 | Core: participantes, beacons, check-in, app UI, plugin BLE | 2 semanas |
| Sprint 3 | BLE completo, offline, push, historial, filtros | 2 semanas |
| Sprint 4 | Analytics, testing E2E, seguridad, build stores, deploy | 2 semanas |

**Total: 73 Story Points / 8 semanas**

## 8. Equipo

23 agentes GEN, liderados por Alan Turing (PM/Scrum Master).

## 9. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigacion |
|---|---|---|---|
| BLE background iOS via Capacitor | Media | Alto | Spike Sprint 1, fallback nativo puro |
| Review Apple Store | Media | Medio | Submit early, TestFlight |
| FeasyBeacon SDK incompatible | Baja | Alto | Spike, alternativa CoreBluetooth directo |

## 10. Criterios de Exito

- Deteccion BLE funcional a <5m con latencia <10s
- Check-in completo en <15 segundos
- Soporte 500+ participantes simultaneos
- App publicada en ambas tiendas

## 11. Aprobaciones

| Artefacto | Estado | Fecha |
|---|---|---|
| Requerimientos | APROBADO | 2026-04-05 |
| Stack | APROBADO | 2026-04-05 |
| Arquitectura | APROBADO | 2026-04-05 |
| Wireframes | APROBADO | 2026-04-05 |
| Plan de trabajo | APROBADO | 2026-04-05 |
| Acta de Constitucion | APROBADO | 2026-04-05 |
