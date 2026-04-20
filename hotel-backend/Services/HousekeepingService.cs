using System;
using System.Data;
using System.Threading.Tasks;
using HotelBackend.Data;
using HotelBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Services
{
    public class HousekeepingService : IHousekeepingService
    {
        private readonly ApplicationDbContext _context;

        public HousekeepingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LossAndDamage> CreateLossAndDamageAsync(CreateLossAndDamageRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (request.Quantity <= 0)
                throw new ArgumentException("Quantity phải lớn hơn 0.");

            if (request.PenaltyAmount < 0)
                throw new ArgumentException("PenaltyAmount phải là số dương.");

            // Allow either BookingDetailId or RoomInventoryId
            if (!request.BookingDetailId.HasValue && !request.RoomInventoryId.HasValue)
                throw new ArgumentException("Phải có BookingDetailId hoặc RoomInventoryId.");

            BookingDetail? bookingDetail = null;
            if (request.BookingDetailId.HasValue)
            {
                bookingDetail = await _context.BookingDetails
                    .Include(bd => bd.Booking)
                    .ThenInclude(b => b.Invoice)
                    .FirstOrDefaultAsync(bd => bd.Id == request.BookingDetailId.Value);

                if (bookingDetail == null)
                    throw new ArgumentException("Booking detail không tồn tại.");
            }

            if (request.RoomInventoryId.HasValue)
            {
                var inventoryExists = await _context.RoomInventories.AnyAsync(ri => ri.Id == request.RoomInventoryId.Value);
                if (!inventoryExists)
                    throw new ArgumentException("Room inventory không tồn tại.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            var lossAndDamage = new LossAndDamage
            {
                BookingDetailId = request.BookingDetailId,
                RoomInventoryId = request.RoomInventoryId,
                Quantity = request.Quantity,
                PenaltyAmount = request.PenaltyAmount,
                Description = request.Description,
                ImageUrl = request.ImageUrl,
                CreatedAt = DateTime.UtcNow
            };

            _context.LossAndDamages.Add(lossAndDamage);

            // Only update invoice if there's a booking detail
            if (bookingDetail != null)
            {
                var invoice = bookingDetail.Booking?.Invoice;
                if (invoice == null)
                {
                    invoice = new Invoice
                    {
                        BookingId = bookingDetail.BookingId,
                        TotalRoomAmount = 0m,
                        TotalServiceAmount = 0m,
                        TotalDamageAmount = request.PenaltyAmount,
                        DiscountAmount = 0m,
                        TaxAmount = 0m,
                        FinalTotal = request.PenaltyAmount,
                        Status = "Unpaid",
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Invoices.Add(invoice);
                }
                else
                {
                    invoice.TotalDamageAmount += request.PenaltyAmount;
                    invoice.FinalTotal += request.PenaltyAmount;
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return lossAndDamage;
        }
    }
}
