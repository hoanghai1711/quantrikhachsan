import { Role } from '../types/auth';

export const Permissions = {
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  VIEW_ROOMS: 'VIEW_ROOMS',
  CLEAN_ROOMS: 'CLEAN_ROOMS',
  CHECK_IN: 'CHECK_IN',
  MANAGE_POS: 'MANAGE_POS',
  VIEW_BOOKINGS: 'VIEW_BOOKINGS',
  VIEW_REPORTS: 'VIEW_REPORTS',
  MANAGE_VOUCHERS: 'MANAGE_VOUCHERS',
  REVIEW_MODERATION: 'REVIEW_MODERATION',
  MANAGE_ROOM_TYPES: 'MANAGE_ROOM_TYPES',
  MANAGE_SERVICES: 'MANAGE_SERVICES',
  MANAGE_SUPPLIES: 'MANAGE_SUPPLIES',
  VIEW_AUDIT_LOG: 'VIEW_AUDIT_LOG',
  MANAGE_STAFF: 'MANAGE_STAFF',
  MANAGE_ROLES: 'MANAGE_ROLES',
} as const;

export const rolePermissions: Record<Role, string[]> = {
  [Role.ADMIN]: Object.values(Permissions),
  [Role.MANAGER]: [
    Permissions.VIEW_DASHBOARD,
    Permissions.VIEW_ROOMS,
    Permissions.CHECK_IN,
    Permissions.MANAGE_POS,
    Permissions.VIEW_BOOKINGS,
    Permissions.VIEW_REPORTS,
    Permissions.MANAGE_VOUCHERS,
    Permissions.REVIEW_MODERATION,
    Permissions.MANAGE_ROOM_TYPES,
    Permissions.MANAGE_SERVICES,
    Permissions.MANAGE_SUPPLIES,
    Permissions.VIEW_AUDIT_LOG,
  ],
  [Role.RECEPTIONIST]: [
    Permissions.VIEW_ROOMS,
    Permissions.CHECK_IN,
    Permissions.MANAGE_POS,
    Permissions.VIEW_BOOKINGS,
  ],
  [Role.HOUSEKEEPING]: [
    Permissions.CLEAN_ROOMS,
  ],
  [Role.GUEST]: [],
};

export const hasPermission = (user: { role: Role } | null, permission: string): boolean => {
  if (!user) return false;
  const perms = rolePermissions[user.role] || [];
  return perms.includes(permission);
};

export const getRoleLabel = (role: Role): string => {
  switch (role) {
    case Role.ADMIN: return 'Admin';
    case Role.MANAGER: return 'Quản lý';
    case Role.RECEPTIONIST: return 'Lễ tân';
    case Role.HOUSEKEEPING: return 'Buồng phòng';
    case Role.GUEST: return 'Khách hàng';
    default: return role;
  }
};

export const getDefaultRouteForUser = (user: { role: Role }): string => {
  switch (user.role) {
    case Role.ADMIN:
    case Role.MANAGER:
      return '/dashboard';
    case Role.RECEPTIONIST:
      return '/check-in';
    case Role.HOUSEKEEPING:
      return '/room-cleaning';
    case Role.GUEST:
      return '/';
    default:
      return '/';
  }
};