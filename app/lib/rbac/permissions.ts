import { UserRole, RolePermissions } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canToggleVerified: true,
    canViewAgregarTab: true,
    canViewBDCodigosTab: true,
    canManageUsers: true,
    canViewAuditLogs: true,
  },
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
  editor: {
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: false,
    canToggleVerified: false,
    canViewAgregarTab: true,
    canViewBDCodigosTab: true,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
  quality_assurance: {
    canCreateProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canToggleVerified: true,
    canViewAgregarTab: false,
    canViewBDCodigosTab: true,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
  approver: {
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
