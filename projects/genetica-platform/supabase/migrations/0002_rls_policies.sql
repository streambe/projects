-- GENTICA Platform — RLS policies
-- Source: docs/technical-architecture.md section 4

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.project_messages enable row level security;
alter table public.project_costs enable row level security;
alter table public.project_queue enable row level security;
alter table public.ownership_history enable row level security;

-- helper
create or replace function public.is_admin() returns boolean
  language sql stable as $$
  select exists(select 1 from public.users where id = auth.uid() and role = 'admin' and is_active);
$$;

-- USERS
create policy users_self_select on public.users
  for select using (auth.uid() = id or public.is_admin());
create policy users_admin_write on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- PROJECTS
create policy projects_select on public.projects
  for select using (true);
create policy projects_update_owner on public.projects
  for update using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy projects_insert_admin on public.projects
  for insert with check (public.is_admin());
create policy projects_delete_admin on public.projects
  for delete using (public.is_admin());

-- PROJECT FILES
create policy files_rw_owner on public.project_files
  for all using (
    public.is_admin() or
    exists(select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  ) with check (
    public.is_admin() or
    exists(select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );

-- PROJECT MESSAGES
create policy messages_select_owner on public.project_messages
  for select using (
    public.is_admin() or
    exists(select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );
create policy messages_insert_owner on public.project_messages
  for insert with check (
    exists(select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );

-- COSTS
create policy costs_select_owner on public.project_costs
  for select using (
    public.is_admin() or
    exists(select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );

-- QUEUE
create policy queue_select_self on public.project_queue
  for select using (user_id = auth.uid() or public.is_admin());
create policy queue_rw_self on public.project_queue
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- HISTORY
create policy history_select on public.ownership_history
  for select using (
    public.is_admin() or
    exists(select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );
