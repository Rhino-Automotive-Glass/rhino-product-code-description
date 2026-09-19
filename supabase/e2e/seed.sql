-- e2e seed — loaded after schema.sql into the LOCAL test Supabase only.
--
-- Creates the one user the Playwright tests sign in as. The password below is
-- not a secret: it only exists in a throwaway database on localhost / the CI
-- runner. Keep it in sync with tests/auth.setup.ts.

DO $$
DECLARE
  test_user_id uuid := '00000000-0000-4000-8000-00000000e2e0';
  test_email   text := 'e2e-editor@example.test';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', test_user_id, 'authenticated', 'authenticated',
    test_email, extensions.crypt('e2e-local-password', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(),
    '', '', '', ''
  );

  -- GoTrue signs email users in through their identity row.
  INSERT INTO auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), test_user_id, test_user_id::text, 'email',
    jsonb_build_object('sub', test_user_id::text, 'email', test_email, 'email_verified', true),
    now(), now(), now()
  );

  -- editor (hierarchy 60): can create and edit product codes, cannot delete.
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT test_user_id, r.id FROM public.roles r WHERE r.name = 'editor';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'e2e seed: role "editor" missing — regenerate schema.sql';
  END IF;

  -- A second user (viewer, cannot sign in) so user_roles holds other people's
  -- rows, as in production. RLS bugs that only fire on rows the caller cannot
  -- see stay hidden with a single user (see tests/save-to-database.spec.ts).
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-00000000e2e1',
    'authenticated', 'authenticated', 'e2e-viewer@example.test', '',
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '', '', ''
  );

  INSERT INTO public.user_roles (user_id, role_id)
  SELECT '00000000-0000-4000-8000-00000000e2e1', r.id FROM public.roles r WHERE r.name = 'viewer';

  -- A signed-up account an admin has not approved yet: can sign in, has NO
  -- role (migration 018). Same local-only password as the editor.
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-00000000e2e2',
    'authenticated', 'authenticated', 'e2e-pending@example.test',
    extensions.crypt('e2e-local-password', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), '00000000-0000-4000-8000-00000000e2e2', '00000000-0000-4000-8000-00000000e2e2', 'email',
    jsonb_build_object('sub', '00000000-0000-4000-8000-00000000e2e2', 'email', 'e2e-pending@example.test', 'email_verified', true),
    now(), now(), now()
  );
END $$;
