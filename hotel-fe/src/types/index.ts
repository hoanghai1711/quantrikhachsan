export type RoomStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Reserved' | 'Held';
export type BookingStatus = 'Pending' | 'CheckedIn' | 'CheckedOut' | 'Cancelled';
export type VoucherType = 'PERCENT' | 'FIXED';
export type PaymentMethod = 'Cash' | 'BankTransfer' | 'VNPay';

export interface RoomType {
  id: number;
  name?: string;
  description?: string;
  basePrice: number;
  maxOccupancy: number;
  size: number;
  isActive: boolean;
  rooms?: Room[];
  roomAmenities?: RoomAmenity[];
  roomImages?: RoomImage[];
}

export interface Room {
  id: number;
  roomTypeId: number;
  roomNumber: string;
  status: string;
  floor: number;
  cleaningStatus?: string;
  roomType?: RoomType;
  bookingDetails?: any;
}

export interface RoomInventory {
  id: number;
  roomId: number;
  equipmentId: number;
  quantity: number;
  priceIfLost: number;
  note?: string;
  isActive: boolean;
  itemType?: string;
  equipment?: Equipment;
}

export interface Equipment {
  id: number;
  name?: string;
  description?: string;
  unit?: string;
  isActive: boolean;
}
export interface RoomAmenity {
  id: number;
  roomTypeId: number;
  name?: string;
  description?: string;
  roomType?: RoomType;
}

export interface RoomImage {
  id: number;
  roomTypeId: number;
  imageUrl?: string;
  isPrimary: boolean;
  roomType?: RoomType;
}

export interface BookingDetail {
  id: number;
  bookingId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  price: number;
  room?: Room;
  booking?: Booking;
}

export interface BookingService {
  id: number;
  serviceId: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Booking {
  id: number;
  code: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomTypeId: number;
  roomIds: number[];
  roomTypeName?: string;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  voucherCode?: string;
  paymentMethod?: PaymentMethod;
  services: BookingService[];
  loyaltyEarned: number;
  holdExpires?: number;
}

export interface ServiceItem {
  id: number;
  categoryId?: number;
  category?: string | ServiceCategory;
  name: string;
  price: number;
  isActive: boolean;
}

export interface ServiceCategory {
  id: number;
  name: string;
}

export interface Voucher {
  id: number;
  code: string;
  type: VoucherType;
  value: number;
  minBookingValue: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
}

export interface Review {
  id: number;
  user_id: number;
  bookingId?: number;
  room_type_id: number;
  rating: number;
  comment: string;
  created_at: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  guest_name?: string;
  guest_email?: string;
  rejection_reason?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  admin_name?: string;
}

export interface ArticleCategory {
  id: number;
  name: string;
  isActive: boolean;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  author?: string;
  publishedAt?: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  imageUrl?: string;
  categoryId?: number;
  category?: ArticleCategory;
}

export interface Attraction {
  id: number;
  name: string;
  description?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  imageUrl?: string;
  distanceFromHotel?: number;
  isActive: boolean;
}

export interface RevenuePoint {
  label: string;
  room: number;
  service: number;
  damage: number;
  total: number;
}

export interface LossDamage {
  id: number;
  roomId: number;
  roomNumber: string;
  item: string;
  quantity: number;
  amount: number;
  note: string;
  status: 'reported' | 'resolved';
  createdAt: string;
}

export interface PaymentRecord {
  id: number;
  bookingCode: string;
  amount: number;
  method: PaymentMethod;
  createdAt: string;
}

export interface RoomAssignment {
  roomId: number;
  bookingCode: string;
}
