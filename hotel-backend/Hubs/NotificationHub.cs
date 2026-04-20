using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace HotelBackend.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            if (Context.User?.Identity?.IsAuthenticated == true)
            {
                var userId = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"User-{userId}");
                }

                var roles = Context.User.FindAll(ClaimTypes.Role).Select(role => role.Value).Where(role => !string.IsNullOrEmpty(role));
                foreach (var role in roles)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, role);
                }
            }

            await base.OnConnectedAsync();
        }
    }

    public class NotificationPayload
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "info";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public int? RelatedId { get; set; }
    }
}
