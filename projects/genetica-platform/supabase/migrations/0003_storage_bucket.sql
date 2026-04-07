-- GENTICA Platform — private storage bucket for project files
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;

-- SELECT: admin or owner of the project (project_id is the first folder segment)
drop policy if exists "project_files_select" on storage.objects;
create policy "project_files_select" on storage.objects for select
  using (
    bucket_id = 'project-files' and (
      public.is_admin() or exists (
        select 1 from public.projects p
        where p.owner_id = auth.uid()
          and p.id::text = (storage.foldername(name))[1]
      )
    )
  );

-- INSERT: admin or owner
drop policy if exists "project_files_insert" on storage.objects;
create policy "project_files_insert" on storage.objects for insert
  with check (
    bucket_id = 'project-files' and (
      public.is_admin() or exists (
        select 1 from public.projects p
        where p.owner_id = auth.uid()
          and p.id::text = (storage.foldername(name))[1]
      )
    )
  );

-- DELETE: admin or owner
drop policy if exists "project_files_delete" on storage.objects;
create policy "project_files_delete" on storage.objects for delete
  using (
    bucket_id = 'project-files' and (
      public.is_admin() or exists (
        select 1 from public.projects p
        where p.owner_id = auth.uid()
          and p.id::text = (storage.foldername(name))[1]
      )
    )
  );
