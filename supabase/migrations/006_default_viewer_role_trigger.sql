-- ============================================
-- RBAC: Auto-assign Viewer role to new users
-- ============================================

-- Function to assign viewer role to new users
CREATE OR REPLACE FUNCTION assign_default_viewer_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'viewer')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_viewer_role();

COMMENT ON FUNCTION assign_default_viewer_role() IS 'Automatically assigns viewer role to newly registered users';
