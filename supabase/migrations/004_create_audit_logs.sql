-- ============================================
-- RBAC: Audit Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'toggle_verified')),
  resource_type VARCHAR(50) NOT NULL DEFAULT 'product',
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Comments
COMMENT ON TABLE audit_logs IS 'Tracks all user actions for audit trail';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed: create, update, delete, toggle_verified';
COMMENT ON COLUMN audit_logs.old_data IS 'Data before the change (for updates/deletes)';
COMMENT ON COLUMN audit_logs.new_data IS 'Data after the change (for creates/updates)';

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policy: System can insert audit logs (via triggers/functions)
CREATE POLICY "System can insert audit logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
