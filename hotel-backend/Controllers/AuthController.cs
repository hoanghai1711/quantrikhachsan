using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using HotelBackend.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var (success, token, message, user) = await _authService.LoginAsync(request.Email, request.Password);

                if (!success || user == null)
                    return BadRequest(new { message });

                return Ok(new { token, user = MapUserDto(user), message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var (success, token, message, user) = await _authService.RegisterAsync(request.Email, request.Password, request.FullName, request.Phone);
                if (!success || user == null)
                    return BadRequest(new { message });

                return Ok(new { token, user = MapUserDto(user), message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            try
            {
                if (!User.Identity?.IsAuthenticated ?? true)
                    return Unauthorized();

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out var userId))
                    return Unauthorized();

                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null)
                    return Unauthorized();

                return Ok(new { user = MapUserDto(user) });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // Hàm chuyển đổi User 
        private static object MapUserDto(Models.User user)
        {
            return new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                role = user.Role?.Name?.ToLowerInvariant() ?? string.Empty
                // Không trả về permissions
            };
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string FullName { get; set; } = "";
        public string Phone { get; set; } = "";
    }
}