-- Attach trigger so new signups auto-create profile + role
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill any existing users missing profile/role rows
insert into public.profiles (id, full_name, email, date_of_birth, college_name, contact)
select u.id,
       coalesce(u.raw_user_meta_data->>'full_name',''),
       u.email,
       nullif(u.raw_user_meta_data->>'date_of_birth','')::date,
       u.raw_user_meta_data->>'college_name',
       u.raw_user_meta_data->>'contact'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

insert into public.user_roles (user_id, role)
select u.id, coalesce((u.raw_user_meta_data->>'role')::public.app_role,'student')
from auth.users u
left join public.user_roles r on r.user_id = u.id
where r.user_id is null;