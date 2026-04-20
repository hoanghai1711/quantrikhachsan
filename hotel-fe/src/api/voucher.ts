import { Voucher, VoucherType } from '../types';

const API_BASE_URL = 'http://localhost:5002/api';

export interface CreateVoucherPayload {
  code: string;
  type: VoucherType;
  value: number;
  minBookingValue: number;
  validFrom?: string;
  validTo: string;
  usageLimit: number;
}

export interface UpdateVoucherPayload {
  code?: string;
  type?: VoucherType;
  value?: number;
  minBookingValue?: number;
  validTo?: string;
  usageLimit?: number;
}

export const getVouchers = async (): Promise<Voucher[]> => {
  const response = await fetch(`${API_BASE_URL}/vouchers`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('hotel_token')}` }
  });
  if (!response.ok) throw new Error('Failed to load vouchers');
  const data = await response.json();
  const vouchers = data.$values || data;
  return Array.isArray(vouchers) ? vouchers : [];
};

export const getVoucherByCode = async (code: string): Promise<Voucher | null> => {
  try {
    const token = localStorage.getItem('hotel_token');
    const response = await fetch(`${API_BASE_URL}/vouchers/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin voucher');
    }

    return await response.json();
  } catch (error) {
    console.error('Get voucher by code error:', error);
    throw error;
  }
};

export const createVoucher = async (payload: CreateVoucherPayload): Promise<Voucher> => {
  try {
    const token = localStorage.getItem('hotel_token');
    const response = await fetch(`${API_BASE_URL}/vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tạo voucher');
    }

    return await response.json();
  } catch (error) {
    console.error('Create voucher error:', error);
    throw error;
  }
};

export const updateVoucher = async (id: number, payload: UpdateVoucherPayload): Promise<Voucher> => {
  try {
    const token = localStorage.getItem('hotel_token');
    const response = await fetch(`${API_BASE_URL}/vouchers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể cập nhật voucher');
    }

    return await response.json();
  } catch (error) {
    console.error('Update voucher error:', error);
    throw error;
  }
};

export const deleteVoucher = async (id: number): Promise<boolean> => {
  try {
    const token = localStorage.getItem('hotel_token');
    const response = await fetch(`${API_BASE_URL}/vouchers/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Không thể xóa voucher');
    }

    return true;
  } catch (error) {
    console.error('Delete voucher error:', error);
    throw error;
  }
};

export const bulkImportVouchers = async (vouchers: CreateVoucherPayload[]): Promise<any> => {
  try {
    const token = localStorage.getItem('hotel_token');
    const response = await fetch(`${API_BASE_URL}/vouchers/bulk-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(vouchers),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể import vouchers');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Bulk import vouchers error:', error);
    throw error;
  }
};
