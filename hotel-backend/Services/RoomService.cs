using System.Collections.Generic;
using System.Data;
using HotelBackend.Data;
using HotelBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Services
{
    public class RoomService : IRoomService
    {
        private readonly ApplicationDbContext _context;

        public RoomService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RoomType>> GetRoomTypesAsync()
        {
            return await _context.RoomTypes
                .Include(rt => rt.RoomImages)
                .ToListAsync();
        }

        public async Task<RoomType?> GetRoomTypeByIdAsync(int id)
        {
            return await _context.RoomTypes
                .Include(rt => rt.RoomImages)
                .FirstOrDefaultAsync(rt => rt.Id == id);
        }

        public async Task<RoomType> CreateRoomTypeAsync(RoomType roomType)
        {
            _context.RoomTypes.Add(roomType);
            await _context.SaveChangesAsync();
            return roomType;
        }

        public async Task<bool> UpdateRoomTypeAsync(int id, RoomType roomType)
        {
            var existingRoomType = await _context.RoomTypes.FindAsync(id);
            if (existingRoomType == null) return false;

            existingRoomType.Name = roomType.Name;
            existingRoomType.Description = roomType.Description;
            existingRoomType.BasePrice = roomType.BasePrice;
            existingRoomType.MaxOccupancy = roomType.MaxOccupancy;
            existingRoomType.Size = roomType.Size;
            existingRoomType.IsActive = roomType.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteRoomTypeAsync(int id)
        {
            var roomType = await _context.RoomTypes.FindAsync(id);
            if (roomType == null) return false;

            _context.RoomTypes.Remove(roomType);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Room>> GetRoomsAsync()
        {
            return await _context.Rooms
                .Include(r => r.RoomType)
                .ToListAsync();
        }

        public async Task<Room?> GetRoomByIdAsync(int id)
        {
            return await _context.Rooms
                .Include(r => r.RoomType)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

       public async Task<Room> CreateRoomAsync(Room room)
{
    // Gán các giá trị mặc định nếu cần
    room.Status ??= "Available";
    room.CleaningStatus ??= "Clean";   // nếu có field này
    _context.Rooms.Add(room);
    await _context.SaveChangesAsync();
    return room;   // phải trả về chính entity đã được lưu (có Id)
}

        public async Task<bool> UpdateRoomAsync(int id, Room room)
        {
            var existingRoom = await _context.Rooms.FindAsync(id);
            if (existingRoom == null) return false;

            existingRoom.RoomTypeId = room.RoomTypeId;
            existingRoom.RoomNumber = room.RoomNumber;
            existingRoom.Status = room.Status;
            existingRoom.Floor = room.Floor;
            

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteRoomAsync(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return false;

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateRoomCleaningStatusAsync(int roomId, string cleaningStatus)
        {
            var room = await _context.Rooms.FindAsync(roomId);
            if (room == null) return false;

            room.CleaningStatus = cleaningStatus;
            if (cleaningStatus.Equals("Clean", StringComparison.OrdinalIgnoreCase))
            {
                room.Status = "Available";
            }
            else if (cleaningStatus.Equals("Cleaning", StringComparison.OrdinalIgnoreCase))
            {
                room.Status = "Cleaning";
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Room>> GetCleaningRoomsAsync()
        {
            var now = DateTime.Now;
            var cleaningRoomIds = await _context.BookingDetails
                .Where(bd => bd.RoomId.HasValue && bd.CheckOutDate <= now)
                .Where(bd => bd.Booking != null && bd.Booking.Status != "Cancelled")
                .Select(bd => bd.RoomId!.Value)
                .Distinct()
                .ToListAsync();

            return await _context.Rooms
                .Include(r => r.RoomType)
                .Include(r => r.BookingDetails)
                .Where(r => r.Status == "Cleaning" || (r.Status == "Occupied" && cleaningRoomIds.Contains(r.Id)))
                .ToListAsync();
        }

        public async Task<IEnumerable<Room>> GetAvailableRoomsAsync(DateTime checkIn, DateTime checkOut, int? roomTypeId = null, decimal? minPrice = null, decimal? maxPrice = null, int? quantity = null)
        {
            if (checkIn >= checkOut)
            {
                throw new ArgumentException("Ngày đến phải trước ngày đi");
            }

            using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            var bookedRoomIds = await _context.BookingDetails
                .Where(bd => bd.RoomId.HasValue)
                .Where(bd => bd.CheckInDate < checkOut && bd.CheckOutDate > checkIn)
                .Where(bd => bd.Booking != null && bd.Booking.Status != "Cancelled")
                .Select(bd => bd.RoomId!.Value)
                .Distinct()
                .ToListAsync();

            var query = _context.Rooms
                .Include(r => r.RoomType!)
                    .ThenInclude(rt => rt.RoomImages)
                .Include(r => r.RoomType!)
                    .ThenInclude(rt => rt.RoomAmenities)
                .Where(r => r.Status == "Available" && !bookedRoomIds.Contains(r.Id));

            if (roomTypeId.HasValue)
            {
                query = query.Where(r => r.RoomTypeId == roomTypeId.Value);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(r => r.RoomType != null && r.RoomType.BasePrice >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(r => r.RoomType != null && r.RoomType.BasePrice <= maxPrice.Value);
            }

            if (quantity.HasValue && quantity.Value > 0)
            {
                query = query.Take(quantity.Value);
            }

            var availableRooms = await query.ToListAsync();
            await transaction.CommitAsync();
            return availableRooms;
        }

        public async Task<bool> UpdateRoomStatusAsync(int roomId, string status)
        {
            var room = await _context.Rooms.FindAsync(roomId);
            if (room == null) return false;

            room.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<RoomImage> AddRoomImageAsync(int roomTypeId, string imageUrl, bool isPrimary = false)
        {
            var roomType = await _context.RoomTypes.FindAsync(roomTypeId);
            if (roomType == null) throw new ArgumentException("Room type not found");

            if (isPrimary)
            {
                // Set all other images to not primary
                var existingImages = await _context.RoomImages.Where(ri => ri.RoomTypeId == roomTypeId).ToListAsync();
                foreach (var img in existingImages)
                {
                    img.IsPrimary = false;
                }
            }

            var roomImage = new RoomImage
            {
                RoomTypeId = roomTypeId,
                ImageUrl = imageUrl,
                IsPrimary = isPrimary,
                IsActive = true
            };

            _context.RoomImages.Add(roomImage);
            await _context.SaveChangesAsync();
            return roomImage;
        }

        public async Task<bool> RemoveRoomImageAsync(int imageId)
        {
            var image = await _context.RoomImages.FindAsync(imageId);
            if (image == null) return false;

            _context.RoomImages.Remove(image);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetPrimaryImageAsync(int imageId)
        {
            var image = await _context.RoomImages.FindAsync(imageId);
            if (image == null) return false;

            // Set all images for this room type to not primary
            var images = await _context.RoomImages.Where(ri => ri.RoomTypeId == image.RoomTypeId).ToListAsync();
            foreach (var img in images)
            {
                img.IsPrimary = false;
            }

            image.IsPrimary = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<RoomHold> CreateRoomHoldAsync(int roomTypeId, DateTime checkIn, DateTime checkOut)
        {
            // Check if room type exists
            var roomType = await _context.RoomTypes.FindAsync(roomTypeId);
            if (roomType == null)
                throw new ArgumentException("Room type not found");

            // Check availability (similar to GetAvailableRoomsAsync)
            var bookedRoomIds = await _context.BookingDetails
                .Where(bd => bd.RoomId.HasValue)
                .Where(bd => bd.CheckInDate < checkOut && bd.CheckOutDate > checkIn)
                .Where(bd => bd.Booking != null && bd.Booking.Status != "Cancelled")
                .Select(bd => bd.RoomId!.Value)
                .Distinct()
                .ToListAsync();

            var availableRooms = await _context.Rooms
                .Where(r => r.RoomTypeId == roomTypeId && r.Status == "Available" && !bookedRoomIds.Contains(r.Id))
                .ToListAsync();

            if (!availableRooms.Any())
                throw new InvalidOperationException("No available rooms for the selected dates");

            // Check existing holds
            var conflictingHolds = await _context.RoomHolds
                .Where(h => h.RoomTypeId == roomTypeId)
                .Where(h => h.CheckIn < checkOut && h.CheckOut > checkIn)
                .Where(h => h.HoldExpiry > DateTime.UtcNow)
                .ToListAsync();

            if (availableRooms.Count <= conflictingHolds.Count)
                throw new InvalidOperationException("No available rooms for the selected dates (including holds)");

            var hold = new RoomHold
            {
                RoomTypeId = roomTypeId,
                CheckIn = checkIn,
                CheckOut = checkOut,
                HoldExpiry = DateTime.UtcNow.AddMinutes(15),
                CreatedAt = DateTime.UtcNow
            };

            _context.RoomHolds.Add(hold);
            await _context.SaveChangesAsync();
            return hold;
        }

        public async Task<bool> ReleaseRoomHoldAsync(int holdId)
        {
            var hold = await _context.RoomHolds.FindAsync(holdId);
            if (hold == null) return false;

            _context.RoomHolds.Remove(hold);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}