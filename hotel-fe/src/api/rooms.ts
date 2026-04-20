import { Room, RoomType, RoomInventory } from '../types';

const API_BASE_URL = 'http://localhost:5002/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('hotel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function toArray<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.$values && Array.isArray(data.$values)) return data.$values;
  if (typeof data === 'object' && data.id !== undefined) return [data];
  return [];
}

function sanitize<T>(obj: any): T | null {
  if (!obj || typeof obj !== 'object') return obj as T;
  if (Array.isArray(obj)) {
    return obj.map(sanitize).filter(v => v !== null) as any;
  }

  // Nếu là object $ref thì bỏ qua (trả về null)
  if (Object.keys(obj).length === 1 && obj.$ref !== undefined) {
    return null;
  }

  const result: any = {};
  for (const key in obj) {
    if (key === '$id' || key === '$values' || key === '$ref') continue;
    const value = obj[key];
    if (value && typeof value === 'object') {
      if (value.$values) {
        result[key] = toArray(value).map(sanitize).filter(v => v !== null);
      } else {
        result[key] = sanitize(value);
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

function extractApiBody(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (data.data !== undefined) return data.data;
  if (data.value !== undefined) return data.value;
  return data;
}

// ========== Room Types ==========
export const getRoomTypes = async (): Promise<RoomType[]> => {
  const res = await fetch(`${API_BASE_URL}/rooms/types`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const body = extractApiBody(data);
  const arr = toArray<RoomType>(body);
  const cleaned = arr.map(item => sanitize<RoomType>(item)).filter((item): item is RoomType => item !== null);
  return cleaned.map(item => ({ ...item, isActive: item.isActive ?? true }));
};

export interface RoomSearchParams {
  checkIn: string;
  checkOut: string;
  roomTypeId?: number;
  minPrice?: number;
  maxPrice?: number;
}

export const getRoomTypeById = async (id: number): Promise<RoomType> => {
  const res = await fetch(`${API_BASE_URL}/rooms/types/${id}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const cleaned = sanitize<RoomType>(data);
  if (!cleaned) throw new Error('Room type not found');
  return cleaned;
};

export const searchAvailableRooms = async (params: RoomSearchParams): Promise<Room[]> => {
  const queryParams = new URLSearchParams({
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    ...(params.roomTypeId !== undefined ? { roomTypeId: params.roomTypeId.toString() } : {}),
    ...(params.minPrice !== undefined && params.minPrice >= 0 ? { minPrice: params.minPrice.toString() } : {}),
    ...(params.maxPrice !== undefined && params.maxPrice >= 0 ? { maxPrice: params.maxPrice.toString() } : {}),
  });

  const res = await fetch(`${API_BASE_URL}/rooms/available?${queryParams.toString()}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  const data = await res.json();
  const body = extractApiBody(data);
  const arr = toArray<Room>(body);
  const cleaned = arr.map(item => sanitize<Room>(item)).filter((item): item is Room => item !== null);
  return cleaned.map(item => ({
    id: item.id ?? 0,
    roomTypeId: item.roomTypeId ?? 0,
    roomNumber: item.roomNumber ?? '',
    status: item.status ?? 'Available',
    floor: item.floor ?? 0,
    roomType: item.roomType,
    bookingDetails: item.bookingDetails,
  }));
};

export const createRoomType = async (roomType: Omit<RoomType, 'id'>): Promise<RoomType> => {
  const res = await fetch(`${API_BASE_URL}/rooms/types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(roomType),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Tạo loại phòng thất bại');
  }
  const data = await res.json();
  const cleaned = sanitize<RoomType>(data);
  if (!cleaned) throw new Error('Invalid response');
  return cleaned;
};

export const updateRoomType = async (id: number, roomType: Partial<RoomType>): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/rooms/types/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(roomType),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Cập nhật loại phòng thất bại');
  }
};

export const deleteRoomType = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/rooms/types/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Xóa loại phòng thất bại');
  }
};

// ========== Rooms ==========
export const getRooms = async (): Promise<Room[]> => {
  const res = await fetch(`${API_BASE_URL}/rooms`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const body = extractApiBody(data);
  const arr = toArray<Room>(body);
  const cleaned = arr.map(item => sanitize<Room>(item)).filter((item): item is Room => item !== null);
  return cleaned.map(item => ({
    id: item.id ?? 0,
    roomTypeId: item.roomTypeId ?? 0,
    roomNumber: item.roomNumber ?? '',
    status: item.status ?? 'Available',
    floor: item.floor ?? 0,
    roomType: item.roomType,
    bookingDetails: item.bookingDetails,
  }));
};

export const getRoomById = async (id: number): Promise<Room> => {
  const res = await fetch(`${API_BASE_URL}/rooms/${id}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const cleaned = sanitize<Room>(data);
  if (!cleaned) throw new Error('Room not found');
  return {
    id: cleaned.id ?? 0,
    roomTypeId: cleaned.roomTypeId ?? 0,
    roomNumber: cleaned.roomNumber ?? '',
    status: cleaned.status ?? 'Available',
    floor: cleaned.floor ?? 0,
    roomType: cleaned.roomType,
    bookingDetails: cleaned.bookingDetails,
  };
};

export const createRoom = async (data: {
  roomTypeId: number;
  roomNumber: string;
  status?: string;
  floor: number;
}): Promise<Room> => {
  const res = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Tạo phòng thất bại');
  }
  const responseData = await res.json();
  const body = extractApiBody(responseData);
  const cleaned = sanitize<Room>(body);
  if (!cleaned || cleaned.id === undefined || !cleaned.roomNumber) {
    console.error('Invalid room data from server:', responseData);
    throw new Error('Server trả về dữ liệu phòng không hợp lệ');
  }
  return {
    id: cleaned.id,
    roomTypeId: cleaned.roomTypeId,
    roomNumber: cleaned.roomNumber,
    status: cleaned.status ?? 'Available',
    floor: cleaned.floor ?? 0,
    roomType: cleaned.roomType,
    bookingDetails: cleaned.bookingDetails,
  };
};

export const updateRoom = async (id: number, room: {
  roomTypeId?: number;
  roomNumber?: string;
  status?: string;
  floor: number;
}): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(room),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Cập nhật phòng thất bại');
  }
};

export const deleteRoom = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Xóa phòng thất bại');
  }
};

export const updateRoomStatus = async (roomId: number, status: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Cập nhật trạng thái thất bại');
  }
};

export interface CreateLossAndDamageRequest {
  bookingDetailId: number;
  roomInventoryId?: number;
  quantity: number;
  penaltyAmount: number;
  description?: string;
  imageUrl?: string;
}

export const updateRoomCleaningStatus = async (roomId: number, cleaningStatus: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/cleaning-status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ cleaningStatus }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Cập nhật trạng thái dọn dẹp thất bại');
  }
};

