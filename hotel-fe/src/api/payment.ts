import { Booking, PaymentMethod } from '../types';

const API_BASE_URL = 'http://localhost:5002/api';

export const makePayment = async (bookingId: number, method: PaymentMethod, amount: number): Promise<Booking> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        method,
        amount,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể thực hiện thanh toán');
    }

    return await response.json();
  } catch (error) {
    console.error('Make payment error:', error);
    throw error;
  }
};
