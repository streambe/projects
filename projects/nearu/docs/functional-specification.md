# nearU — Especificación Funcional

**Versión:** 1.0
**Fecha:** 2026-04-05
**Responsable:** Analista Funcional (Ada Lovelace)
**Estado:** APROBADO

---

## 1. Alcance del Proyecto

### In Scope
- App mobile nativa (iOS + Android) vía Capacitor + Next.js con detección BLE.
- PWA para participantes sin app instalada (sin BLE).
- Backoffice web para organizadores: eventos, participantes, beacons, analytics.
- Check-in web responsive para personal en puerta.
- Perfil central de participante persistente multi-evento.
- Notificaciones push (local inmediata + server para mutuidad).
- Funcionamiento offline con cola local + sync batch.
- Analytics básicos del evento (interacciones, top networkers, picos).

### Out of Scope
- Chat o mensajería entre participantes.
- Integraciones con CRMs.
- Venta de entradas / ticketing.
- Mapas indoor / heatmaps.
- Receptores BLE fijos en venue.

---

## 2. Requerimientos Funcionales

### EPIC-1: Gestión de Eventos (Backoffice Web)

| ID | Descripción |
|---|---|
| RF-01 | CRUD eventos (nombre, descripción, fecha inicio/fin, ubicación, logo). |
| RF-02 | Ver, editar y cancelar eventos existentes. |
| RF-03 | Pre-registrar participantes manualmente o vía import CSV. |
| RF-04 | Dashboard de analytics por evento (interacciones, top networkers, picos). |
| RF-05 | Gestionar inventario de pulseras beacon (alta, baja, asignación, retiro). |

### EPIC-2: Check-in en Puerta

| ID | Descripción |
|---|---|
| RF-06 | Web responsive optimizada para uso en tablet/mobile en puerta. |
| RF-07 | Buscar o crear participante, asignar pulsera BLE, entregar código de acceso. |
| RF-08 | Registrar devolución de pulseras al finalizar el evento. |

### EPIC-3: Perfil Central de Participante

| ID | Descripción |
|---|---|
| RF-09 | Perfil único por email, persiste entre eventos. |
| RF-10 | Datos pre-cargados si el participante ya asistió a otro evento. |
| RF-11 | Editar perfil (nombre, empresa, rol, foto) desde la app. |

### EPIC-4: App Mobile

| ID | Descripción |
|---|---|
| RF-12 | PWA + app nativa iOS/Android vía Capacitor (mismo codebase). |
| RF-13 | Login passwordless con código de acceso único de 6 caracteres. |
| RF-14 | Listado en tiempo real de personas cercanas (<5m) ordenadas por proximidad. |
| RF-15 | Tarjeta de persona: nombre, apellido, empresa, rol, foto. |
| RF-16 | Filtros por rol, empresa y búsqueda por nombre. |
| RF-17 | Notificación push al detectar nueva persona en rango. |
| RF-18 | Historial de encuentros con timestamps y duración. |
| RF-19 | Detección BLE funciona offline; sync al recuperar conexión. |

### EPIC-5: Detección BLE

| ID | Descripción |
|---|---|
| RF-20 | Escaneo BLE cada 5 segundos en foreground y background. |
| RF-21 | Filtrado por UUID del evento (formato iBeacon). |
| RF-22 | Cálculo de distancia vía RSSI; mostrar solo <5m. |
| RF-23 | Detección mutua (ambos participantes reciben notificación). |
| RF-24 | Integración nativa BLE (iBeacon API iOS / Android BLE). |

### EPIC-6: Analytics del Evento

| ID | Descripción |
|---|---|
| RF-25 | Métricas: total de interacciones, top networkers, duración promedio, picos horarios. |
| RF-26 | Dashboard con gráficos y export a CSV. |

---

## 3. Requerimientos No Funcionales

| ID | Descripción |
|---|---|
| RNF-01 | Compatibilidad: iOS 14+ y Android 10+ (API 23+). |
| RNF-02 | Detección BLE en background sin degradación significativa de batería. |
| RNF-03 | Latencia de detección <10 segundos desde que dos personas se acercan. |
| RNF-04 | Soporte de 500+ participantes simultáneos por evento (MVP). |
| RNF-05 | Datos encriptados en tránsito (HTTPS/WSS) y en reposo (Supabase + secure storage). |
| RNF-06 | PWA instalable y funcional offline mediante Service Worker. |

---

## 4. User Stories con Criterios de Aceptación (Gherkin)

### US-01: Check-in de Participante

