# nearU -- Technical Architecture
**Date**: 2026-04-05
**Status**: Proposed (Iteration 1)
**Author**: Software Architect (Nikola Tesla)

---

## 1. System Context

```
+-------------------+       +-------------------+       +-------------------+
|   Organizer       |       |   Door Staff      |       |   Participant     |
|   (Backoffice)    |       |   (Check-in Web)  |       |   (Mobile App)    |
+--------+----------+       +--------+----------+       +--------+----------+
         |                           |                            |
         |  HTTPS                    |  HTTPS                     |  HTTPS + WS
         v                           v                            v
+------------------------------------------------------------------------+
|                        Vercel (Next.js SSR/API)                        |
|  Backoffice pages | Check-in pages | App pages (PWA) | API Routes     |
+--------+-----------------------------------------------------------+---+
         |                                                           |
         |  Supabase JS Client (REST + Realtime WS)                  |
         v                                                           v
+------------------------------------------------------------------------+
|                         Supabase Cloud                                 |
|  PostgreSQL | Auth | Realtime | Storage | Edge Functions               |
+------------------------------------------------------------------------+

Native shell (Capacitor):
  iOS/Android app = Next.js PWA + Capacitor native plugins
  FeasyBeacon SDK plugin -> BLE scanning -> local SQLite -> sync to Supabase
```

---

## 2. Component Diagram

```
NEXT.JS MONOLITH (Vercel)
+---------------------------------------------------------------+
|                                                               |
|  /backoffice/*        /checkin/*        /app/*                |
|  - Event CRUD         - Search user     - Login (code)        |
|  - CSV import         - Assign beacon   - Nearby list         |
|  - Beacon mgmt        - Return beacon   - Person card         |
|  - Analytics dash     - Create user     - History             |
|                                                               |
|  /api/*  (Next.js Route Handlers)                             |
|  - /api/events        - /api/checkin    - /api/proximity      |
|  - /api/participants  - /api/beacons    - /api/analytics      |
|  - /api/auth/code     - /api/sync                             |
+---------------------------------------------------------------+
         |
         v
SUPABASE
+---------------------------------------------------------------+
|  PostgreSQL            | Auth (magic code)                    |
|  - events              | Realtime (proximity channel)         |
|  - participants        | Storage (photos)                     |
|  - beacons             | Edge Functions (push notifications)  |
|  - proximity_events    |                                      |
|  - encounters          |                                      |
+---------------------------------------------------------------+

CAPACITOR NATIVE LAYER (mobile only)
+---------------------------------------------------------------+
|  FeasyBeacon Plugin    | SQLite Plugin   | Push Plugin        |
|  - BLE scan loop       | - Offline queue | - FCM/APNs token   |
|  - iBeacon filter      | - Encounter log | - Local notif      |
|  - RSSI -> distance    |                 |                    |
+---------------------------------------------------------------+
```

---

## 3. Data Model

```
events
  id              UUID PK
  name            TEXT
  date_start      TIMESTAMPTZ
  date_end        TIMESTAMPTZ
  uuid_namespace  UUID          -- iBeacon UUID for this event
  created_by      UUID FK -> auth.users
  created_at      TIMESTAMPTZ

participants
  id              UUID PK
  email           TEXT UNIQUE
  name            TEXT
  company         TEXT
  role            TEXT          -- e.g. "Speaker", "Sponsor", "Attendee"
  photo_url       TEXT
  created_at      TIMESTAMPTZ

event_participants
  id              UUID PK
  event_id        UUID FK -> events
  participant_id  UUID FK -> participants
  access_code     TEXT UNIQUE   -- 6-char code for passwordless login
  checked_in      BOOLEAN
  checked_in_at   TIMESTAMPTZ
  beacon_id       UUID FK -> beacons (nullable)
  UNIQUE(event_id, participant_id)

beacons
  id              UUID PK
  major           INT           -- iBeacon major (event-scoped)
  minor           INT           -- iBeacon minor (participant-scoped)
  hardware_id     TEXT          -- physical beacon serial
  status          TEXT          -- available | assigned | retired
  event_id        UUID FK -> events (nullable, current assignment)

proximity_events
  id              UUID PK
  event_id        UUID FK -> events
  observer_id     UUID FK -> participants  -- who scanned
  observed_id     UUID FK -> participants  -- who was detected
  rssi            INT
  distance_m      FLOAT
  detected_at     TIMESTAMPTZ
  synced          BOOLEAN DEFAULT false

encounters (materialized from proximity_events)
  id              UUID PK
  event_id        UUID FK -> events
  participant_a   UUID FK -> participants
  participant_b   UUID FK -> participants
  first_seen      TIMESTAMPTZ
  last_seen       TIMESTAMPTZ
  total_duration  INTERVAL
  avg_distance_m  FLOAT
```

---

