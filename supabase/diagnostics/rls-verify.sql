-- ============================================
-- VERIFY — run after 010_enable_rls_public_tables.sql
-- ============================================

-- 1. All eight tables must now report rls_enabled = true.
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('products', 'product_codes', 'brands', 'product_brands',
                    'product_groups', 'product_group_products',
                    'product_stock', 'tasks')
ORDER BY c.relname;

-- 2. Every policy on these tables. Expect: public/anon SELECT on the catalog
--    tables only; product_groups / product_group_products still filtered to
--    status = 'published'; product_stock and tasks a single ALL policy for
--    authenticated.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('products', 'product_codes', 'brands', 'product_brands',
                    'product_groups', 'product_group_products',
                    'product_stock', 'tasks')
ORDER BY tablename, cmd, policyname;

-- 3. No policy may let anon write. Expected: zero rows.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('products', 'product_codes', 'brands', 'product_brands',
                    'product_groups', 'product_group_products',
                    'product_stock', 'tasks')
  AND cmd <> 'SELECT'
  AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[]);

-- 4. anon must hold no privileges on the two private tables.
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee = 'anon'
  AND table_name IN ('product_stock', 'tasks');
-- Expected: zero rows.

-- ============================================
-- After 011_revoke_anon_function_execute.sql
-- ============================================

-- 5. No function in `public` should be anon-executable except
--    normalize_brand_name and trigger functions.
SELECT p.proname AS function_name,
       has_function_privilege('anon',          p.oid, 'EXECUTE') AS anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef
ORDER BY anon_can_execute DESC, p.proname;
-- Expected: anon_can_execute false everywhere,
--           authenticated_can_execute true everywhere.
