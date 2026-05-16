using HotelBackend.Data;
using HotelBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Services
{
    /// <summary>
    /// Background service to clean up expired room holds
    /// Runs every 5 minutes to remove holds where hold_expiry <= DateTime.UtcNow
    /// </summary>
    public class RoomHoldCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<RoomHoldCleanupService> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromMinutes(5); // Check every 5 minutes

        public RoomHoldCleanupService(IServiceProvider serviceProvider, ILogger<RoomHoldCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("RoomHoldCleanupService started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupExpiredHoldsAsync();
                    await Task.Delay(_interval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    // Expected when the application is shutting down
                    _logger.LogInformation("RoomHoldCleanupService task was canceled during shutdown");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in RoomHoldCleanupService");
                }
            }

            _logger.LogInformation("RoomHoldCleanupService stopped");
        }

        private async Task CleanupExpiredHoldsAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                // Find all expired holds
                var expiredHolds = await dbContext.RoomHolds
                    .Where(h => h.HoldExpiry <= DateTime.UtcNow)
                    .ToListAsync();

                if (expiredHolds.Any())
                {
                    dbContext.RoomHolds.RemoveRange(expiredHolds);
                    await dbContext.SaveChangesAsync();
                    _logger.LogInformation($"Cleaned up {expiredHolds.Count} expired room holds");
                }
            }
        }
    }
}
