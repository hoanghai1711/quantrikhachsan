using HotelBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class TestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TestController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("db-connection")]
        public async Task<IActionResult> TestDbConnection()
        {
            try
            {
                // Test connection by querying database
                var canConnect = await _context.Database.CanConnectAsync();
                if (canConnect)
                {
                    // Try to get a simple count
                    var userCount = await _context.Users.CountAsync();
                    return Ok(new
                    {
                        status = "Connected",
                        message = "Database connection successful",
                        userCount = userCount
                    });
                }
                else
                {
                    return StatusCode(500, new
                    {
                        status = "Failed",
                        message = "Cannot connect to database"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "Error",
                    message = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("rooms")]
        public async Task<IActionResult> GetRoomsStatus()
        {
            var rooms = await _context.Rooms.Select(r => new { r.Id, r.RoomNumber, r.Status, r.CleaningStatus }).ToListAsync();
            return Ok(rooms);
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetData()
        {
            try {
                // Aggressive reset using CASCADE
                await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"Bookings\", \"Room_Holds\", \"Notifications\", \"Audit_Logs\", \"Order_Services\", \"Invoices\", \"Payments\" RESTART IDENTITY CASCADE");
                
                return Ok(new { message = "Data reset successfully" });
            } catch (Exception ex) {
                return StatusCode(500, new { message = ex.Message, inner = ex.InnerException?.Message });
            }
        }
    }
}