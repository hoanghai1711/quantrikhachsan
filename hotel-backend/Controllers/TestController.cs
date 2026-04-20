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
    }
}