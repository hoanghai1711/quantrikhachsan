using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HotelBackend.Data;
using HotelBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/equipments")]
    [Authorize]
    public class EquipmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EquipmentController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetEquipments()
        {
            var equipments = await _context.Equipments
                .Where(e => e.IsActive)
                .OrderBy(e => e.Name)
                .ToListAsync();

            return Ok(equipments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEquipment(int id)
        {
            var equipment = await _context.Equipments.FindAsync(id);
            if (equipment == null || !equipment.IsActive)
            {
                return NotFound(new { message = "Không tìm thấy thiết bị" });
            }

            return Ok(equipment);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateEquipment([FromBody] Equipment equipment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            equipment.IsActive = true;
            equipment.CreatedAt = DateTime.UtcNow;
            equipment.UpdatedAt = DateTime.UtcNow;
            equipment.InStockQuantity = equipment.TotalQuantity - equipment.InUseQuantity - equipment.DamagedQuantity - equipment.LiquidatedQuantity;

            _context.Equipments.Add(equipment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEquipment), new { id = equipment.Id }, equipment);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateEquipment(int id, [FromBody] Equipment equipment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existing = await _context.Equipments.FindAsync(id);
            if (existing == null)
            {
                return NotFound(new { message = "Không tìm thấy thiết bị" });
            }

            existing.ItemCode = equipment.ItemCode;
            existing.Name = equipment.Name;
            existing.Category = equipment.Category;
            existing.Unit = equipment.Unit;
            existing.TotalQuantity = equipment.TotalQuantity;
            existing.InUseQuantity = equipment.InUseQuantity;
            existing.DamagedQuantity = equipment.DamagedQuantity;
            existing.LiquidatedQuantity = equipment.LiquidatedQuantity;
            existing.InStockQuantity = equipment.TotalQuantity - equipment.InUseQuantity - equipment.DamagedQuantity - equipment.LiquidatedQuantity;
            existing.BasePrice = equipment.BasePrice;
            existing.DefaultPriceIfLost = equipment.DefaultPriceIfLost;
            existing.Supplier = equipment.Supplier;
            existing.ImageUrl = equipment.ImageUrl;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteEquipment(int id)
        {
            var equipment = await _context.Equipments.FindAsync(id);
            if (equipment == null)
            {
                return NotFound(new { message = "Không tìm thấy thiết bị" });
            }

            equipment.IsActive = false;
            equipment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa thiết bị" });
        }

        [HttpPut("{id}/stock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] StockUpdateRequest request)
        {
            var equipment = await _context.Equipments.FindAsync(id);
            if (equipment == null)
            {
                return NotFound(new { message = "Không tìm thấy thiết bị" });
            }

            if (request.TotalQuantity.HasValue)
                equipment.TotalQuantity = request.TotalQuantity.Value;
            if (request.InUseQuantity.HasValue)
                equipment.InUseQuantity = request.InUseQuantity.Value;
            if (request.DamagedQuantity.HasValue)
                equipment.DamagedQuantity = request.DamagedQuantity.Value;
            if (request.LiquidatedQuantity.HasValue)
                equipment.LiquidatedQuantity = request.LiquidatedQuantity.Value;

            equipment.InStockQuantity = equipment.TotalQuantity - equipment.InUseQuantity - equipment.DamagedQuantity - equipment.LiquidatedQuantity;
            equipment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(equipment);
        }
    }

    public class StockUpdateRequest
    {
        public int? TotalQuantity { get; set; }
        public int? InUseQuantity { get; set; }
        public int? DamagedQuantity { get; set; }
        public int? LiquidatedQuantity { get; set; }
    }
}