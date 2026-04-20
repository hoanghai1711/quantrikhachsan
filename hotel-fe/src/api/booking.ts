import { Booking, BookingService, RoomType, ServiceItem } from '../types';

const API_BASE_URL = 'http://localhost:5002/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('hotel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeApiArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  return [];
};

export interface RoomSearchParams {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}

export const searchRooms = async (params: RoomSearchParams): Promise<RoomType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        adults: params.adults,
        children: params.children,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        amenities: params.amenities,
      }),
    });

    if (!response.ok) {
      throw new Error('Không thể tìm kiếm phòng');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Search rooms error:', error);
    throw error;
  }
};

export const getBookingByCode = async (code: string): Promise<Booking | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${code}`, {
      headers: getAuthHeader(),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Get booking by code error:', error);
    throw error;
  }
};

export const getBookingByIdentifier = async (value: string, type: 'code' | 'phone'): Promise<Booking | null> => {
  try {
    const queryParams = new URLSearchParams({
      identifier: value,
      type,
    });

    const response = await fetch(`${API_BASE_URL}/bookings?${queryParams}`, {
      headers: getAuthHeader(),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Không thể tìm kiếm booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Get booking by identifier error:', error);
    throw error;
  }
};

export const createRoomHold = async (payload: {
  roomTypeId: number;
  checkIn: string;
  checkOut: string;
}): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/hold`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể giữ phòng');
    }

    return await response.json();
  } catch (error) {
    console.error('Create room hold error:', error);
    throw error;
  }
};

export const confirmBookingFromHold = async (holdId: number, payload: {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomTypeId: number;
  nights: number;
  voucherCode?: string;
}): Promise<Booking> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/confirm/${holdId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xác nhận booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Confirm booking from hold error:', error);
    throw error;
  }
};

export const createBooking = async (payload: {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomTypeId: number;
  nights: number;
  voucherCode?: string;
}): Promise<Booking> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tạo booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Create booking error:', error);
    throw error;
  }
};

export const getBookings = async (): Promise<Booking[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Không thể lấy danh sách bookings');
    }

    const data = await response.json();
    return normalizeApiArray<Booking>(data);
  } catch (error) {
    console.error('Get bookings error:', error);
    throw error;
  }
};

export const checkIn = async (bookingId: number, roomIds: number[]): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/check-in`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookingId, roomIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể check-in');
    }
  } catch (error) {
    console.error('Check-in error:', error);
    throw error;
  }
};

export const checkOut = async (bookingId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/checkout`, {
      method: 'POST',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể check-out');
    }
  } catch (error) {
    console.error('Check-out error:', error);
    throw error;
  }
};

export const createPayment = async (payment: { invoiceId: number; paymentMethod: string; amount: number; transactionId?: string }): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/payments`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payment),
    });

    if (!response.ok) {
      throw new Error('Tạo thanh toán thất bại');
    }

    return await response.json();
  } catch (error) {
    console.error('Create payment error:', error);
    throw error;
  }
};

export const createMomoPayment = async (
  bookingId: number,
  payment: { amount?: number; orderInfo?: string }
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/payments/momo`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payment),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || 'Tao thanh toan MoMo that bai');
    }

    return data;
  } catch (error) {
    console.error('Create MoMo payment error:', error);
    throw error;
  }
};

export const getInvoice = async (bookingId: number): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/invoice`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Không thể lấy hóa đơn');
    }

    return await response.json();
  } catch (error) {
    console.error('Get invoice error:', error);
    throw error;
  }
};

export const addServiceToBooking = async (bookingId: number, serviceId: number, quantity: number): Promise<BookingService> => {
  try {
    const response = await fetch(`${API_BASE_URL}/order-services`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookingId, serviceId, quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể thêm dịch vụ');
    }

    return await response.json();
  } catch (error) {
    console.error('Add service error:', error);
    throw error;
  }
};

export const getServiceList = async (): Promise<ServiceItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/services`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Không thể lấy danh sách dịch vụ');
    }

    const data = await response.json();
    // Handle both array format and { $values: array } format
    const servicesList = Array.isArray(data) ? data : (data?.$values || []);
    return Array.isArray(servicesList) ? servicesList : [];
  } catch (error) {
    console.error('Get service list error:', error);
    return [];
  }
};

export const getRoomTypeById = async (id: number): Promise<RoomType | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/types/${id}`, {
      headers: getAuthHeader(),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin loại phòng');
    }

    return await response.json();
  } catch (error) {
    console.error('Get room type error:', error);
    throw error;
  }
};

export const getAvailableRooms = async (typeId: number, checkIn: string, checkOut: string) => {
  try {
    const queryParams = new URLSearchParams({
      roomTypeId: typeId.toString(),
      checkIn,
      checkOut,
    });

    const response = await fetch(`${API_BASE_URL}/rooms/available?${queryParams}`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Không thể lấy danh sách phòng trống');
    }

    return await response.json();
  } catch (error) {
    console.error('Get available rooms error:', error);
    throw error;
  }
};
