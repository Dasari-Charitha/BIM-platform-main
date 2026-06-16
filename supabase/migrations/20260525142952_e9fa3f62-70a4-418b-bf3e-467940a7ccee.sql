
-- Create the admin auth user (if not exists) and grant admin role
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'skillariondevelopment9@gmail.com';

  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_id,
      'authenticated',
      'authenticated',
      'skillariondevelopment9@gmail.com',
      crypt('skill@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Administrator","role":"admin"}'::jsonb,
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', 'skillariondevelopment9@gmail.com', 'email_verified', true),
      'email', admin_id::text, now(), now(), now()
    );
  END IF;

  INSERT INTO public.profiles (id, full_name, email)
  VALUES (admin_id, 'Administrator', 'skillariondevelopment9@gmail.com')
  ON CONFLICT (id) DO NOTHING;

  -- Remove any student role then add admin role
  DELETE FROM public.user_roles WHERE user_id = admin_id AND role = 'student';
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
