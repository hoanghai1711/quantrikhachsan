using HotelBackend.Data;
using HotelBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/membership")]
    [Authorize]
    public class MembershipController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MembershipController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyMembership()
        {
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("uid")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var membership = await _context.Memberships
                .FirstOrDefaultAsync(m => m.UserId == userId);

            if (membership == null)
            {
                return NotFound(new { message = "Chưa có thông tin membership" });
            }

            return Ok(membership);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Manager,Receptionist")]
        public async Task<IActionResult> GetAllMemberships()
        {
            var memberships = await _context.Memberships
                .Include(m => m.User)
                .ToListAsync();

            return Ok(memberships);
        }
    }
}