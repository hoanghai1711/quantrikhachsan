import { ServiceItem, ServiceCategory } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT + '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('hotel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeApiArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  return [];
};

export const getServices = async (): Promise<ServiceItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/services`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh sách dịch vụ');
    }

    const data = await response.json();
    return normalizeApiArray(data);
  } catch (error) {
    console.error('Get services error:', error);
    throw error;
  }
};

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/services/categories`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh mục dịch vụ');
    }

    const data = await response.json();
    return normalizeApiArray(data);
  } catch (error) {
    console.error('Get service categories error:', error);
    throw error;
  }
};

export const getServiceById = async (id: number): Promise<ServiceItem | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      headers: getAuthHeader(),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Không thể tải thông tin dịch vụ');
    }

    return await response.json();
  } catch (error) {
    console.error('Get service by ID error:', error);
    throw error;
  }
};

export const createService = async (service: Omit<ServiceItem, 'id'>): Promise<ServiceItem> => {
  try {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(service),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tạo dịch vụ');
    }

    return await response.json();
  } catch (error) {
    console.error('Create service error:', error);
    throw error;
  }
};

export const updateService = async (id: number, service: Partial<ServiceItem>): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(service),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể cập nhật dịch vụ');
    }
  } catch (error) {
    console.error('Update service error:', error);
    throw error;
  }
};

export const deleteService = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xóa dịch vụ');
    }
  } catch (error) {
    console.error('Delete service error:', error);
    throw error;
  }
};

export const toggleServiceStatus = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/services/${id}/toggle`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể thay đổi trạng thái dịch vụ');
    }
  } catch (error) {
    console.error('Toggle service status error:', error);
    throw error;
  }
};

export const createOrderService = async (
  bookingId: number,
  serviceId: number,
  quantity: number
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/order-services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        bookingId,
        serviceId,
        quantity,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tạo đơn dịch vụ');
    }

    return await response.json();
  } catch (error) {
    console.error('Create order service error:', error);
    throw error;
  }
};
