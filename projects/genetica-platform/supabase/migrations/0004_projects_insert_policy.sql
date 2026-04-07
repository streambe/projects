-- Allow any authenticated active user to create projects
drop policy if exists projects_insert_admin on public.projects;
drop policy if exists projects_insert_authenticated on public.projects;

create policy projects_insert_authenticated on public.projects
  for insert with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.is_active
    )
  );
