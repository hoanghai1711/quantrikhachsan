using System.Collections.Generic;
using HotelBackend.Data;
using HotelBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace HotelBackend.Services
{
    public class BookingService : IBookingService
    {
        private readonly ApplicationDbContext _context;

        public BookingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Booking?> GetBookingByCodeAsync(string code)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails!)
                .ThenInclude(bd => bd.RoomType)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.BookingCode == code);

            if (booking != null)
            {
                booking.RoomTypeName = booking.BookingDetails?.FirstOrDefault()?.RoomType?.Name;
            }

            return booking;
        }

        public async Task<Booking?> GetBookingByIdentifierAsync(string identifier, string type)
        {
            if (type.ToLower() == "code")
            {
                return await GetBookingByCodeAsync(identifier);
            }
            else if (type.ToLower() == "phone")
            {
                var booking = await _context.Bookings
                    .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.RoomType)
                    .Include(b => b.User)
                    .FirstOrDefaultAsync(b => b.GuestPhone == identifier);

                if (booking != null)
                {
                    booking.RoomTypeName = booking.BookingDetails?.FirstOrDefault()?.RoomType?.Name;
                }

                return booking;
            }
            return null;
        }

        public async Task<IEnumerable<Booking>> GetAllBookingsAsync()
        {
            var bookings = await _context.Bookings
                .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.RoomType)
                .Include(b => b.User)
                .ToListAsync();

            foreach (var booking in bookings)
            {
                booking.RoomTypeName = booking.BookingDetails?.FirstOrDefault()?.RoomType?.Name;
            }

            return bookings;
        }

        public async Task<IEnumerable<RoomType>> SearchAvailableRoomsAsync(DateTime checkIn, DateTime checkOut)
        {
            // Get room types with available rooms count
            var roomTypes = await _context.RoomTypes
                .Include(rt => rt.Rooms)
                .ToListAsync();

            var availableRoomTypes = new List<RoomType>();

            foreach (var roomType in roomTypes)
            {
                var availableCount = await GetAvailableRoomCountAsync(roomType.Id, checkIn, checkOut);
                if (availableCount > 0)
                {
                    availableRoomTypes.Add(roomType);
                }
            }

            return availableRoomTypes;
        }

        public async Task<Booking> CreateBookingAsync(Booking booking)
        {
            using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            try
            {
                booking.BookingCode = GenerateBookingCode();
                booking.Status = "Pending";
                if (booking.UserId <= 0)
                {
                    booking.UserId = 1; // Default guest user when no authenticated user is provided
                }

                if (booking.RoomIds != null && booking.RoomIds.Any())
                {
                    foreach (var roomId in booking.RoomIds)
                    {
                        var room = await _context.Rooms.Include(r => r.RoomType).FirstOrDefaultAsync(r => r.Id == roomId);
                        if (room == null || room.Status != "Available" || !room.RoomTypeId.HasValue) continue;

                        booking.BookingDetails.Add(new BookingDetail
                        {
                            Booking = booking,
                            RoomTypeId = room.RoomTypeId.Value,
                            RoomId = roomId,
                            CheckInDate = booking.CheckInDate,
                            CheckOutDate = booking.CheckOutDate,
                            PricePerNight = room.RoomType?.BasePrice ?? 0m
                        });
                    }
                }
                else if (booking.RoomTypeId > 0 && booking.CheckInDate < booking.CheckOutDate)
                {
                    var availableCount = await GetAvailableRoomCountAsync(booking.RoomTypeId, booking.CheckInDate, booking.CheckOutDate);
                    if (availableCount <= 0)
                    {
                        throw new InvalidOperationException("No available rooms for the selected dates.");
                    }

                    var roomType = await _context.RoomTypes.FindAsync(booking.RoomTypeId);
                    booking.BookingDetails = new List<BookingDetail>
                    {
                        new BookingDetail
                        {
                            Booking = booking,
                            RoomTypeId = booking.RoomTypeId,
                            CheckInDate = booking.CheckInDate,
                            CheckOutDate = booking.CheckOutDate,
                            PricePerNight = roomType?.BasePrice ?? 0m
                        }
                    };
                }

                if (!booking.BookingDetails.Any())
                {
                    throw new InvalidOperationException("Phải chọn phòng hoặc loại phòng để đặt phòng.");
                }

                booking.TotalEstimatedAmount = booking.BookingDetails.Sum(d => d.Subtotal);

                if (!string.IsNullOrWhiteSpace(booking.VoucherCode))
                {
                    var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == booking.VoucherCode);
                    if (voucher != null && (voucher.ValidFrom == null || voucher.ValidFrom <= DateTime.Now) &&
                        (voucher.ValidTo == null || voucher.ValidTo >= DateTime.Now) &&
                        (!voucher.MinBookingValue.HasValue || booking.TotalEstimatedAmount >= voucher.MinBookingValue.Value))
                    {
                        booking.VoucherId = voucher.Id;
                        var discountAmount = voucher.DiscountType?.ToUpper() == "PERCENT"
                            ? Math.Round(booking.TotalEstimatedAmount * voucher.DiscountValue / 100m, 2)
                            : voucher.DiscountValue;
                        booking.TotalEstimatedAmount = Math.Max(0, booking.TotalEstimatedAmount - discountAmount);
                    }
                }

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return booking;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> CheckInAsync(int bookingId, List<int> roomIds)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null || booking.BookingDetails == null) return false;

            // Assign rooms to booking details
            var details = booking.BookingDetails.ToList();
            for (int i = 0; i < Math.Min(details.Count, roomIds.Count); i++)
            {
                details[i].RoomId = roomIds[i];
                var room = await _context.Rooms.FindAsync(roomIds[i]);
                if (room != null)
                {
                    room.Status = "Occupied";
                }
            }

            booking.Status = "CheckedIn";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Booking> ConfirmBookingFromHoldAsync(int holdId, Booking bookingData)
        {
            var hold = await _context.RoomHolds.FindAsync(holdId);
            if (hold == null)
                throw new ArgumentException("Hold not found");

            if (hold.HoldExpiry <= DateTime.UtcNow)
                throw new InvalidOperationException("Hold has expired");

            // Create booking using the hold data
            bookingData.RoomTypeId = hold.RoomTypeId;
            bookingData.CheckInDate = hold.CheckIn;
            bookingData.CheckOutDate = hold.CheckOut;

            var booking = await CreateBookingAsync(bookingData);

            // Remove the hold
            _context.RoomHolds.Remove(hold);
            await _context.SaveChangesAsync();

            return booking;
        }

        private async Task<int> GetAvailableRoomCountAsync(int roomTypeId, DateTime checkIn, DateTime checkOut)
        {
            var totalRooms = await _context.Rooms.CountAsync(r => r.RoomTypeId == roomTypeId && r.Status == "Available");

            var bookedCount = await _context.BookingDetails
                .Where(bd => bd.RoomTypeId == roomTypeId)
                .Where(bd => bd.CheckInDate < checkOut && bd.CheckOutDate > checkIn)
                .CountAsync();

            var holdCount = await _context.RoomHolds
                .Where(h => h.RoomTypeId == roomTypeId)
                .Where(h => h.CheckIn < checkOut && h.CheckOut > checkIn)
                .Where(h => h.HoldExpiry > DateTime.UtcNow)
                .CountAsync();

            return Math.Max(0, totalRooms - bookedCount - holdCount);
        }

        private string GenerateBookingCode()
        {
            return "BK" + DateTime.Now.ToString("yyyyMMddHHmmss") + new Random().Next(1000, 9999);
        }
    }
}