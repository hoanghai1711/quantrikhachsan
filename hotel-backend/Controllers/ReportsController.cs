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

            var reportData = await _context.Invoices
                .Where(i => i.CreatedAt.HasValue && i.CreatedAt.Value >= start && i.CreatedAt.Value <= end)
                .GroupBy(i => i.CreatedAt!.Value.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Room = g.Sum(i => i.TotalRoomAmount ?? 0m),
                    Service = g.Sum(i => i.TotalServiceAmount ?? 0m),
                    Damage = g.Sum(i => i.TotalDamageAmount ?? 0m),
                    Total = g.Sum(i => i.FinalTotal ?? 0m)
                })
                .OrderBy(r => r.Date)
                .ToListAsync();

            var report = reportData.Select(r => new
            {
                label = r.Date.ToString("yyyy-MM-dd"),
                room = r.Room,
                service = r.Service,
                damage = r.Damage,
                total = r.Total
            });

            return Ok(report);
        }
    }
}
