export type UserRole = 'super_admin' | 'admin' | 'editor' | 'quality_assurance' | 'approver' | 'viewer';

export interface RolePermissions {
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canToggleVerified: boolean;
  canViewAgregarTab: boolean;
  canViewBDCodigosTab: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
}

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  assigned_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: 'create' | 'update' | 'delete' | 'toggle_verified';
  resource_type: string;
  resource_id: string | null;
  old_data: any;
  new_data: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
