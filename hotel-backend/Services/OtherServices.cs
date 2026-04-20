using HotelBackend.Data;
using HotelBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace HotelBackend.Services
{
    public class ServiceService : IServiceService
    {
        private readonly ApplicationDbContext _context;

        public ServiceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Service>> GetServicesAsync()
        {
            return await _context.Services
                .Include(s => s.Category)
                .Where(s => s.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<ServiceCategory>> GetServiceCategoriesAsync()
        {
            return await _context.ServiceCategories.ToListAsync();
        }

        public async Task<Service?> GetServiceByIdAsync(int id)
        {
            return await _context.Services.FindAsync(id);
        }

        public async Task<Service> CreateServiceAsync(Service service)
        {
            service.IsActive = true;
            _context.Services.Add(service);
            await _context.SaveChangesAsync();
            return service;
        }

        public async Task<bool> UpdateServiceAsync(int id, Service service)
        {
            var existing = await _context.Services.FindAsync(id);
            if (existing == null) return false;

            existing.Name = service.Name ?? existing.Name;
            existing.Description = service.Description ?? existing.Description;
            existing.CategoryId = service.CategoryId;
            existing.Price = service.Price != 0 ? service.Price : existing.Price;
            existing.IsActive = service.IsActive;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteServiceAsync(int id)
        {
            var existing = await _context.Services.FindAsync(id);
            if (existing == null) return false;

            _context.Services.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleServiceAsync(int id)
        {
            var existing = await _context.Services.FindAsync(id);
            if (existing == null) return false;

            existing.IsActive = !existing.IsActive;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<OrderService> CreateOrderServiceAsync(int bookingId, int serviceId, int quantity)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null)
            {
                throw new ArgumentException("Booking không tồn tại");
            }

            var service = await _context.Services.FindAsync(serviceId);
            if (service == null)
            {
                throw new ArgumentException("Service không tồn tại");
            }

            if (quantity <= 0)
            {
                throw new ArgumentException("Số lượng phải lớn hơn 0");
            }

            var order = new OrderService
            {
                BookingId = bookingId,
                OrderDate = DateTime.Now,
                Status = "Pending",
                TotalAmount = service.Price * quantity,
                OrderServiceDetails = new List<OrderServiceDetail>
                {
                    new OrderServiceDetail
                    {
                        ServiceId = serviceId,
                        Quantity = quantity,
                        UnitPrice = service.Price,
                        Subtotal = service.Price * quantity
                    }
                }
            };

            _context.OrderServices.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }
    }

    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly MomoOptions _momoOptions;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IEmailService _emailService;

        public PaymentService(ApplicationDbContext context, IOptions<MomoOptions> momoOptions, IHttpClientFactory httpClientFactory, IEmailService emailService)
        {
            _context = context;
            _momoOptions = momoOptions.Value;
            _httpClientFactory = httpClientFactory;
            _emailService = emailService;
        }

        public async Task<Invoice> GetInvoiceAsync(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .Include(b => b.Invoice)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
            {
                throw new InvalidOperationException($"Booking {bookingId} not found.");
            }

            if (booking.Invoice != null)
            {
                return booking.Invoice;
            }

            var roomCharges = booking.BookingDetails.Sum(bd => bd.Subtotal);
            var serviceCharges = await _context.OrderServices
                .Where(os => os.BookingId == bookingId)
                .SumAsync(os => os.TotalAmount);
            var damageCharges = await _context.LossAndDamages
                .Include(ld => ld.BookingDetail)
                .Where(ld => ld.BookingDetail != null && ld.BookingDetail.BookingId == bookingId)
                .SumAsync(ld => ld.PenaltyAmount);
            var discountAmount = booking.DiscountAmount;
            var taxAmount = Math.Round((roomCharges + serviceCharges + damageCharges - discountAmount) * 0.1m, 2);
            var finalTotal = Math.Max(0m, roomCharges + serviceCharges + damageCharges - discountAmount + taxAmount);

            var invoice = new Invoice
            {
                BookingId = bookingId,
                TotalRoomAmount = roomCharges,
                TotalServiceAmount = serviceCharges,
                TotalDamageAmount = damageCharges,
                DiscountAmount = discountAmount,
                TaxAmount = taxAmount,
                FinalTotal = finalTotal,
                Status = "Unpaid",
                CreatedAt = DateTime.Now
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();
            return invoice;
        }

        public async Task<object> GetInvoiceDtoAsync(int bookingId)
        {
            var invoice = await GetInvoiceAsync(bookingId);
            
            // Tính totalPaid từ Payments
            var totalPaid = await _context.Payments
                .Where(p => p.InvoiceId == invoice.Id)
                .SumAsync(p => p.Amount);

            // Cập nhật invoice status nếu cần
            if (totalPaid >= invoice.FinalTotal && invoice.Status != "Paid")
            {
                invoice.Status = "Paid";
                invoice.PaidAt = DateTime.Now;
                await _context.SaveChangesAsync();
            }
            else if (totalPaid > 0 && totalPaid < invoice.FinalTotal && invoice.Status == "Unpaid")
            {
                invoice.Status = "Partial";
                await _context.SaveChangesAsync();
            }

            return new
            {
                id = invoice.Id,
                bookingId = invoice.BookingId,
                totalRoomAmount = invoice.TotalRoomAmount,
                totalServiceAmount = invoice.TotalServiceAmount,
                totalDamageAmount = invoice.TotalDamageAmount,
                discountAmount = invoice.DiscountAmount,
                taxAmount = invoice.TaxAmount,
                finalTotal = invoice.FinalTotal,
                totalPaid = totalPaid,
                status = invoice.Status,
                createdAt = invoice.CreatedAt,
                paidAt = invoice.PaidAt,
                // Aliases for frontend compatibility
                lossAndDamageCost = invoice.TotalDamageAmount
            };
        }

        public async Task<Payment> CreatePaymentAsync(Payment payment)
        {
            payment.PaymentDate = DateTime.Now;
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            return payment;
        }

        public async Task<MomoCreatePaymentResult> CreateMomoPaymentAsync(int bookingId, decimal? amount, string? orderInfo)
        {
            if (string.IsNullOrWhiteSpace(_momoOptions.MomoApiUrl)
                || string.IsNullOrWhiteSpace(_momoOptions.PartnerCode)
                || string.IsNullOrWhiteSpace(_momoOptions.AccessKey)
                || string.IsNullOrWhiteSpace(_momoOptions.SecretKey)
                || string.IsNullOrWhiteSpace(_momoOptions.ReturnUrl)
                || string.IsNullOrWhiteSpace(_momoOptions.NotifyUrl))
            {
                return new MomoCreatePaymentResult
                {
                    Success = false,
                    Message = "Cau hinh MoMo chua day du trong appsettings.json"
                };
            }

            var invoice = await GetInvoiceAsync(bookingId);
            var totalPaid = await _context.Payments
                .Where(p => p.InvoiceId == invoice.Id)
                .SumAsync(p => p.Amount);

            var remaining = Math.Max(0, invoice.FinalTotal - totalPaid);
            if (remaining <= 0)
            {
                return new MomoCreatePaymentResult
                {
                    Success = false,
                    Message = "Hoa don da duoc thanh toan day du",
                    InvoiceId = invoice.Id
                };
            }

            var amountToPay = amount ?? remaining;
            if (amountToPay <= 0)
            {
                return new MomoCreatePaymentResult
                {
                    Success = false,
                    Message = "So tien thanh toan phai lon hon 0",
                    InvoiceId = invoice.Id
                };
            }

            if (amountToPay > remaining)
            {
                amountToPay = remaining;
            }

            var orderId = $"INV{invoice.Id}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            var paymentOrderInfo = string.IsNullOrWhiteSpace(orderInfo)
                ? $"Thanh toan hoa don {invoice.Id}"
                : orderInfo.Trim();
            var extraData = Convert.ToBase64String(Encoding.UTF8.GetBytes($"invoiceId={invoice.Id}"));

            return await CreateMomoPaymentRequestAsync(invoice.Id, amountToPay, paymentOrderInfo, extraData, orderId);
        }

        private async Task<MomoCreatePaymentResult> CreateMomoPaymentRequestAsync(
            int invoiceId,
            decimal amountToPay,
            string paymentOrderInfo,
            string extraData,
            string orderId)
        {
            var momoAmount = decimal.ToInt64(Math.Round(amountToPay, 0, MidpointRounding.AwayFromZero));
            if (momoAmount <= 0)
            {
                momoAmount = 1;
            }

            var requestId = orderId;

            var rawData =
                $"partnerCode={_momoOptions.PartnerCode}&accessKey={_momoOptions.AccessKey}&requestId={requestId}&amount={momoAmount}&orderId={orderId}&orderInfo={paymentOrderInfo}&returnUrl={_momoOptions.ReturnUrl}&notifyUrl={_momoOptions.NotifyUrl}&extraData={extraData}";

            var signature = ComputeHmacSha256(rawData, _momoOptions.SecretKey);

            var requestData = new
            {
                accessKey = _momoOptions.AccessKey,
                partnerCode = _momoOptions.PartnerCode,
                requestType = _momoOptions.RequestType,
                notifyUrl = _momoOptions.NotifyUrl,
                returnUrl = _momoOptions.ReturnUrl,
                orderId,
                amount = momoAmount.ToString(CultureInfo.InvariantCulture),
                orderInfo = paymentOrderInfo,
                requestId,
                extraData,
                signature
            };

            var requestJson = JsonSerializer.Serialize(requestData);
            var client = _httpClientFactory.CreateClient();
            using var requestContent = new StringContent(requestJson, Encoding.UTF8, "application/json");
            var response = await client.PostAsync(_momoOptions.MomoApiUrl, requestContent);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return new MomoCreatePaymentResult
                {
                    Success = false,
                    Message = $"MoMo API error {(int)response.StatusCode}",
                    RawResponse = responseContent,
                    OrderId = orderId,
                    Amount = momoAmount,
                    InvoiceId = invoiceId
                };
            }

            try
            {
                using var jsonDocument = JsonDocument.Parse(responseContent);
                var root = jsonDocument.RootElement;

                var errorCode = GetJsonValue(root, "errorCode") ?? GetJsonValue(root, "resultCode");
                var message = GetJsonValue(root, "message");
                var payUrl = GetJsonValue(root, "payUrl");

                if (!string.Equals(errorCode, "0", StringComparison.OrdinalIgnoreCase))
                {
                    return new MomoCreatePaymentResult
                    {
                        Success = false,
                        Message = message ?? "MoMo tra ve loi",
                        RawResponse = responseContent,
                        OrderId = orderId,
                        Amount = momoAmount,
                        InvoiceId = invoiceId
                    };
                }

                return new MomoCreatePaymentResult
                {
                    Success = !string.IsNullOrWhiteSpace(payUrl),
                    Message = string.IsNullOrWhiteSpace(payUrl)
                        ? "Khong lay duoc payUrl tu MoMo"
                        : "Tao link thanh toan thanh cong",
                    PayUrl = payUrl,
                    RawResponse = responseContent,
                    OrderId = orderId,
                    Amount = momoAmount,
                    InvoiceId = invoiceId
                };
            }
            catch (JsonException)
            {
                return new MomoCreatePaymentResult
                {
                    Success = false,
                    Message = "Khong doc duoc phan hoi tu MoMo",
                    RawResponse = responseContent,
                    OrderId = orderId,
                    Amount = momoAmount,
                    InvoiceId = invoiceId
                };
            }
        }

        public async Task<MomoPaymentCallbackResult> HandleMomoPaymentResultAsync(MomoPaymentResultRequest request)
        {
            if (request == null)
            {
                return new MomoPaymentCallbackResult
                {
                    Success = false,
                    Message = "Du lieu callback khong hop le"
                };
            }

            var errorCode = string.IsNullOrWhiteSpace(request.ErrorCode)
                ? request.ResultCode
                : request.ErrorCode;
            var orderId = request.OrderId;

            var invoiceId = TryExtractInvoiceId(request.ExtraData, orderId);

            if (!invoiceId.HasValue)
            {
                return new MomoPaymentCallbackResult
                {
                    Success = false,
                    Message = "Khong xac dinh duoc invoiceId",
                    OrderId = orderId,
                    ErrorCode = errorCode
                };
            }

            if (!string.Equals(errorCode, "0", StringComparison.OrdinalIgnoreCase))
            {
                return new MomoPaymentCallbackResult
                {
                    Success = false,
                    Message = request.Message ?? "Giao dich khong thanh cong",
                    InvoiceId = invoiceId,
                    OrderId = orderId,
                    ErrorCode = errorCode
                };
            }

            var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == invoiceId.Value);
            if (invoice == null)
            {
                return new MomoPaymentCallbackResult
                {
                    Success = false,
                    Message = "Khong tim thay hoa don",
                    InvoiceId = invoiceId,
                    OrderId = orderId,
                    ErrorCode = errorCode
                };
            }

            var transactionId = !string.IsNullOrWhiteSpace(request.TransId)
                ? request.TransId
                : request.OrderId;

            if (string.IsNullOrWhiteSpace(transactionId))
            {
                return new MomoPaymentCallbackResult
                {
                    Success = false,
                    Message = "Thieu transaction id",
                    InvoiceId = invoice.Id,
                    OrderId = orderId,
                    ErrorCode = errorCode
                };
            }

            var existed = await _context.Payments.FirstOrDefaultAsync(p => p.TransactionId == transactionId);
            if (existed != null)
            {
                return new MomoPaymentCallbackResult
                {
                    Success = true,
                    Message = "Giao dich da duoc ghi nhan truoc do",
                    InvoiceId = invoice.Id,
                    OrderId = orderId,
                    TransactionId = transactionId,
                    Amount = existed.Amount,
                    ErrorCode = errorCode
                };
            }

            var amount = ParseAmount(request.Amount);
            var totalPaid = await _context.Payments
                .Where(p => p.InvoiceId == invoice.Id)
                .SumAsync(p => p.Amount);

            var remaining = Math.Max(0, invoice.FinalTotal - totalPaid);
            if (remaining <= 0)
            {
                return new MomoPaymentCallbackResult
                {
                    Success = true,
                    Message = "Hoa don da duoc thanh toan day du",
                    InvoiceId = invoice.Id,
                    OrderId = orderId,
                    TransactionId = transactionId,
                    Amount = 0,
                    ErrorCode = errorCode
                };
            }

            if (amount <= 0)
            {
                amount = remaining;
            }

            if (amount > remaining)
            {
                amount = remaining;
            }

            var payment = new Payment
            {
                InvoiceId = invoice.Id,
                PaymentMethod = "MoMo",
                Amount = amount,
                TransactionId = transactionId,
                PaymentDate = DateTime.Now,
                Notes = request.Message
            };

            _context.Payments.Add(payment);

            var newTotalPaid = totalPaid + amount;
            if (newTotalPaid >= invoice.FinalTotal)
            {
                invoice.Status = "Paid";
                invoice.PaidAt = DateTime.Now;

                // Update membership points if booking is checked out
                var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == invoice.BookingId);
                if (booking != null && booking.Status == "CheckedOut" && booking.UserId > 0)
                {
                    var membership = await _context.Memberships.FirstOrDefaultAsync(m => m.UserId == booking.UserId);
                    if (membership == null)
                    {
                        membership = new Membership
                        {
                            UserId = booking.UserId,
                            Level = "Bronze",
                            Points = 0,
                            JoinedAt = DateTime.Now,
                            LastUpdated = DateTime.Now
                        };
                        _context.Memberships.Add(membership);
                    }

                    var earnedPoints = (int)Math.Floor(invoice.FinalTotal / 10000m);
                    membership.Points += earnedPoints;
                    membership.LastUpdated = DateTime.Now;

                    if (membership.Points >= 5000)
                    {
                        membership.Level = "Gold";
                    }
                    else if (membership.Points >= 1000)
                    {
                        membership.Level = "Silver";
                    }
                    else
                    {
                        membership.Level = "Bronze";
                    }
                }
            }
            else
            {
                invoice.Status = "Partial";
            }

            await _context.SaveChangesAsync();

            return new MomoPaymentCallbackResult
            {
                Success = true,
                Message = "Da ghi nhan thanh toan",
                InvoiceId = invoice.Id,
                OrderId = orderId,
                TransactionId = transactionId,
                Amount = amount,
                ErrorCode = errorCode
            };
        }

        private static decimal ParseAmount(string? rawAmount)
        {
            if (string.IsNullOrWhiteSpace(rawAmount))
            {
                return 0;
            }

            if (decimal.TryParse(rawAmount, NumberStyles.Number, CultureInfo.InvariantCulture, out var amount))
            {
                return amount;
            }

            if (decimal.TryParse(rawAmount, NumberStyles.Number, CultureInfo.CurrentCulture, out amount))
            {
                return amount;
            }

            return 0;
        }

        private static int? TryExtractInvoiceId(string? extraData, string? orderId)
        {
            var fromExtraData = TryExtractInvoiceIdFromExtraData(extraData);
            if (fromExtraData.HasValue)
            {
                return fromExtraData;
            }

            if (string.IsNullOrWhiteSpace(orderId) || !orderId.StartsWith("INV", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            var payload = orderId.Substring(3);
            var separatorIndex = payload.IndexOf('-');
            if (separatorIndex > 0)
            {
                payload = payload[..separatorIndex];
            }

            if (int.TryParse(payload, out var invoiceId))
            {
                return invoiceId;
            }

            return null;
        }

        private static int? TryExtractInvoiceIdFromExtraData(string? extraData)
        {
            if (string.IsNullOrWhiteSpace(extraData))
            {
                return null;
            }

            if (int.TryParse(extraData, out var rawInvoiceId))
            {
                return rawInvoiceId;
            }

            try
            {
                var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(extraData));
                if (decoded.StartsWith("invoiceId=", StringComparison.OrdinalIgnoreCase))
                {
                    decoded = decoded.Substring("invoiceId=".Length);
                }

                if (int.TryParse(decoded, out var invoiceId))
                {
                    return invoiceId;
                }
            }
            catch (FormatException)
            {
                if (extraData.StartsWith("invoiceId=", StringComparison.OrdinalIgnoreCase))
                {
                    var rawValue = extraData.Substring("invoiceId=".Length);
                    if (int.TryParse(rawValue, out var invoiceId))
                    {
                        return invoiceId;
                    }
                }
            }

            return null;
        }

        private static string? GetJsonValue(JsonElement root, string propertyName)
        {
            if (!root.TryGetProperty(propertyName, out var value))
            {
                return null;
            }

            return value.ValueKind switch
            {
                JsonValueKind.String => value.GetString(),
                JsonValueKind.Number => value.GetRawText(),
                JsonValueKind.True => "true",
                JsonValueKind.False => "false",
                _ => value.GetRawText()
            };
        }

        private static string ComputeHmacSha256(string message, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var messageBytes = Encoding.UTF8.GetBytes(message);

            using var hmac = new HMACSHA256(keyBytes);
            var hashBytes = hmac.ComputeHash(messageBytes);
            return Convert.ToHexString(hashBytes).ToLowerInvariant();
        }

        public async Task<bool> CheckOutAsync(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.Id == bookingId);
            if (booking == null) return false;

            using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            var invoice = await GetInvoiceAsync(bookingId);

            var damageCharges = await _context.LossAndDamages
                .Include(ld => ld.BookingDetail)
                .Where(ld => ld.BookingDetail != null && ld.BookingDetail.BookingId == bookingId)
                .SumAsync(ld => ld.PenaltyAmount);

            var roomCharges = booking.BookingDetails.Sum(d => d.Subtotal);
            var serviceCharges = await _context.OrderServices
                .Where(os => os.BookingId == bookingId)
                .SumAsync(os => os.TotalAmount);

            decimal lateEarlyAdjustment = 0m;
            var actualCheckOutDate = DateTime.Now.Date;

            foreach (var detail in booking.BookingDetails)
            {
                if (detail.CheckOutDate.Date < actualCheckOutDate)
                {
                    var extraDays = (actualCheckOutDate - detail.CheckOutDate.Date).Days;
                    lateEarlyAdjustment += detail.PricePerNight * extraDays;
                }
                else if (detail.CheckOutDate.Date > actualCheckOutDate)
                {
                    var earlyDays = (detail.CheckOutDate.Date - actualCheckOutDate).Days;
                    lateEarlyAdjustment -= detail.PricePerNight * earlyDays * 0.5m;
                }
            }

            invoice.TotalRoomAmount = roomCharges;
            invoice.TotalServiceAmount = serviceCharges;
            invoice.TotalDamageAmount = damageCharges;
            invoice.TaxAmount = Math.Round((roomCharges + serviceCharges + damageCharges - invoice.DiscountAmount + lateEarlyAdjustment) * 0.1m, 2);
            invoice.FinalTotal = Math.Max(0m, roomCharges + serviceCharges + damageCharges - invoice.DiscountAmount + lateEarlyAdjustment + invoice.TaxAmount);

            var totalPaid = await _context.Payments
                .Where(p => p.InvoiceId == invoice.Id)
                .SumAsync(p => p.Amount);

            if (totalPaid >= invoice.FinalTotal)
            {
                invoice.Status = "Paid";
                invoice.PaidAt = DateTime.Now;
            }
            else
            {
                invoice.Status = "Unpaid";
            }

            foreach (var detail in booking.BookingDetails.Where(bd => bd.RoomId.HasValue))
            {
                var room = await _context.Rooms.FindAsync(detail.RoomId!.Value);
                if (room != null)
                {
                    room.Status = "Cleaning";
                }
            }

            booking.Status = "CheckedOut";

            if (booking.UserId > 0)
            {
                var membership = await _context.Memberships.FirstOrDefaultAsync(m => m.UserId == booking.UserId);
                if (membership == null)
                {
                    membership = new Membership
                    {
                        UserId = booking.UserId,
                        Level = "Bronze",
                        Points = 0,
                        JoinedAt = DateTime.Now,
                        LastUpdated = DateTime.Now
                    };
                    _context.Memberships.Add(membership);
                }

                var earnedPoints = (int)Math.Floor(invoice.FinalTotal / 10000m);
                membership.Points += earnedPoints;
                membership.LastUpdated = DateTime.Now;

                if (membership.Points >= 5000)
                {
                    membership.Level = "Gold";
                }
                else if (membership.Points >= 1000)
                {
                    membership.Level = "Silver";
                }
                else
                {
                    membership.Level = "Bronze";
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            if (!string.IsNullOrEmpty(booking.GuestEmail))
            {
                await _emailService.QueueEmailAsync(booking.GuestEmail, "Check-out Confirmation", $"Your booking {booking.BookingCode} has been checked out. Total amount: {invoice.FinalTotal}");
            }

            return true;
        }
    }

    public class ContentService : IContentService
    {
        private readonly ApplicationDbContext _context;

        public ContentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Article>> GetArticlesAsync()
        {
            return await _context.Articles.Where(a => a.Status == "Published").ToListAsync();
        }

        public async Task<IEnumerable<Attraction>> GetAttractionsAsync()
        {
            return await _context.Attractions.Where(a => a.IsActive).ToListAsync();
        }

        public async Task<IEnumerable<Review>> GetPendingReviewsAsync()
        {
            return await _context.Reviews.Where(r => r.Status == "Pending").ToListAsync();
        }

        public async Task<bool> ApproveReviewAsync(int reviewId)
        {
            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null) return false;

            // Note: This method is deprecated. Use ReviewsController.ApproveReviewAsync() instead
            // which properly tracks the reviewer and handles RBAC
            review.Status = "Approved";
            review.ReviewedAt = DateTime.UtcNow;
            // Cannot set ReviewedBy here without context - set to system user (ID: 0) or null
            await _context.SaveChangesAsync();
            return true;
        }
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetUsersAsync()
        {
            return await _context.Users.Include(u => u.Role).ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsAsync(int page, int pageSize, string? filter, string? user, string? action, DateTime? from, DateTime? to)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(filter))
            {
                query = query.Where(a => (a.Action != null && a.Action.Contains(filter)) || (a.TableName != null && a.TableName.Contains(filter)));
            }

            if (!string.IsNullOrEmpty(user))
            {
                query = query.Where(a => a.UserId.ToString() == user);
            }

            if (!string.IsNullOrEmpty(action))
            {
                query = query.Where(a => a.Action != null && a.Action.Contains(action));
            }

            if (from.HasValue)
            {
                query = query.Where(a => a.Timestamp >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(a => a.Timestamp <= to.Value);
            }

            return await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}