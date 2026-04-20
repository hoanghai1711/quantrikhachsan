using System.Linq;
using System.Threading.Tasks;
using HotelBackend.Data;
using HotelBackend.Models;
using HotelBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ApplicationDbContext _context;

        public UsersController(IUserService userService, ApplicationDbContext context)
        {
            _userService = userService;
            _context = context;
        }

        [HttpGet("staff")]
        public async Task<IActionResult> GetStaff()
        {
            var users = await _userService.GetUsersAsync();
            var staff = users
                .Where(u => u.Role != null && u.Role.Name != null && u.Role.Name.ToLower() != "guest")
                .Select(u => MapUserDto(u));
            return Ok(staff);
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Role))
            {
                return BadRequest(new { message = "Vai trò không được để trống" });
            }

            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return NotFound(new { message = "Người dùng không tồn tại" });
            }

            var targetRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name.ToLower() == request.Role.ToLower());
            if (targetRole == null)
            {
                return BadRequest(new { message = "Vai trò không hợp lệ" });
            }

            user.RoleId = targetRole.Id;
            user.Role = targetRole;

            await _context.SaveChangesAsync();
            return Ok(MapUserDto(user));
        }

        private static object MapUserDto(User user)
        {
            return new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                role = user.Role?.Name?.ToLowerInvariant() ?? string.Empty
            };
        }
    }

    public class UpdateRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }
}
