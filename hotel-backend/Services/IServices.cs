using System.Collections.Generic;
using HotelBackend.Models;

namespace HotelBackend.Services
{
    public interface IAuthService
    {
        Task<(bool success, string token, string message, User? user)> LoginAsync(string email, string password);
        Task<(bool success, string token, string message, User? user)> RegisterAsync(string email, string password, string fullName, string phone);
        Task<User?> GetUserByIdAsync(int id);
    }

    public interface IRoomService
    {
        Task<IEnumerable<RoomType>> GetRoomTypesAsync();
        Task<RoomType?> GetRoomTypeByIdAsync(int id);
        Task<RoomType> CreateRoomTypeAsync(RoomType roomType);
        Task<bool> UpdateRoomTypeAsync(int id, RoomType roomType);
        Task<bool> DeleteRoomTypeAsync(int id);
        Task<IEnumerable<Room>> GetRoomsAsync();
        Task<Room?> GetRoomByIdAsync(int id);
        Task<Room> CreateRoomAsync(Room room);
        Task<bool> UpdateRoomAsync(int id, Room room);
        Task<bool> DeleteRoomAsync(int id);
        Task<IEnumerable<Room>> GetAvailableRoomsAsync(DateTime checkIn, DateTime checkOut, int? roomTypeId = null, decimal? minPrice = null, decimal? maxPrice = null, int? quantity = null);
        Task<bool> UpdateRoomStatusAsync(int roomId, string status);
        Task<bool> UpdateRoomCleaningStatusAsync(int roomId, string cleaningStatus);
        Task<IEnumerable<Room>> GetCleaningRoomsAsync();
        Task<RoomImage> AddRoomImageAsync(int roomTypeId, string imageUrl, bool isPrimary = false);
        Task<bool> RemoveRoomImageAsync(int imageId);
        Task<bool> SetPrimaryImageAsync(int imageId);
        Task<RoomHold> CreateRoomHoldAsync(int roomTypeId, DateTime checkIn, DateTime checkOut);
        Task<bool> ReleaseRoomHoldAsync(int holdId);
    }

    public interface IHousekeepingService
    {
        Task<LossAndDamage> CreateLossAndDamageAsync(CreateLossAndDamageRequest request);
    }

    public class CreateLossAndDamageRequest
    {
        public int? BookingDetailId { get; set; }
        public int? RoomInventoryId { get; set; }
        public int Quantity { get; set; }
        public decimal PenaltyAmount { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
    }

    public interface IBookingService
    {
        Task<Booking?> GetBookingByCodeAsync(string code);
        Task<Booking?> GetBookingByIdentifierAsync(string identifier, string type);
        Task<IEnumerable<Booking>> GetAllBookingsAsync();
        Task<IEnumerable<RoomType>> SearchAvailableRoomsAsync(DateTime checkIn, DateTime checkOut);
        Task<Booking> CreateBookingAsync(Booking booking);
        Task<bool> CheckInAsync(int bookingId, List<int> roomIds);
        Task<Booking> ConfirmBookingFromHoldAsync(int holdId, Booking bookingData);
    }

    public interface IServiceService
    {
        Task<IEnumerable<Service>> GetServicesAsync();
        Task<IEnumerable<ServiceCategory>> GetServiceCategoriesAsync();
        Task<Service?> GetServiceByIdAsync(int id);
        Task<Service> CreateServiceAsync(Service service);
        Task<bool> UpdateServiceAsync(int id, Service service);
        Task<bool> DeleteServiceAsync(int id);
        Task<bool> ToggleServiceAsync(int id);
        Task<OrderService> CreateOrderServiceAsync(int bookingId, int serviceId, int quantity);
    }

    public interface IPaymentService
    {
        Task<Invoice> GetInvoiceAsync(int bookingId);
        Task<object> GetInvoiceDtoAsync(int bookingId); // Returns InvoiceDto with totalPaid
        Task<Payment> CreatePaymentAsync(Payment payment);
        Task<MomoCreatePaymentResult> CreateMomoPaymentAsync(int bookingId, decimal? amount, string? orderInfo);
        Task<MomoPaymentCallbackResult> HandleMomoPaymentResultAsync(MomoPaymentResultRequest request);
        Task<bool> CheckOutAsync(int bookingId);
    }

    public interface IContentService
    {
        Task<IEnumerable<Article>> GetArticlesAsync();
        Task<IEnumerable<Attraction>> GetAttractionsAsync();
        Task<IEnumerable<Review>> GetPendingReviewsAsync();
        Task<bool> ApproveReviewAsync(int reviewId);
    }

    public interface IUserService
    {
        Task<IEnumerable<User>> GetUsersAsync();
        Task<IEnumerable<AuditLog>> GetAuditLogsAsync(int page, int pageSize, string? filter, string? user, string? action, DateTime? from, DateTime? to);
    }
}