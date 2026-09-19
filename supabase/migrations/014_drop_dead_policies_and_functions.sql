-- ============================================
-- Drop dead and duplicate RLS policies, then the broken functions they used
-- ============================================
-- Checked against the LIVE database (2026-09-19) before writing.
--
-- Postgres ORs permissive policies together, so every leftover policy is
-- still evaluated. Two kinds are removed here:
--
-- BROKEN — user_roles "Admins can read/update/delete roles" call is_admin(),
--   which reads the pre-RBAC user_roles.role column (replaced by role_id). Any
--   non-admin query that reaches another user's row evaluates it and the
--   whole statement fails (reproduced locally: an editor's unfiltered SELECT
--   on user_roles errors; filtering to their own row works, which is why the
--   apps have not hit it). The hierarchy-based "Admins can view/update/delete
--   user_roles" policies already cover the intended admin access.
--
-- DEAD / DUPLICATE —
--   product_codes_select/insert/update/delete check a JWT app_metadata role
--     'product_admin' that no user has (0 of 17) and no app sets.
--   product_codes "All authenticated users can read products" duplicates the
--     public "Allow public read access" (TO public includes authenticated).
--   product_codes "Only admins can create products" (level >= 80) is a subset
--     of "Editors can create product codes" (level >= 60, migration 010).
--   user_roles "Users can read own role" and "Users can view their own role"
--     duplicate "Users can view own role" (same auth.uid() = user_id check;
--     for anon auth.uid() is NULL so the TO public variant matched nothing).
--
-- Access is unchanged for every role; only the failing branch is removed.
--
-- Then the functions no policy, function or app uses any more are dropped:
--   is_admin(), is_admin(uuid), user_has_role(uuid, varchar) — old role column
--   get_user_role(uuid)                                      — old role column
-- (Searched: pg_policies, function bodies, views, and every rhino-* repo.)

-- --------------------------------------------
-- 1. user_roles
-- --------------------------------------------
DROP POLICY IF EXISTS "Admins can read all roles"    ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles"      ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles"      ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role"      ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- --------------------------------------------
-- 2. product_codes
-- --------------------------------------------
DROP POLICY IF EXISTS "product_codes_select" ON public.product_codes;
DROP POLICY IF EXISTS "product_codes_insert" ON public.product_codes;
DROP POLICY IF EXISTS "product_codes_update" ON public.product_codes;
DROP POLICY IF EXISTS "product_codes_delete" ON public.product_codes;
DROP POLICY IF EXISTS "All authenticated users can read products" ON public.product_codes;
DROP POLICY IF EXISTS "Only admins can create products"           ON public.product_codes;

-- --------------------------------------------
-- 3. Broken functions (no remaining dependents)
-- --------------------------------------------
-- No CASCADE on purpose: if anything still depends on them, fail loudly.
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.user_has_role(uuid, character varying);
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
