import { Role } from '../types/auth';
import { Booking, LossDamage, PaymentRecord, Room, RoomType, ServiceItem, Voucher } from '../types';
import { rolePermissions } from '../utils/permissions';

export const users = [
  {
    id: 1,
    email: 'receptionist@hotel.com',
    fullName: 'Nữ lễ tân',
    role: Role.RECEPTIONIST,
    permissions: rolePermissions.receptionist,
    password: '123456',
  },
  {
    id: 2,
    email: 'housekeeping@hotel.com',
    fullName: 'Nhân viên buồng phòng',
    role: Role.HOUSEKEEPING,
    permissions: rolePermissions.housekeeping,
    password: '123456',
  },
  {
    id: 3,
    email: 'manager@hotel.com',
    fullName: 'Quản lý',
    role: Role.MANAGER,
    permissions: rolePermissions.manager,
    password: '123456',
  },
  {
    id: 4,
    email: 'admin@hotel.com',
    fullName: 'Admin hệ thống',
    role: Role.ADMIN,
    permissions: rolePermissions.admin,
    password: '123456',
  },
];

export const roomTypes: RoomType[] = [
  {
    id: 1,
    name: 'Phòng Deluxe',
    description: 'Phòng Deluxe rộng rãi, tiện nghi sang trọng cho kỳ nghỉ thư giãn.',
    basePrice: 1200000,
    maxOccupancy: 3,
    size: 35,
    isActive: true,
  },
  {
    id: 2,
    name: 'Phòng Premium',
    description: 'Phòng Premium với bể sục riêng, ban công và view thành phố tuyệt đẹp.',
    basePrice: 1800000,
    maxOccupancy: 4,
    size: 45,
    isActive: true,
  },
];



export const services: ServiceItem[] = [
  { id: 1, name: 'Ăn sáng tại phòng', category: 'F&B', price: 150000, isActive: true },
  { id: 2, name: 'Spa thư giãn', category: 'Spa', price: 450000, isActive: true },
  { id: 3, name: 'Giặt ủi', category: 'Housekeeping', price: 120000, isActive: true },
  { id: 4, name: 'Thuê xe du lịch', category: 'Tour', price: 650000, isActive: true },
];

export const vouchers: Voucher[] = [
  {
    id: 1,
    code: 'HOTEL10',
    type: 'PERCENT',
    value: 10,
    minBookingValue: 0,
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    usageLimit: 200,
    usedCount: 25,
  },
  {
    id: 2,
    code: 'STAY150',
    type: 'FIXED',
    value: 150000,
    minBookingValue: 0,
    validFrom: '2025-01-01',
    validTo: '2026-08-31',
    usageLimit: 100,
    usedCount: 40,
  },
];

export const bookings: Booking[] = [
  {
    id: 1,
    code: 'BK1001',
    guestName: 'Nguyễn Văn A',
    guestEmail: 'nguyenvana@gmail.com',
    guestPhone: '0909123456',
    checkIn: '2026-04-10',
    checkOut: '2026-04-12',
    adults: 2,
    children: 0,
    roomTypeId: 1,
    roomIds: [104],
    status: 'CheckedIn',
    totalAmount: 2400000,
    paidAmount: 2400000,
    voucherCode: undefined,
    paymentMethod: 'Cash',
    services: [],
    loyaltyEarned: 24,
  },
];

export const lossAndDamages: LossDamage[] = [];
export const payments: PaymentRecord[] = [];

export const revenuePoints = [
  { label: 'Thứ 2', room: 3200000, service: 800000, damage: 0, total: 4000000 },
  { label: 'Thứ 3', room: 2800000, service: 1100000, damage: 0, total: 3900000 },
  { label: 'Thứ 4', room: 4500000, service: 1600000, damage: 200000, total: 6300000 },
  { label: 'Thứ 5', room: 3500000, service: 1200000, damage: 0, total: 4700000 },
  { label: 'Thứ 6', room: 5200000, service: 2100000, damage: 0, total: 7300000 },
];
