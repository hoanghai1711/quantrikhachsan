const ENDPOINT = '/api';

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
  const response = await fetch(`${ENDPOINT}/membership/me`, {
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

// Note: Backend không có endpoint /membership/transactions
// Sử dụng hàm này khi backend implementation đã sẵn sàng
export const getMembershipTransactions = async (): Promise<Transaction[]> => {
  // Tạm thời trả về mảng rỗng
  return [];
  
  // Khi backend có sẵn endpoint, uncomment đoạn sau:
  // const token = localStorage.getItem('hotel_token');
  // const response = await fetch(`${ENDPOINT}/membership/transactions`, {
  //   method: 'GET',
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //     'Content-Type': 'application/json',
  //   },
  // });
  //
  // if (!response.ok) {
  //   throw new Error('Không thể tải lịch sử giao dịch');
  // }
  //
  // return response.json();
};
