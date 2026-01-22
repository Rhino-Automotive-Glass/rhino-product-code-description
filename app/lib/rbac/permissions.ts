import { UserRole, RolePermissions } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canToggleVerified: true,
    canViewAgregarTab: true,
    canViewBDCodigosTab: true,
    canManageUsers: true,
    canViewAuditLogs: true,
  },
  qa: {
    canCreateProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canToggleVerified: true,
    canViewAgregarTab: false,
    canViewBDCodigosTab: true,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
  viewer: {
    canCreateProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canToggleVerified: false,
    canViewAgregarTab: false,
    canViewBDCodigosTab: true,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
};

export function getPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function canPerformAction(
  role: UserRole,
  action: keyof RolePermissions
): boolean {
  return ROLE_PERMISSIONS[role][action];
}
