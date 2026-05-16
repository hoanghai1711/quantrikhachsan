import { RevenuePoint } from '../types';

const API_BASE_URL = '/api';

export const getRevenueReport = async (from?: Date, to?: Date): Promise<RevenuePoint[]> => {
  try {
    const token = localStorage.getItem('hotel_token');
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập lại');
    }

    const params = new URLSearchParams();
    if (from) params.append('from', from.toISOString());
    if (to) params.append('to', to.toISOString());

    const url = `${API_BASE_URL}/reports/revenue${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else if (response.status === 403) {
        throw new Error('Bạn không có quyền truy cập báo cáo doanh thu. Chỉ Admin/Manager mới có quyền.');
      } else if (response.status === 404) {
        throw new Error('Endpoint báo cáo không tồn tại. Vui lòng liên hệ quản trị viên.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi ${response.status}: Không thể lấy báo cáo doanh thu`);
      }
    }

    const data = await response.json();
    
    // Ensure we return an array
    if (!Array.isArray(data)) {
      console.warn('Revenue report returned non-array data:', data);
      return [];
    }

    return data;
  } catch (error: any) {
    const message = error?.message || 'Không thể lấy báo cáo doanh thu. Vui lòng thử lại sau.';
    console.error('Get revenue report error:', message, error);
    throw new Error(message);
  }
};
