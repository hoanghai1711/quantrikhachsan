const API_BASE_URL = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('hotel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeApiArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  return [];
};

export interface StaffUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface UpdateRoleRequest {
  role: string;
}

export const getStaff = async (): Promise<StaffUser[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/staff`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh sách nhân viên');
    }

    const data = await response.json();
    return normalizeApiArray(data);
  } catch (error) {
    console.error('Get staff error:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: number, roleRequest: UpdateRoleRequest): Promise<StaffUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(roleRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể cập nhật vai trò người dùng');
    }

    return await response.json();
  } catch (error) {
    console.error('Update user role error:', error);
    throw error;
  }
};
