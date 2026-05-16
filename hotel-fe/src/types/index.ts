// src/types/index.ts

export type RoomStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Reserved' | 'Held';
export type BookingStatus = 'Pending' | 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Cancelled' | 'Completed';
export type VoucherType = 'PERCENT' | 'FIXED';
export type PaymentMethod = 'Cash' | 'BankTransfer' | 'VNPay' | 'MoMo';

export interface RoomType {
  id: number;
  name?: string;
  description?: string;
  basePrice: number;
  capacityAdults: number;
  capacityChildren: number;
  maxOccupancy?: number; // computed
  size: number;
  bedType?: string;
  viewType?: string;
  slug?: string;
  content?: string;
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
  extensionNumber?: string;
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
  itemCode?: string;
  name?: string;
  category?: string;
  unit?: string;
  totalQuantity?: number;
  inUseQuantity?: number;
  damagedQuantity?: number;
  liquidatedQuantity?: number;
  inStockQuantity?: number;
  basePrice?: number;
  defaultPriceIfLost?: number;
  supplier?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
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
  roomTypeId?: number;
  checkInDate: string;
  checkOutDate: string;
  pricePerNight: number;
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
  userId?: number;
  bookingCode?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;      // map từ checkIn khi gửi request
  checkOutDate: string;     // map từ checkOut khi gửi request
  adults: number;
  children: number;
  roomTypeId: number;
  roomIds: number[];
  roomTypeName?: string;
  status: BookingStatus;
  totalEstimatedAmount: number;
  paidAmount?: number;
  loyaltyEarned?: number;
  holdExpires?: string;
  voucherCode?: string;
  voucherId?: number;
  vouchers?: Voucher;
  services: BookingService[];
  bookingDetails?: BookingDetail[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceItem {
  id: number;
  categoryId?: number;
  category?: string | ServiceCategory;
  name: string;
  description?: string;
  price: number;
  unit?: string;
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
  userId?: number;
  bookingId?: number;
  roomTypeId?: number;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  guestName?: string;
  guestEmail?: string;
  rejectionReason?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  adminName?: string;
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
  slug?: string;
  authorId?: number;
  publishedAt?: string;
  isActive?: boolean;
  imageUrl?: string;
  categoryId?: number;
  category?: ArticleCategory;
}

export interface Attraction {
  id: number;
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  mapEmbedLink?: string;
  imageUrl?: string;
  isActive?: boolean;
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

export interface RoomHold {
  id: number;
  roomTypeId: number;
  checkIn: string;
  checkOut: string;
  holdExpiry: string;
  createdAt: string;
}

export interface Invoice {
  id: number;
  bookingId: number;
  totalRoomAmount: number;
  totalServiceAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalTotal: number;
  totalDamageAmount?: number;
  status: 'Unpaid' | 'Paid' | 'Partial' | 'Refunded';
  createdAt: string;
}