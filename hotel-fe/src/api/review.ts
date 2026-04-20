import { Review } from '../types';

const API_BASE_URL = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('hotel_token');
  if (!token) return {};
  return { 'Authorization': `Bearer ${token}` };
};

export interface ReviewStats {
  status: string;
  count: number;
  avg_rating: number;
}

export const getPendingReviews = async (): Promise<Review[]> => {
  const response = await fetch(`${API_BASE_URL}/reviews/pending`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Failed to load reviews');
  const data = await response.json();
  const reviews = data.$values || data;
  return Array.isArray(reviews) ? reviews : [];
};

export const createReview = async (review: { bookingId: number; rating: number; comment: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(review),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tạo đánh giá');
    }

    return await response.json();
  } catch (error) {
    console.error('Create review error:', error);
    throw error;
  }
};

export const getReviews = async (status?: string): Promise<Review[]> => {
  try {
    const url = status
      ? `${API_BASE_URL}/reviews?status=${encodeURIComponent(status)}`
      : `${API_BASE_URL}/reviews`;

    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn');
    if (response.status === 403) throw new Error('Không có quyền truy cập');
    if (!response.ok) throw new Error('Không thể lấy danh sách đánh giá');

    return await response.json();
  } catch (error) {
    console.error('Get reviews error:', error);
    throw error;
  }
};

export const getReviewById = async (id: number): Promise<Review> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn');
    if (response.status === 403) throw new Error('Không có quyền truy cập');
    if (response.status === 404) throw new Error('Không tìm thấy đánh giá');
    if (!response.ok) throw new Error('Không thể lấy chi tiết đánh giá');

    return await response.json();
  } catch (error) {
    console.error('Get review by ID error:', error);
    throw error;
  }
};

export const approveReview = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}/approve`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn');
    if (response.status === 403) throw new Error('Không có quyền truy cập');
    if (response.status === 404) throw new Error('Không tìm thấy đánh giá');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể duyệt đánh giá');
    }
  } catch (error) {
    console.error('Approve review error:', error);
    throw error;
  }
};

export const rejectReview = async (id: number, rejectionReason: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}/reject`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ rejectionReason }),
    });

    if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn');
    if (response.status === 403) throw new Error('Không có quyền truy cập');
    if (response.status === 404) throw new Error('Không tìm thấy đánh giá');
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.message || 'Yêu cầu không hợp lệ');
    }
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể từ chối đánh giá');
    }
  } catch (error) {
    console.error('Reject review error:', error);
    throw error;
  }
};

export const getReviewStats = async (): Promise<ReviewStats[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/stats`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn');
    if (response.status === 403) throw new Error('Không có quyền truy cập');
    if (!response.ok) throw new Error('Không thể lấy thống kê đánh giá');

    return await response.json();
  } catch (error) {
    console.error('Get review stats error:', error);
    throw error;
  }
};
