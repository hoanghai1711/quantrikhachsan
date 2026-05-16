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
                
                // Set CheckInDate and CheckOutDate from first BookingDetail
                var firstDetail = booking.BookingDetails?.FirstOrDefault();
                if (firstDetail != null)
                {
                    booking.CheckInDate = firstDetail.CheckInDate;
                    booking.CheckOutDate = firstDetail.CheckOutDate;
                }
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
                    
                    // Set CheckInDate and CheckOutDate from first BookingDetail
                    var firstDetail = booking.BookingDetails?.FirstOrDefault();
                    if (firstDetail != null)
                    {
                        booking.CheckInDate = firstDetail.CheckInDate;
                        booking.CheckOutDate = firstDetail.CheckOutDate;
                    }
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
                
                // Set CheckInDate and CheckOutDate from first BookingDetail
                var firstDetail = booking.BookingDetails?.FirstOrDefault();
                if (firstDetail != null)
                {
                    booking.CheckInDate = firstDetail.CheckInDate;
                    booking.CheckOutDate = firstDetail.CheckOutDate;
                }
            }

            return bookings;
        }

        public async Task<IEnumerable<Booking>> GetCheckedInBookingsAsync()
        {
            var bookings = await _context.Bookings
                .Where(b => b.Status == "CheckedIn")
                .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.RoomType)
                .Include(b => b.User)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            foreach (var booking in bookings)
            {
                booking.RoomTypeName = booking.BookingDetails?.FirstOrDefault()?.RoomType?.Name;
                
                // Set CheckInDate and CheckOutDate from first BookingDetail
                var firstDetail = booking.BookingDetails?.FirstOrDefault();
                if (firstDetail != null)
                {
                    booking.CheckInDate = firstDetail.CheckInDate;
                    booking.CheckOutDate = firstDetail.CheckOutDate;
                }
            }

            return bookings;
        }

        public async Task<IEnumerable<RoomType>> SearchAvailableRoomsAsync(DateTime checkIn, DateTime checkOut)
        {
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

        /// <summary>
        /// Tạo booking mới, có thể loại trừ một hold cụ thể khỏi kiểm tra số lượng (dùng khi xác nhận từ hold)
        /// </summary>
        public async Task<Booking> CreateBookingAsync(Booking booking, int? excludeHoldId = null)
{
    using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
    try
    {
        // 1. Chuẩn hóa về UTC Midnight (tránh bị lệch múi giờ làm lùi ngày)
        var adjustedCheckIn = new DateTimeOffset(booking.CheckInDate.Date, TimeSpan.Zero);
        var adjustedCheckOut = new DateTimeOffset(booking.CheckOutDate.Date, TimeSpan.Zero);

        if (adjustedCheckIn >= adjustedCheckOut)
        {
            throw new InvalidOperationException("Ngày trả phòng phải sau ngày nhận phòng.");
        }

        booking.CheckInDate = adjustedCheckIn;
        booking.CheckOutDate = adjustedCheckOut;

        booking.BookingCode = GenerateBookingCode();
        booking.Status = "Pending";
        
        if (booking.RoomIds != null && booking.RoomIds.Any())
        {
            foreach (var roomId in booking.RoomIds)
            {
                var room = await _context.Rooms.Include(r => r.RoomType).FirstOrDefaultAsync(r => r.Id == roomId);
                if (room == null || room.Status == null || room.Status.ToLower() != "available" || !room.RoomTypeId.HasValue) continue;

                booking.BookingDetails.Add(new BookingDetail
                {
                    Booking = booking,
                    RoomTypeId = room.RoomTypeId.Value,
                    RoomId = roomId,
                    CheckInDate = adjustedCheckIn,
                    CheckOutDate = adjustedCheckOut,
                    PricePerNight = room.RoomType?.BasePrice ?? 0m
                });
            }
        }
        else if (booking.RoomTypeId > 0 && adjustedCheckIn < adjustedCheckOut)
        {
            // 2. Validate ngày trong tương lai dựa trên UtcNow
            if (adjustedCheckIn.Date < DateTimeOffset.UtcNow.Date)
            {
                throw new InvalidOperationException("Check-in date must be today or in the future.");
            }

            var availableCount = await GetAvailableRoomCountAsync(booking.RoomTypeId, adjustedCheckIn, adjustedCheckOut, excludeHoldId);
            if (availableCount <= 0)
            {
                var roomType = await _context.RoomTypes.FindAsync(booking.RoomTypeId);
                throw new InvalidOperationException($"No available {roomType?.Name ?? "rooms"} for {adjustedCheckIn:yyyy-MM-dd} to {adjustedCheckOut:yyyy-MM-dd}.");
            }

            var roomTypeInfo = await _context.RoomTypes.FindAsync(booking.RoomTypeId);
            booking.BookingDetails = new List<BookingDetail>
            {
                new BookingDetail
                {
                    Booking = booking,
                    RoomTypeId = booking.RoomTypeId,
                    CheckInDate = adjustedCheckIn,
                    CheckOutDate = adjustedCheckOut,
                    PricePerNight = roomTypeInfo?.BasePrice ?? 0m
                }
            };
        }

        if (!booking.BookingDetails.Any())
        {
            throw new InvalidOperationException("Phải chọn phòng hoặc loại phòng để đặt phòng.");
        }

        // 3. Validate Voucher dùng DateTimeOffset.UtcNow
        if (!string.IsNullOrWhiteSpace(booking.VoucherCode))
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == booking.VoucherCode);
            if (voucher != null)
            {
                var now = DateTimeOffset.UtcNow;
                if ((voucher.ValidFrom != null && voucher.ValidFrom > now) ||
                    (voucher.ValidTo != null && voucher.ValidTo < now))
                {
                    throw new InvalidOperationException($"Voucher '{booking.VoucherCode}' không còn hiệu lực.");
                }

                if (voucher.UsageLimit.HasValue && voucher.UsedCount >= voucher.UsageLimit.Value)
                {
                    throw new InvalidOperationException($"Voucher '{booking.VoucherCode}' đã hết lượt sử dụng.");
                }

                // Tính toán tổng tiền dựa trên số đêm
                var currentTotal = booking.BookingDetails.Sum(d => d.PricePerNight * (decimal)(d.CheckOutDate - d.CheckInDate).TotalDays);
                
                if (voucher.MinBookingValue.HasValue && currentTotal < voucher.MinBookingValue.Value)
                {
                    throw new InvalidOperationException($"Giá trị booking không đủ tối thiểu cho voucher này.");
                }

                booking.VoucherId = voucher.Id;
                voucher.UsedCount++;
            }
            else
            {
                throw new InvalidOperationException($"Voucher '{booking.VoucherCode}' không tồn tại.");
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

            // Gán thông tin từ hold vào booking
            bookingData.RoomTypeId = hold.RoomTypeId;
            bookingData.CheckInDate = hold.CheckIn;
            bookingData.CheckOutDate = hold.CheckOut;

            // Tạo booking, loại trừ hold hiện tại khỏi kiểm tra số lượng phòng
            var booking = await CreateBookingAsync(bookingData, excludeHoldId: holdId);

            // Xóa hold sau khi đặt thành công
            _context.RoomHolds.Remove(hold);
            await _context.SaveChangesAsync();

            return booking;
        }

        /// <summary>
        /// Tính số phòng trống cho một loại phòng trong khoảng ngày.
        /// Nếu có excludeHoldId, sẽ không tính hold đó vào số lượng hold đang chiếm chỗ.
        /// </summary>
        private async Task<int> GetAvailableRoomCountAsync(int roomTypeId, DateTimeOffset checkIn, DateTimeOffset checkOut, int? excludeHoldId = null)
        {
            // 1. Đưa về chuẩn UTC Midnight (tránh bị lệch múi giờ làm lùi ngày)
            var adjustedCheckIn = new DateTimeOffset(checkIn.Date, TimeSpan.Zero);
            var adjustedCheckOut = new DateTimeOffset(checkOut.Date, TimeSpan.Zero);

            // 2. Tổng số phòng của loại này
            var totalRooms = await _context.Rooms.CountAsync(r => 
                r.RoomTypeId == roomTypeId && 
                (r.Status == null || r.Status.ToLower() == "available"));

            // 3. Số phòng đã được đặt (Sử dụng trực tiếp DateTimeOffset để so sánh)
            var bookedCount = await _context.BookingDetails
                .Where(bd => bd.RoomTypeId == roomTypeId)
                .Where(bd => bd.CheckInDate < adjustedCheckOut && bd.CheckOutDate > adjustedCheckIn)
                .CountAsync();

            // 4. Số phòng đang bị giữ (RoomHold) chưa hết hạn
            var holdQuery = _context.RoomHolds
                .Where(h => h.RoomTypeId == roomTypeId)
                .Where(h => h.CheckIn < adjustedCheckOut && h.CheckOut > adjustedCheckIn)
                .Where(h => h.HoldExpiry > DateTimeOffset.UtcNow); // Dùng DateTimeOffset.UtcNow

            if (excludeHoldId.HasValue)
            {
                holdQuery = holdQuery.Where(h => h.Id != excludeHoldId.Value);
            }

            var holdCount = await holdQuery.CountAsync();

            // 5. Tính toán số lượng còn lại
            var available = Math.Max(0, totalRooms - bookedCount - holdCount);
    
            // Log để debug
            System.Console.WriteLine($"[GetAvailableRoomCount] RoomTypeId={roomTypeId}, CheckIn={adjustedCheckIn}, CheckOut={adjustedCheckOut}, Total={totalRooms}, Booked={bookedCount}, Hold={holdCount}, Available={available}");

            return available;
        }
        private string GenerateBookingCode()
        {
            return "BK" + DateTime.Now.ToString("yyyyMMddHHmmss") + new Random().Next(1000, 9999);
        }
    }
}