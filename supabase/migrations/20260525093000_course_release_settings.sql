create table if not exists public.course_settings (
  id text primary key,
  released_at timestamptz,
  released_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.course_settings enable row level security;

drop policy if exists "Authenticated users view course settings" on public.course_settings;
create policy "Authenticated users view course settings" on public.course_settings
  for select to authenticated using (true);

drop policy if exists "Admins insert course settings" on public.course_settings;
create policy "Admins insert course settings" on public.course_settings
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins update course settings" on public.course_settings;
create policy "Admins update course settings" on public.course_settings
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.course_settings (id)
values ('bim_course')
on conflict (id) do nothing;
