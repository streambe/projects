-- Sprint 4: cola FIFO con notificaciones
alter table public.project_queue
  add column if not exists notified_at timestamptz,
  add column if not exists expires_at timestamptz;

create index if not exists idx_queue_project_position
  on public.project_queue(project_id, position);
create index if not exists idx_queue_user
  on public.project_queue(user_id);
create index if not exists idx_queue_notified
  on public.project_queue(notified_at)
  where notified_at is not null;
