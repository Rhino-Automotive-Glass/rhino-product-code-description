-- ============================================
-- No role, no access — prerequisite for opening self-signup
-- ============================================
-- Checked against the LIVE database (2026-09-19) before writing.
--
-- Self-signup is about to be enabled (Supabase Auth "Allow new users to sign
-- up"; the setting covers every rhino app on this project). Two things made
-- that unsafe:
--
-- 1. Rules that only asked "is this a signed-in user?":
--      product_stock  "Authenticated users can access stock"  FOR ALL  true
--      tasks          "Authenticated users can access tasks"  FOR ALL  true
--      origin_sheets  "Authenticated users can view all origin sheets" SELECT true
--    Any account — including one registered by a stranger — could read and
--    write stock and tasks, and read every origin sheet.
--    This already mattered: in rhino-access, removing someone's access means
--    deleting their user_roles row, and 6 of 17 accounts have no role (the
--    audit log shows the removals), yet those rules still let them in.
--
-- 2. Trigger on_auth_user_created gave every new account the `viewer` role,
--    so a self-registered stranger would be indistinguishable from an
--    employee.
--
-- Now:
--   - Any assigned role (hierarchy level >= 10, i.e. viewer and above) is
--     required for those three rules. Employees keep exactly what they had.
--   - New accounts start with NO role ("pending") until an admin assigns one
--     in rhino-access. Invitations are unaffected: rhino-access's invite
--     route assigns the chosen role itself right after creating the user.
--   - assign_default_viewer_role() (unused; writes the long-gone
--     user_roles.role column) is dropped along with assign_default_role().
--
-- Only these tables change. Catalog data stays public; roles, permissions
-- and connected_apps stay readable by signed-in users (reference data).

-- --------------------------------------------
-- 1. New accounts start without a role
-- --------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.assign_default_role();
DROP FUNCTION IF EXISTS public.assign_default_viewer_role();

-- --------------------------------------------
-- 2. "Signed in" is no longer enough
-- --------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can access stock" ON public.product_stock;
CREATE POLICY "Users with a role can access stock"
  ON public.product_stock
  FOR ALL
  TO authenticated
  USING ((SELECT public.current_user_hierarchy_level()) >= 10)
  WITH CHECK ((SELECT public.current_user_hierarchy_level()) >= 10);

DROP POLICY IF EXISTS "Authenticated users can access tasks" ON public.tasks;
CREATE POLICY "Users with a role can access tasks"
  ON public.tasks
  FOR ALL
  TO authenticated
  USING ((SELECT public.current_user_hierarchy_level()) >= 10)
  WITH CHECK ((SELECT public.current_user_hierarchy_level()) >= 10);

DROP POLICY IF EXISTS "Authenticated users can view all origin sheets" ON public.origin_sheets;
CREATE POLICY "Users with a role can view all origin sheets"
  ON public.origin_sheets
  FOR SELECT
  TO authenticated
  USING ((SELECT public.current_user_hierarchy_level()) >= 10);
