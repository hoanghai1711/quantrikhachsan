using System;
using HotelBackend.Hubs;
using HotelBackend.Models;
using HotelBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/loss-and-damages")]
    [Authorize(Roles = "Housekeeping,Admin")]
    public class HousekeepingController : ControllerBase
    {
        private readonly IHousekeepingService _housekeepingService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public HousekeepingController(IHousekeepingService housekeepingService, IHubContext<NotificationHub> hubContext)
        {
            _housekeepingService = housekeepingService;
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> CreateLossAndDamage([FromBody] CreateLossAndDamageRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Yêu cầu không hợp lệ" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _housekeepingService.CreateLossAndDamageAsync(request);

                await _hubContext.Clients.Groups(new[] { "Admin", "Manager" })
                    .SendAsync("ReceiveNotification", new NotificationPayload
                    {
                        Title = "Báo cáo hư hỏng mới",
                        Message = $"Báo cáo hư hỏng mới đã được tạo với số tiền phạt {result.PenaltyAmount:N0}.",
                        Type = "warning",
                        Timestamp = DateTime.UtcNow,
                        RelatedId = result.Id
                    });

                return Created("", result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể tạo báo cáo hư hỏng", error = ex.Message });
            }
        }
    }
}
