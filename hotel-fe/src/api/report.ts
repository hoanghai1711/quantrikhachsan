import { RevenuePoint } from '../types';

const API_BASE_URL = 'http://localhost:5002/api';

export const getRevenueReport = async (): Promise<RevenuePoint[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/revenue`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Không thể lấy báo cáo doanh thu');
    }

    return await response.json();
  } catch (error) {
    console.error('Get revenue report error:', error);
    throw error;
  }
};
