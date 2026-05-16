const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT + '/api';

export interface RoomInventory {
  id: number;
  roomId?: number;
  equipmentId: number;
  quantity?: number;
  priceIfLost?: number;
  note?: string;
  isActive?: boolean;
  itemType?: string;
  equipment?: {
    id: number;
    name?: string;
    itemCode?: string;
    category?: string;
    unit?: string;
    basePrice?: number;
  };
  room?: {
    id: number;
    roomNumber?: string;
  };
}

const getAuthHeader = () => {
  const token = localStorage.getItem('hotel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeApiArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  return [];
};

export const getRoomInventory = async (roomId: number): Promise<RoomInventory[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/room-inventory/room/${roomId}`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh sách thiết bị phòng');
    }

    const data = await response.json();
    return normalizeApiArray(data);
  } catch (error) {
    console.error('Get room inventory error:', error);
    throw error;
  }
};

export const getRoomTypeInventory = async (roomTypeId: number): Promise<RoomInventory[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/room-inventory/room-type/${roomTypeId}`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh sách thiết bị loại phòng');
    }

    const data = await response.json();
    return normalizeApiArray(data);
  } catch (error) {
    console.error('Get room type inventory error:', error);
    throw error;
  }
};

export const createRoomInventory = async (inventory: Omit<RoomInventory, 'id'>): Promise<RoomInventory> => {
  try {
    const response = await fetch(`${API_BASE_URL}/room-inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        roomId: inventory.roomId,
        equipmentId: inventory.equipmentId,
        quantity: inventory.quantity,
        priceIfLost: inventory.priceIfLost,
        note: inventory.note,
        isActive: inventory.isActive ?? true,
        itemType: inventory.itemType,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tạo mục inventory');
    }

    return await response.json();
  } catch (error) {
    console.error('Create room inventory error:', error);
    throw error;
  }
};

export const updateRoomInventory = async (id: number, inventory: Partial<RoomInventory>): Promise<RoomInventory> => {
  try {
    const response = await fetch(`${API_BASE_URL}/room-inventory/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        quantity: inventory.quantity,
        priceIfLost: inventory.priceIfLost,
        note: inventory.note,
        isActive: inventory.isActive,
        itemType: inventory.itemType,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể cập nhật mục inventory');
    }

    return await response.json();
  } catch (error) {
    console.error('Update room inventory error:', error);
    throw error;
  }
};

export const deleteRoomInventory = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/room-inventory/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xóa mục inventory');
    }
  } catch (error) {
    console.error('Delete room inventory error:', error);
    throw error;
  }
};
