-- GENTICA Platform — initial schema
-- Source: docs/technical-architecture.md sections 3 + 7

-- =========================
-- USERS (extiende auth.users)
-- =========================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('admin','ingeniero_ia')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_users_role on public.users(role);

-- =========================
-- PROJECTS
-- =========================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null check (status in ('available','owned','queued','archived','blocked')) default 'available',
  owner_id uuid references public.users(id) on delete set null,
  owned_at timestamptz,
  last_interaction_at timestamptz,
  claude_model text not null default 'claude-sonnet-4-6'
    check (claude_model in ('claude-opus-4-6','claude-sonnet-4-6','claude-haiku-4-6','claude-haiku-4-5')),
  cost_usd numeric(10,4) not null default 0,
  cost_cap_usd numeric(10,4) not null default 50,
  is_cost_blocked boolean not null default false,
  cost_override_approved_at timestamptz,
  context_summary text,
  summary_updated_at timestamptz,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_projects_owner on public.projects(owner_id);
create index idx_projects_status on public.projects(status);
create index idx_projects_last_interaction on public.projects(last_interaction_at);

-- =========================
-- PROJECT FILES
-- =========================
create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.users(id),
  storage_path text not null,
  filename text not null,
  mime_type text,
  size_bytes bigint,
  extracted_text text,
  created_at timestamptz not null default now()
);
create index idx_files_project on public.project_files(project_id);

-- =========================
-- PROJECT MESSAGES
-- =========================
create table public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_user_id uuid references public.users(id),
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  content_sanitized text,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  model text,
  created_at timestamptz not null default now()
);
create index idx_messages_project_created on public.project_messages(project_id, created_at);

-- =========================
-- PROJECT COSTS (ledger append-only)
-- =========================
create table public.project_costs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  message_id uuid references public.project_messages(id) on delete set null,
  input_tokens int not null,
  output_tokens int not null,
  cost_usd numeric(10,6) not null,
  model text not null,
  created_at timestamptz not null default now()
);
create index idx_costs_project on public.project_costs(project_id, created_at);

-- =========================
-- PROJECT QUEUE (FIFO cuando >20 activos)
-- =========================
create table public.project_queue (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  position int not null,
  enqueued_at timestamptz not null default now(),
  unique(project_id, user_id)
);
create index idx_queue_position on public.project_queue(position);

-- =========================
-- OWNERSHIP HISTORY (audit trail)
-- =========================
create table public.ownership_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.users(id),
  action text not null check (action in ('claimed','released','auto_released','transferred')),
  reason text,
  created_at timestamptz not null default now()
);
create index idx_history_project on public.ownership_history(project_id, created_at);

-- =========================
-- TRIGGERS
-- =========================
create or replace function public.touch_last_interaction() returns trigger as $$
begin
  update public.projects
    set last_interaction_at = now(), updated_at = now()
    where id = new.project_id;
  return new;
end; $$ language plpgsql;

create trigger trg_messages_touch
  after insert on public.project_messages
  for each row execute function public.touch_last_interaction();

create or replace function public.accumulate_cost() returns trigger as $$
declare v_total numeric(10,4);
declare v_cap numeric(10,4);
begin
  update public.projects
    set cost_usd = cost_usd + new.cost_usd
    where id = new.project_id
    returning cost_usd, cost_cap_usd into v_total, v_cap;
  if v_total >= v_cap then
    update public.projects set is_cost_blocked = true where id = new.project_id;
  end if;
  return new;
end; $$ language plpgsql;

create trigger trg_costs_accumulate
  after insert on public.project_costs
  for each row execute function public.accumulate_cost();
