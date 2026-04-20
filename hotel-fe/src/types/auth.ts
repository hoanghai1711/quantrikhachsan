export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  RECEPTIONIST = 'receptionist',
  HOUSEKEEPING = 'housekeeping',
  GUEST = 'guest'
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  // permissions?: string[]; // có thể bỏ vì dùng rolePermissions hardcode
}

export interface LoginResponse {
  user: User;
  token: string;
}