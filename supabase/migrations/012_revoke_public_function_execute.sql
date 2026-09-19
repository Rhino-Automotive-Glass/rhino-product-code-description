-- ============================================
-- Finish closing anon EXECUTE: revoke the PUBLIC grant too
-- ============================================
-- Applied to production 2026-09-18, immediately after 011.
--
-- 011 revoked EXECUTE from `anon` directly. Verifying afterwards with
-- has_function_privilege() showed 11 functions still anon-callable, among them
-- user_hierarchy_level (the privilege-level leak) and reset_rhino_counter.
-- Those functions still carried Postgres' implicit EXECUTE grant to PUBLIC,
-- which every role — anon included — inherits. The 6 functions 011 did fix had
-- already had PUBLIC revoked by rhino-access migrations 004/006.
--
-- Grant authenticated and service_role explicitly FIRST so that removing the
-- PUBLIC grant cannot take access away from signed-in users (RLS policies on
-- product_codes call current_user_hierarchy_level()) or from server code.
--
-- Same exclusions as 011: trigger functions (cannot be called outside a
-- trigger) and normalize_brand_name (pure helper used by an expression index
-- on brands). Extension-owned functions are skipped too; none exist in
-- `public` today, but an extension's own grants should not be rewritten here.

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
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', fn.signature);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', fn.signature);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn.signature);
  END LOOP;
END $$;

-- Verified after applying:
--   anon EXECUTE             only normalize_brand_name remains
--   authenticated, service_role  EXECUTE on every non-trigger function
--   anon reading the catalog     unchanged (products 1695, product_codes 1727)
--   anon calling user_hierarchy_level  42501 permission denied
--   admin session: current_user_hierarchy_level() = 80, product_codes readable
--
-- Known gap, NOT fixed here: new functions created later still receive the
-- implicit PUBLIC grant. Closing that needs
--   ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
-- which applies to every schema postgres creates functions in (including future
-- extensions), so it needs its own review. Until then, end every new function
-- migration with: REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC, anon;
