
-- Roles enum + table
create type public.app_role as enum ('admin', 'student');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  date_of_birth date,
  college_name text,
  contact text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users view own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users view own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins view all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Progress table
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  score numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "Students view own progress" on public.progress
  for select to authenticated using (auth.uid() = student_id);
create policy "Admins view all progress" on public.progress
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins insert progress" on public.progress
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update progress" on public.progress
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete progress" on public.progress
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Auto create profile + student role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, date_of_birth, college_name, contact)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'date_of_birth','')::date,
    new.raw_user_meta_data->>'college_name',
    new.raw_user_meta_data->>'contact'
  );
  insert into public.user_roles (user_id, role)
  values (new.id, coalesce((new.raw_user_meta_data->>'role')::app_role, 'student'));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
