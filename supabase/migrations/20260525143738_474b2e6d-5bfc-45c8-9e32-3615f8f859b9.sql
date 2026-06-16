GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role public.app_role;
BEGIN
  requested_role := COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'role', '')::public.app_role, 'student');

  INSERT INTO public.profiles (id, full_name, email, date_of_birth, college_name, contact)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, ''),
    NULLIF(NEW.raw_user_meta_data ->> 'date_of_birth', '')::DATE,
    NULLIF(NEW.raw_user_meta_data ->> 'college_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'contact', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    email = COALESCE(NULLIF(EXCLUDED.email, ''), public.profiles.email),
    date_of_birth = COALESCE(EXCLUDED.date_of_birth, public.profiles.date_of_birth),
    college_name = COALESCE(NULLIF(EXCLUDED.college_name, ''), public.profiles.college_name),
    contact = COALESCE(NULLIF(EXCLUDED.contact, ''), public.profiles.contact),
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, requested_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, full_name, email, date_of_birth, college_name, contact)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  COALESCE(u.email, ''),
  NULLIF(u.raw_user_meta_data ->> 'date_of_birth', '')::DATE,
  NULLIF(u.raw_user_meta_data ->> 'college_name', ''),
  NULLIF(u.raw_user_meta_data ->> 'contact', '')
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
  email = COALESCE(NULLIF(EXCLUDED.email, ''), public.profiles.email),
  date_of_birth = COALESCE(EXCLUDED.date_of_birth, public.profiles.date_of_birth),
  college_name = COALESCE(NULLIF(EXCLUDED.college_name, ''), public.profiles.college_name),
  contact = COALESCE(NULLIF(EXCLUDED.contact, ''), public.profiles.contact),
  updated_at = now();

INSERT INTO public.user_roles (user_id, role)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data ->> 'role', '')::public.app_role, 'student')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id
)
ON CONFLICT (user_id, role) DO NOTHING;