**Como** personal de puerta
**Quiero** registrar la llegada de un participante y asignarle una pulsera
**Para que** pueda ser detectado por otros asistentes en el evento.

```gherkin
DADO que el participante está pre-registrado en el evento
CUANDO el staff busca al participante por email o nombre
Y selecciona una pulsera disponible del inventario
Y confirma el check-in
ENTONCES el sistema marca el participante como checked_in
Y genera un access_code único de 6 caracteres
Y asocia el beacon_id al event_participant
Y muestra el código para entregarlo al participante
```

### US-02: Login con Código de Acceso

**Como** participante del evento
**Quiero** ingresar a la app sin crear contraseña
**Para que** el onboarding sea instantáneo.

```gherkin
DADO que el participante recibió su código de acceso en el check-in
CUANDO abre la app e ingresa el código de 6 caracteres
ENTONCES el sistema valida el código contra event_participants.access_code
Y crea una sesión con claims {participant_id, event_id}
Y redirige a la pantalla de Nearby
```

### US-03: Detección BLE y Visualización de Cercanos

**Como** participante
**Quiero** ver quién está cerca mío en tiempo real
**Para que** pueda acercarme y hacer networking.

```gherkin
DADO que el participante está logueado y tiene BLE habilitado
CUANDO otra persona con pulsera del mismo evento entra en rango <5m
ENTONCES dentro de 10 segundos aparece en la lista Nearby ordenada por distancia
Y se dispara una notificación local "Nueva persona cerca"
Y el evento queda registrado en proximity_events
```

### US-04: Historial de Encuentros

**Como** participante
**Quiero** ver a quién conocí durante el evento
**Para que** pueda recordar y hacer follow-up posterior.

```gherkin
DADO que el participante tuvo al menos un encuentro registrado
CUANDO abre la pantalla de Historial
ENTONCES ve la lista de personas ordenada por last_seen DESC
Y para cada una ve: foto, nombre, empresa, primera hora vista, duración total
```

### US-05: Analytics del Organizador

**Como** organizador del evento
**Quiero** ver métricas agregadas de networking
**Para que** pueda medir el éxito del evento.

```gherkin
DADO que el evento tiene proximity_events registrados
CUANDO el organizador abre el dashboard de analytics
ENTONCES ve: total de interacciones, top 10 networkers, duración promedio, picos horarios
Y puede exportar los datos a CSV
```

---

## 5. Diagramas de Flujo

### 5.1 Flujo de Check-in

```
[Staff abre Check-in]
        |
        v
[Busca participante por email]
        |
   +----+----+
   |         |
  Existe?  No existe
   |         |
   |         v
   |    [Crea perfil nuevo]
   |         |
   +----+----+
        v
[Selecciona beacon disponible]
        |
        v
[Confirma check-in]
        |
        v
[Genera access_code 6 chars]
        |
        v
[Entrega código al participante]
```

### 5.2 Flujo de Detección BLE (Online)

```
[BLE scan cada 5s]
        |
        v
[Filtra por UUID del evento]
        |
        v
[Lee minor del beacon]
        |
        v
[Resuelve minor -> participant]
        |
        v
[Calcula distancia desde RSSI]
        |
   +----+----+
   |         |
  <5m?     >=5m
   |         |
   v         v
[Muestra  [Descarta]
 en
 Nearby]
   |
   v
[POST /api/proximity]
   |
   v
[Si nueva persona -> notif local]
```

### 5.3 Flujo de Sync Offline

```
[BLE scan detecta encuentro]
        |
        v
[Hay conexión?]
   |         |
  Sí         No
   |         |
   |         v
   |    [Guarda en cola local]
   |         |
   |         v
   |    [Espera evento de red]
   |         |
   +----+----+
        v
[POST batch a /api/sync]
        |
        v
[Server dedupe por (observer, observed, timestamp)]
        |
        v
[Marca cola local como synced]
```

---

## 6. Integraciones Externas

| Servicio | Propósito | Tipo |
|---|---|---|
| Supabase | PostgreSQL, Realtime, Storage, Edge Functions | Backend |
| BLE nativo (iBeacon iOS / Android BLE) | Escaneo de pulseras beacon | SDK nativo |
| FCM (Firebase Cloud Messaging) | Push notifications Android | Push |
| APNs (Apple Push Notification service) | Push notifications iOS | Push |
| Vercel | Hosting web + CI/CD | Infra |

**Nota:** Durante el spike del Sprint 1 se validó que la API nativa iBeacon de iOS y Android BLE son suficientes — no se requiere el SDK de FeasyBeacon para el MVP.

---
