import { User, Role } from '../types/auth';

// Dùng relative path (proxy)
const API_BASE_URL = '/api';

export const userService = {
  getStaffUsers: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/staff`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
      });
      if (!response.ok) throw new Error('Không thể tải danh sách nhân viên');
      const data = await response.json();
      // Xử lý cả hai trường hợp
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.$values)) return data.$values;
      }
      return [];
    } catch (error) {
      console.error('Get staff users error:', error);
      throw error;
    }
  },



  updateUserRole: async (userId: number, newRole: Role): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể cập nhật vai trò');
      }

      return await response.json();
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  },

  updateRolePermissions: async (role: string, permissions: string[]): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${role}/permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể cập nhật quyền hạn');
      }

      return await response.json();
    } catch (error) {
      console.error('Update role permissions error:', error);
      throw error;
    }
  }
};