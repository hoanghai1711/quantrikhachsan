import { Equipment } from '../types';

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

export interface EquipmentDetail extends Equipment {
  itemCode?: string;
  category?: string;
  unit?: string;
  totalQuantity?: number;
  inUseQuantity?: number;
  damagedQuantity?: number;
  liquidatedQuantity?: number;
  inStockQuantity?: number;
  basePrice?: number;
  defaultPriceIfLost?: number;
  supplier?: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
}

export interface StockUpdateRequest {
  totalQuantity?: number;
  inUseQuantity?: number;
  damagedQuantity?: number;
  liquidatedQuantity?: number;
}

export const getEquipments = async (): Promise<EquipmentDetail[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/equipments`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh sách thiết bị');
    }

    const data = await response.json();
    return normalizeApiArray(data);
  } catch (error) {
    console.error('Get equipments error:', error);
    throw error;
  }
};

export const getEquipmentById = async (id: number): Promise<EquipmentDetail | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/equipments/${id}`, {
      headers: getAuthHeader(),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Không thể tải thông tin thiết bị');
    }

    return await response.json();
  } catch (error) {
    console.error('Get equipment by ID error:', error);
    throw error;
  }
};

export const createEquipment = async (equipment: Omit<EquipmentDetail, 'id'>): Promise<EquipmentDetail> => {
  try {
    const response = await fetch(`${API_BASE_URL}/equipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(equipment),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tạo thiết bị');
    }

    return await response.json();
  } catch (error) {
    console.error('Create equipment error:', error);
    throw error;
  }
};

export const updateEquipment = async (id: number, equipment: Partial<EquipmentDetail>): Promise<EquipmentDetail> => {
  try {
    const response = await fetch(`${API_BASE_URL}/equipments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(equipment),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể cập nhật thiết bị');
    }

    return await response.json();
  } catch (error) {
    console.error('Update equipment error:', error);
    throw error;
  }
};

export const deleteEquipment = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/equipments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xóa thiết bị');
    }
  } catch (error) {
    console.error('Delete equipment error:', error);
    throw error;
  }
};

export const updateEquipmentStock = async (id: number, request: StockUpdateRequest): Promise<EquipmentDetail> => {
  try {
    const response = await fetch(`${API_BASE_URL}/equipments/${id}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể cập nhật tồn kho thiết bị');
    }

    return await response.json();
  } catch (error) {
    console.error('Update equipment stock error:', error);
    throw error;
  }
};
