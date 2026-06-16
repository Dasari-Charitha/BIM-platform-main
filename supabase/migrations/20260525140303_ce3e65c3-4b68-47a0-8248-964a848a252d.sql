-- Attach trigger to auth.users so handle_new_user runs on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for any existing users without one
INSERT INTO public.profiles (id, full_name, email, date_of_birth, college_name, contact)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  COALESCE(u.email, ''),
  NULLIF(u.raw_user_meta_data ->> 'date_of_birth', '')::DATE,
  u.raw_user_meta_data ->> 'college_name',
  u.raw_user_meta_data ->> 'contact'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Backfill student role for any existing users without a role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, COALESCE((u.raw_user_meta_data ->> 'role')::public.app_role, 'student')
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;
