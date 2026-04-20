const API_BASE_URL = 'http://localhost:5002/api';

export interface Membership {
  id: number;
  userId: number;
  level: string; // Bronze, Silver, Gold
  points: number;
  joinedAt: string;
  lastUpdated: string | null;
}

export interface Transaction {
  id: number;
  amount: number;
  type: string; // booking, service, refund
  description: string;
  createdAt: string;
  bookingId?: number;
}

export const getMembership = async (): Promise<Membership> => {
  const token = localStorage.getItem('hotel_token');
  const response = await fetch(`${API_BASE_URL}/membership/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Chưa có thông tin membership');
    }
    throw new Error('Không thể tải thông tin membership');
  }

  return response.json();
};

export const getMembershipTransactions = async (): Promise<Transaction[]> => {
  const token = localStorage.getItem('hotel_token');
  const response = await fetch(`${API_BASE_URL}/membership/transactions`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tải lịch sử giao dịch');
  }

  return response.json();
};
