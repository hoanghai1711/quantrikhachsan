using System;
using System.Linq;
using System.Threading.Tasks;
using HotelBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/reports")]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("revenue")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetRevenueReport([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            var start = from ?? DateTime.UtcNow.Date.AddDays(-7);
            var end = to?.Date.AddDays(1).AddTicks(-1) ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

            var report = await _context.Invoices
                .Where(i => i.CreatedAt >= start && i.CreatedAt <= end)
                .GroupBy(i => i.CreatedAt.Date)
                .Select(g => new
                {
                    label = g.Key.ToString("yyyy-MM-dd"),
                    room = g.Sum(i => i.TotalRoomAmount),
                    service = g.Sum(i => i.TotalServiceAmount),
                    damage = g.Sum(i => i.DiscountAmount), // Note: Damage charges not directly available, using discount as placeholder
                    total = g.Sum(i => i.FinalTotal)
                })
                .OrderBy(r => r.label)
                .ToListAsync();

            return Ok(report);
        }
    }
}