## 4. BLE Beacon Mapping (ADR-001)

**Decision**: Use standard iBeacon format with event-scoped addressing.

```
iBeacon Frame:
  UUID  = event.uuid_namespace    (one per event, filters out other events)
  Major = beacons.major           (group, e.g. zone or batch -- set to 1 for MVP)
  Minor = beacons.minor           (unique per beacon, maps to participant)

Lookup flow:
  Phone scans -> filters by event UUID -> reads Minor ->
  SELECT p.* FROM participants p
  JOIN event_participants ep ON ep.participant_id = p.id
  JOIN beacons b ON b.id = ep.beacon_id
  WHERE b.minor = {scanned_minor} AND b.event_id = {current_event_id}
```

RSSI to distance: `distance = 10 ^ ((txPower - RSSI) / (10 * n))` where n=2 (free space). Filter threshold: distance_m <= 5.0.

---

## 5. Offline Sync Strategy (ADR-002)

```
ONLINE:  BLE scan -> resolve participant -> POST /api/proximity -> Supabase
OFFLINE: BLE scan -> store in local SQLite (observer, minor, rssi, timestamp)

Sync trigger: network restored OR app foregrounded
Sync flow:
  1. Read all unsynced rows from SQLite
  2. Batch POST to /api/sync (up to 500 rows)
  3. Server resolves minor -> participant, inserts proximity_events
  4. Mark local rows as synced
  5. Server deduplicates via (observer_id, observed_id, detected_at) unique index

Conflict resolution: server wins (last-write-wins on encounters materialization)
```

---

## 6. Push Notification Flow (ADR-003)

```
1. App registers FCM/APNs token at login -> stored in Supabase (device_tokens table)
2. BLE scan detects new person nearby (not seen in last 5 min)
3. LOCAL notification fired immediately (no server round-trip for speed)
4. Proximity event sent to server
5. Server checks: did the OTHER person also detect me?
   - If yes: Supabase Edge Function sends push to BOTH via FCM/APNs
   - This ensures mutual notification even if one phone is in background
```

---

## 7. Auth Flow

```
Organizer/Staff: Supabase Auth email+password (standard)
Participant:     Passwordless code login
  1. Staff assigns access_code at check-in (e.g. "X7K2M9")
  2. Participant opens app -> enters code
  3. /api/auth/code validates against event_participants.access_code
  4. Server creates Supabase session (signInWithPassword on a generated account,
     or custom JWT via Edge Function)
  5. App receives JWT, stores in secure storage
  6. JWT claims include: participant_id, event_id
```

---

## 8. Security Considerations

| Threat | Mitigation |
|--------|-----------|
| Beacon spoofing (fake minor) | Server validates that beacon is assigned to active participant in current event |
| Access code brute force | Rate limit: 5 attempts per IP per minute; codes are 6-char alphanumeric (2.1B combos) |
| Proximity data privacy | RLS: participants see only their own encounters; organizers see only their events |
| BLE tracking across events | UUID changes per event; beacons reassigned each event |
| Offline data on lost phone | SQLite encrypted via Capacitor secure storage plugin |
| Push token hijack | Tokens validated against authenticated user on registration |

**Row Level Security** policies:
- `participants`: read own profile; organizers read event participants
- `proximity_events`: insert own; read own or as organizer of event
- `encounters`: read where participant_a or participant_b = current user
- `events`: CRUD only for creator; read for assigned participants

---

## 9. Scalability Notes

- **Target**: events up to 5,000 participants (MVP), 50,000 (future)
- **Proximity events volume**: 5,000 people x scan every 5s x avg 10 nearby = 10K rows/sec peak
- **Mitigation**: batch inserts, partitioned proximity_events by event_id, aggregate into encounters via pg_cron job every 60s
- **Realtime**: Supabase Realtime channel per event, broadcast nearby changes (not row-level -- too noisy)
- **CDN**: static assets via Vercel Edge; photos via Supabase Storage CDN

---

## 10. Deployment Topology

```
Production:
  Vercel -----> Next.js (SSR + API routes + static)
  Supabase ---> PostgreSQL + Auth + Realtime + Storage + Edge Functions
  App Store --> Capacitor iOS build (Xcode)
  Play Store -> Capacitor Android build (Android Studio)

Environments:
  dev:     Vercel preview + Supabase project "nearu-dev"
  staging: Vercel preview + Supabase project "nearu-staging"
  prod:    Vercel production + Supabase project "nearu-prod"
```

---

## ADR Summary

| ID | Decision | Status |
|----|----------|--------|
| ADR-001 | iBeacon UUID=event, Minor=beacon->participant mapping | Proposed |
| ADR-002 | Offline-first with SQLite queue, batch sync, server dedup | Proposed |
| ADR-003 | Local-first push + server mutual notification via Edge Functions | Proposed |
