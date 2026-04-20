using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BCrypt.Net;
using HotelBackend.Data;
using HotelBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HotelBackend.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<(bool success, string token, string message, User? user)> LoginAsync(string email, string password)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                    .ThenInclude(r => r.Permissions)
                .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);

            if (user == null)
                return (false, string.Empty, "Email không tồn tại hoặc tài khoản bị khóa", null);

            bool isValidPassword;
            try
            {
                isValidPassword = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            }
            catch
            {
                isValidPassword = false;
            }

            if (!isValidPassword)
                return (false, string.Empty, "Mật khẩu không đúng", null);

            var token = GenerateJwtToken(user);
            return (true, token, "Đăng nhập thành công", user);
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<(bool success, string token, string message, User? user)> RegisterAsync(string email, string password, string fullName, string phone)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (existingUser != null)
                return (false, string.Empty, "Email đã được sử dụng", null);

            var guestRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Guest" || r.Name == "guest");
            if (guestRole == null)
            {
                guestRole = new Role
                {
                    Name = "Guest",
                    Description = "Khách hàng"
                };
                _context.Roles.Add(guestRole);
                await _context.SaveChangesAsync();
            }

            var user = new User
            {
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                FullName = fullName,
                Phone = phone,
                RoleId = guestRole.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            user.Role = guestRole;
            var token = GenerateJwtToken(user);
            return (true, token, "Đăng ký thành công", user);
        }

        private string GenerateJwtToken(User user)
        {
            var roleName = user.Role?.Name ?? "Guest";
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Role, roleName),
                new Claim("FullName", user.FullName ?? ""),
                new Claim("Phone", user.Phone ?? "")
            };

            if (user.Role?.Permissions != null)
            {
                foreach (var permission in user.Role.Permissions)
                {
                    if (!string.IsNullOrWhiteSpace(permission.Name))
                    {
                        claims.Add(new Claim("permission", permission.Name));
                    }
                }
            }

            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 32)
                throw new Exception("JWT Key must be at least 32 characters long.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}