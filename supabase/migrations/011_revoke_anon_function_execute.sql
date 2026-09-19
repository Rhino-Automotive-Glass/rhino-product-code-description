-- ============================================
-- Close anon EXECUTE on public SECURITY DEFINER functions
-- ============================================
-- Applied to production 2026-09-18 (BEGIN/COMMIT omitted there — the Supabase
-- migration runner supplies the transaction). ONLY PARTIALLY EFFECTIVE on its
-- own: 11 functions stayed anon-callable through the PUBLIC grant. See 012.
--
-- The RLS advisor did not flag this, but it is the same class of hole and RLS
-- does not cover it: a SECURITY DEFINER function runs as its owner and bypasses
-- every policy added in 010. Anyone with the project URL and the browser-visible
-- anon key can POST to /rest/v1/rpc/<name>.
--
-- WHY THE EXISTING LOCKDOWN DID NOT HOLD
-- rhino-access/supabase/migrations/004 and 006 end with:
--     REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC;
--     GRANT  EXECUTE ON FUNCTION ... TO authenticated, service_role;
-- That is correct on stock Postgres, where new functions are only reachable via
-- the implicit grant to PUBLIC. It is not enough on Supabase: the project's
-- default privileges grant EXECUTE on new functions in `public` DIRECTLY to
-- anon. Revoking from PUBLIC leaves that direct grant untouched, so anon kept
-- EXECUTE on all 23 SECURITY DEFINER functions.
--
-- MEASURED AGAINST THE LIVE PROJECT, anon key only, read-only calls:
--   user_hierarchy_level(<real user id>)  -> 100        LEAK: privilege level of
--                                                       any user, unauthenticated.
--                                                       100 = super_admin, so the
--                                                       owner account is findable.
--   get_user_permissions / get_my_permissions / search_audit_logs /
--   get_app_access_counts                 -> 42501 "Authentication required"
--                                                       body checks from 004/006
--                                                       hold. Not exploitable.
--   current_user_hierarchy_level()        -> 0          harmless
--   normalize_brand_name('Ford ')         -> "ford"     pure, harmless
--   get_current_rhino_number / is_admin /
--   get_user_role                         -> 42P01 / 42703  broken against the
--                                                       current schema (see note)
--
-- Not called during the audit because they mutate: get_next_rhino_number,
-- reset_rhino_counter, log_audit_event, replace_user_permission_overrides,
-- set_product_brands. replace_user_permission_overrides does check
-- `access.manage_permissions` in its body; the others were not verified, which
-- is exactly why the grant should not be there.
--
-- No caller loses anything. Every RPC call in every repo runs with a user
-- session (authenticated): rhino-access uses get_my_permissions,
-- log_audit_event, replace_user_permission_overrides, search_audit_logs,
-- user_has_permission; this app uses the rhino counter functions. Neither
-- rhino-catalog nor rhino-landing-catalog calls any RPC at all.

BEGIN;

-- --------------------------------------------
-- 1. Revoke anon EXECUTE across public
-- --------------------------------------------
-- Skips trigger functions (not callable over the API, and needlessly touching
-- them risks the catalog-sync triggers) and normalize_brand_name, which is a
-- pure text helper used inside expression indexes on brands.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prorettype <> 'pg_catalog.trigger'::regtype
      AND p.proname <> 'normalize_brand_name'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn.signature);
  END LOOP;
END $$;

-- --------------------------------------------
-- 2. Stop the bleeding for functions created later
-- --------------------------------------------
-- Without this, the next CREATE FUNCTION in `public` is handed to anon again by
-- the project's default privileges. Applies to functions created by the role
-- running this statement — run it as `postgres` (the Supabase SQL editor does).
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;

COMMIT;

-- ============================================
-- Follow-up, NOT applied here
-- ============================================
-- Three functions are dead against the current schema. `counters` no longer
-- exists in the database at all, so get_current_rhino_number(),
-- get_next_rhino_number() and reset_rhino_counter() all fail with
-- 42P01 "relation counters does not exist" — which also means this app's
-- /api/counters/rhino-next and /api/counters/rhino-preview routes are broken
-- independently of anything here. is_admin() and get_user_role() fail with
-- 42703 "column role does not exist": they still read the pre-RBAC
-- user_roles.role column that migration 003 created and the live schema
-- replaced with role_id.
--
-- Decide whether the Rhino auto-number feature is still wanted before dropping
-- anything. Once decided:
--   DROP FUNCTION IF EXISTS public.get_current_rhino_number();
--   DROP FUNCTION IF EXISTS public.get_next_rhino_number();
--   DROP FUNCTION IF EXISTS public.reset_rhino_counter(integer);
--   DROP FUNCTION IF EXISTS public.get_user_role(uuid);
--   DROP FUNCTION IF EXISTS public.is_admin(uuid);
-- get_user_role and is_admin are superseded by rhino_current_role() (010) and
-- user_has_permission(). Check for a second is_admin overload first — the audit
-- listed the name twice.
