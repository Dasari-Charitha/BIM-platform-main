-- Allow admins to read all student profile details in the admin dashboard.
drop policy if exists "Admins view all profiles" on public.profiles;

create policy "Admins view all profiles" on public.profiles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Enable realtime refreshes for the admin student list when available.
do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.user_roles;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
