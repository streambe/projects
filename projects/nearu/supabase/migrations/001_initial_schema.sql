-- nearU initial schema

create table if not exists events (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  location        text,
  date_start      timestamptz not null,
  date_end        timestamptz not null,
  uuid_namespace  uuid not null default gen_random_uuid(),
  status          text not null default 'draft' check (status in ('draft','live','ended')),
  logo_url        text,
  created_by      uuid references auth.users,
  created_at      timestamptz not null default now()
);

create table if not exists participants (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  email           text,
  company         text,
  role            text,
  photo_url       text,
  created_at      timestamptz not null default now()
);

create table if not exists event_participants (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references events(id) on delete cascade,
  participant_id  uuid not null references participants(id) on delete cascade,
  access_code     text unique,
  checked_in      boolean not null default false,
  checked_in_at   timestamptz,
  beacon_id       uuid,
  unique(event_id, participant_id)
);

create table if not exists beacons (
  id              uuid primary key default gen_random_uuid(),
  major           int not null default 1,
  minor           int not null,
  hardware_id     text,
  status          text not null default 'available' check (status in ('available','assigned','retired')),
  event_id        uuid references events(id)
);

create table if not exists proximity_events (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references events(id) on delete cascade,
  observer_id     uuid not null references participants(id),
  observed_id     uuid not null references participants(id),
  rssi            int,
  distance_m      float,
  detected_at     timestamptz not null default now(),
  synced          boolean not null default false
);

create table if not exists encounters (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references events(id) on delete cascade,
  participant_a   uuid not null references participants(id),
  participant_b   uuid not null references participants(id),
  first_seen      timestamptz not null,
  last_seen       timestamptz not null,
  total_duration  interval,
  encounter_count int not null default 1
);

-- Indexes
create index if not exists idx_event_participants_event on event_participants(event_id);
create index if not exists idx_event_participants_participant on event_participants(participant_id);
create index if not exists idx_beacons_event on beacons(event_id);
create index if not exists idx_proximity_events_event on proximity_events(event_id);
create index if not exists idx_encounters_event on encounters(event_id);
