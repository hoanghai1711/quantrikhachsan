import { login as apiLogin, register as apiRegister, getCurrentUser as apiGetCurrentUser, logout as apiLogout } from '../api/auth';
import { User, Role } from '../types/auth';

// Hàm chuyển role string từ backend (ví dụ "Admin") sang enum Role
const mapRoleToEnum = (roleName: string): Role => {
  const lower = roleName.toLowerCase();
  switch (lower) {
    case 'admin': return Role.ADMIN;
    case 'manager': return Role.MANAGER;
    case 'receptionist': return Role.RECEPTIONIST;
    case 'housekeeping': return Role.HOUSEKEEPING;
    default: return Role.GUEST;
  }
};

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const { user } = await apiLogin(email, password);
    return { ...user, role: mapRoleToEnum(user.role) };
  },
  register: async (email: string, password: string, fullName: string, phone: string): Promise<User> => {
    const { user } = await apiRegister(email, password, fullName, phone);
    return { ...user, role: mapRoleToEnum(user.role) };
  },
  getCurrentUser: async (): Promise<User | null> => {
    const user = await apiGetCurrentUser();
    if (!user) return null;
    return { ...user, role: mapRoleToEnum(user.role) };
  },
  logout: async (): Promise<void> => {
    apiLogout();
  }
};