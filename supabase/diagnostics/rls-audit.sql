-- ============================================
-- DIAGNOSTIC ONLY — read-only, changes nothing.
-- Run this first in the Supabase SQL editor and share the output.
-- ============================================

-- 1. RLS state of every table in the exposed `public` schema.
--    rls_enabled = false is the `rls_disabled_in_public` advisor finding.
SELECT c.relname                        AS table_name,
       c.relrowsecurity                 AS rls_enabled,
       c.relforcerowsecurity            AS rls_forced,
       (SELECT count(*) FROM pg_policies p
         WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relrowsecurity, c.relname;

-- 2. Every existing policy, so nothing already in place gets clobbered.
SELECT tablename, policyname, cmd, roles, qual AS using_expr, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. What the public API roles are actually granted, table by table.
--    A table with RLS off AND an anon grant is world-readable/writable.
SELECT table_name,
       grantee,
       string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- 4. SECURITY DEFINER functions in `public` that anon can execute.
--    These bypass RLS entirely and are callable straight from the project URL.
SELECT p.proname AS function_name,
       p.prosecdef AS security_definer,
       has_function_privilege('anon',           p.oid, 'EXECUTE') AS anon_can_execute,
       has_function_privilege('authenticated',  p.oid, 'EXECUTE') AS authenticated_can_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef
ORDER BY anon_can_execute DESC, p.proname;

-- 5. Views: these bypass RLS unless created WITH (security_invoker = true).
SELECT c.relname AS view_name,
       c.reloptions
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('v', 'm')
ORDER BY c.relname;