export const fetchCleaningRooms = async (): Promise<Room[]> => {
  const res = await fetch(`${API_BASE_URL}/rooms/cleaning/list`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const body = extractApiBody(data);
  const arr = toArray<Room>(body);
  const cleaned = arr.map(item => sanitize<Room>(item)).filter((item): item is Room => item !== null);
  return cleaned.map(item => ({
    id: item.id ?? 0,
    roomTypeId: item.roomTypeId ?? 0,
    roomNumber: item.roomNumber ?? '',
    status: item.status ?? 'Available',
    cleaningStatus: item.cleaningStatus ?? 'Dirty',
    floor: item.floor ?? 0,
    roomType: item.roomType,
    bookingDetails: item.bookingDetails,
  }));
};

export const createLossAndDamage = async (request: CreateLossAndDamageRequest): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/loss-and-damages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Báo cáo hư hỏng thất bại');
  }
};

export const fetchRoomInventory = async (roomId: number): Promise<RoomInventory[]> => {
  const res = await fetch(`${API_BASE_URL}/room-inventory/room/${roomId}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const arr = toArray<RoomInventory>(data);
  const cleaned = arr.map(item => sanitize<RoomInventory>(item)).filter((item): item is RoomInventory => item !== null);
  return cleaned;
};

// ========== Room Images ==========
export const addRoomImage = async (roomTypeId: number, imageUrl: string, isPrimary: boolean = false): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/rooms/types/${roomTypeId}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ imageUrl, isPrimary }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Thêm ảnh thất bại');
  }
  const data = await res.json();
  return sanitize(data);
};

export const removeRoomImage = async (imageId: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/rooms/images/${imageId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Xóa ảnh thất bại');
  }
};

export const setPrimaryImage = async (imageId: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/rooms/images/${imageId}/primary`, {
    method: 'PUT',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Đặt ảnh chính thất bại');
  }
};