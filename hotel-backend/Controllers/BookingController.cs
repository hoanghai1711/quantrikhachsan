using System;
using System.Collections.Generic;
using HotelBackend.Hubs;
using HotelBackend.Models;
using HotelBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IPaymentService _paymentService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public BookingController(IBookingService bookingService, IPaymentService paymentService, IHubContext<NotificationHub> hubContext)
        {
            _bookingService = bookingService;
            _paymentService = paymentService;
            _hubContext = hubContext;
        }

        [HttpGet("{code}")]
        public async Task<IActionResult> GetBooking(string code)
        {
            var booking = await _bookingService.GetBookingByCodeAsync(code);
            if (booking == null)
            {
                return NotFound();
            }
            return Ok(booking);
        }

        [HttpGet]
        public async Task<IActionResult> GetBookingByIdentifier([FromQuery] string? identifier = null, [FromQuery] string? type = null)
        {
            if (string.IsNullOrWhiteSpace(identifier))
            {
                var bookings = await _bookingService.GetAllBookingsAsync();
                return Ok(bookings);
            }

            var booking = await _bookingService.GetBookingByIdentifierAsync(identifier, type ?? "code");
            if (booking == null)
            {
                return NotFound();
            }
            return Ok(booking);
        }

        [HttpPost("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchAvailableRooms([FromBody] SearchRequest request)
        {
            var roomTypes = await _bookingService.SearchAvailableRoomsAsync(request.CheckIn, request.CheckOut);
            return Ok(roomTypes);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateBooking([FromBody] Booking booking)
        {
            var createdBooking = await _bookingService.CreateBookingAsync(booking);

            await _hubContext.Clients.Groups(new[] { "Admin", "Manager" })
                .SendAsync("ReceiveNotification", new NotificationPayload
                {
                    Title = "Đơn đặt phòng mới",
                    Message = $"Đơn đặt phòng {createdBooking.BookingCode} đã được tạo.",
                    Type = "success",
                    Timestamp = DateTime.UtcNow,
                    RelatedId = createdBooking.Id
                });

            return CreatedAtAction(nameof(GetBooking), new { code = createdBooking.BookingCode }, createdBooking);
        }

        [HttpPost("check-in")]
        [RequirePermission("booking.checkin")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
        {
            var success = await _bookingService.CheckInAsync(request.BookingId, request.RoomIds);
            if (!success)
            {
                return BadRequest();
            }
            return Ok();
        }

        [HttpGet("{bookingId}/invoice")]
        public async Task<IActionResult> GetInvoice(int bookingId)
        {
            var invoice = await _paymentService.GetInvoiceDtoAsync(bookingId);
            return Ok(invoice);
        }

        [HttpPost("{bookingId}/checkout")]
        public async Task<IActionResult> CheckOut(int bookingId)
        {
            var success = await _paymentService.CheckOutAsync(bookingId);
            if (!success)
            {
                return BadRequest(new { message = "Check-out thất bại" });
            }
            return Ok(new { message = "Check-out thành công" });
        }

        [HttpPost("payments")]
        public async Task<IActionResult> CreatePayment([FromBody] Payment payment)
        {
            if (payment.Amount <= 0)
            {
                return BadRequest(new { message = "Số tiền thanh toán phải lớn hơn 0" });
            }

            var created = await _paymentService.CreatePaymentAsync(payment);
            return CreatedAtAction(nameof(CreatePayment), created);
        }

        [HttpPost("{bookingId}/payments/momo")]
        public async Task<IActionResult> CreateMomoPayment(int bookingId, [FromBody] CreateMomoPaymentRequest? request)
        {
            var result = await _paymentService.CreateMomoPaymentAsync(bookingId, request?.Amount, request?.OrderInfo);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("payments/momo/callback")]
        public async Task<IActionResult> MomoCallback()
        {
            var payload = MapMomoRequestFromQuery(Request.Query);
            var result = await _paymentService.HandleMomoPaymentResultAsync(payload);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost("payments/momo/notify")]
        public async Task<IActionResult> MomoNotify([FromBody] MomoPaymentResultRequest request)
        {
            var result = await _paymentService.HandleMomoPaymentResultAsync(request);
            return Ok(result);
        }

        private static MomoPaymentResultRequest MapMomoRequestFromQuery(IQueryCollection query)
        {
            return new MomoPaymentResultRequest
            {
                PartnerCode = query["partnerCode"],
                AccessKey = query["accessKey"],
                RequestId = query["requestId"],
                Amount = query["amount"],
                OrderId = query["orderId"],
                OrderInfo = query["orderInfo"],
                OrderType = query["orderType"],
                TransId = query["transId"],
                Message = query["message"],
                LocalMessage = query["localMessage"],
                ResponseTime = query["responseTime"],
                ErrorCode = query["errorCode"],
                ResultCode = query["resultCode"],
                PayType = query["payType"],
                ExtraData = query["extraData"],
                Signature = query["signature"]
            };
        }

        [HttpPost("confirm/{holdId}")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmBookingFromHold(int holdId, [FromBody] Booking bookingData)
        {
            try
            {
                var booking = await _bookingService.ConfirmBookingFromHoldAsync(holdId, bookingData);
                return Ok(booking);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class SearchRequest
    {
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
    }

    public class CheckInRequest
    {
        public int BookingId { get; set; }
        public List<int> RoomIds { get; set; } = new();
    }

    public class CheckInRoomRequest
    {
        public int RoomId { get; set; }
    }
}