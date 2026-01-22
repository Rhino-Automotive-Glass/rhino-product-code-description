-- ============================================
-- RBAC: Helper Functions
-- ============================================

-- Function: Get user role
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  user_role VARCHAR(20);
BEGIN
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = p_user_id;

  RETURN COALESCE(user_role, 'viewer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_role(UUID) IS 'Returns the role of a specific user';

-- Function: Check if user has role
CREATE OR REPLACE FUNCTION user_has_role(p_user_id UUID, p_role VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_user_id AND role = p_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_has_role(UUID, VARCHAR) IS 'Checks if user has a specific role';

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_has_role(p_user_id, 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_role(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
