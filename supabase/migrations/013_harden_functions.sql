-- ============================================
-- Harden public functions: lock down new ones, pin search_path
-- ============================================
-- Checked against the LIVE database (2026-09-19) before writing.
--
-- 1. NEW FUNCTIONS STAY PRIVATE (event trigger)
--    Postgres grants EXECUTE on every new function to PUBLIC — anon
--    included — through a built-in default. 011/012 revoked it from every
--    existing function, but the next CREATE FUNCTION in `public` would be
--    callable with the browser-visible anon key again.
--
--    The obvious fix, ALTER DEFAULT PRIVILEGES ... REVOKE EXECUTE ON
--    FUNCTIONS FROM PUBLIC, cannot be limited to one schema (a per-schema
--    REVOKE only undoes a per-schema GRANT). Applied globally it would also
--    hit extensions: `postgres` owns pgcrypto/uuid-ossp (49 functions in
--    `extensions`), so a future CREATE EXTENSION would ship functions the
--    apps cannot call. Instead, an event trigger revokes PUBLIC and anon right
--    after any function is created in `public`. authenticated and
--    service_role keep EXECUTE through the schema's existing default
--    privileges (postgres: {authenticated, service_role} on `public`).
--
--    Consequence: CREATE OR REPLACE also fires it. To expose a function to
--    anon on purpose, GRANT EXECUTE ... TO anon after every create/replace.
--    normalize_brand_name is exempt (used by an expression index on brands).
--
-- 2. search_path PINNED ON EVERY public FUNCTION (advisor lint 0011)
--    17 functions ran with the caller's search_path; 10 of them SECURITY
--    DEFINER. The 10 live ones already schema-qualify everything they touch
--    (public.*, built-ins resolve from pg_catalog regardless), so
--    search_path = '' changes nothing for them. The other 7 are already
--    broken against the current schema (counters table gone; user_roles.role
--    column replaced by role_id) and are pinned for consistency only — see
--    the dead-code follow-up.

-- --------------------------------------------
-- 1. Event trigger
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.rhino_lock_down_new_functions()
RETURNS event_trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN
    SELECT object_identity
    FROM pg_catalog.pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE FUNCTION', 'CREATE PROCEDURE')
      AND schema_name = 'public'
      AND object_identity <> 'public.normalize_brand_name(text)'
  LOOP
    EXECUTE pg_catalog.format('REVOKE EXECUTE ON ROUTINE %s FROM PUBLIC, anon', obj.object_identity);
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.rhino_lock_down_new_functions() IS
  'Event trigger: revokes PUBLIC/anon EXECUTE on every function created in public. See migration 013.';

REVOKE ALL ON FUNCTION public.rhino_lock_down_new_functions() FROM PUBLIC, anon, authenticated;

DROP EVENT TRIGGER IF EXISTS rhino_lock_down_new_functions;
CREATE EVENT TRIGGER rhino_lock_down_new_functions
  ON ddl_command_end
  WHEN TAG IN ('CREATE FUNCTION', 'CREATE PROCEDURE')
  EXECUTE FUNCTION public.rhino_lock_down_new_functions();

-- --------------------------------------------
-- 2. Pin search_path
-- --------------------------------------------
-- Live, fully schema-qualified
ALTER FUNCTION public.assign_default_role()                               SET search_path = '';
ALTER FUNCTION public.create_catalog_entry()                              SET search_path = '';
ALTER FUNCTION public.touch_catalog_on_source_change()                    SET search_path = '';
ALTER FUNCTION public.normalize_brand_name(text)                          SET search_path = '';
ALTER FUNCTION public.prevent_source_managed_product_field_updates()      SET search_path = '';
ALTER FUNCTION public.set_product_brands(uuid, uuid, uuid[])              SET search_path = '';
ALTER FUNCTION public.set_updated_at()                                    SET search_path = '';
ALTER FUNCTION public.update_timestamp()                                  SET search_path = '';
ALTER FUNCTION public.update_updated_at_column()                          SET search_path = '';
ALTER FUNCTION public.update_updated_at()                                 SET search_path = '';

-- Already broken against the current schema (dead code, see follow-up)
ALTER FUNCTION public.get_current_rhino_number()                          SET search_path = '';
ALTER FUNCTION public.get_next_rhino_number()                             SET search_path = '';
ALTER FUNCTION public.reset_rhino_counter(integer)                        SET search_path = '';
ALTER FUNCTION public.get_user_role(uuid)                                 SET search_path = '';
ALTER FUNCTION public.is_admin()                                          SET search_path = '';
ALTER FUNCTION public.is_admin(uuid)                                      SET search_path = '';
ALTER FUNCTION public.user_has_role(uuid, character varying)              SET search_path = '';
