-- Device tokens for push notifications
create table if not exists device_tokens (
  id              uuid primary key default gen_random_uuid(),
  participant_id  uuid not null references participants(id) on delete cascade,
  platform        text not null check (platform in ('ios','android','web')),
  token           text not null,
  created_at      timestamptz not null default now(),
  unique(participant_id, token)
);

create index if not exists idx_device_tokens_participant on device_tokens(participant_id);

-- Notifications log (for server-side push tracking)
create table if not exists notifications (
  id              uuid primary key default gen_random_uuid(),
  participant_id  uuid not null references participants(id) on delete cascade,
  title           text not null,
  body            text not null,
  data            jsonb,
  sent_at         timestamptz not null default now(),
  delivered       boolean not null default false
);

create index if not exists idx_notifications_participant on notifications(participant_id);
