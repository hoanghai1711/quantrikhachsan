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
    [Route("api/room-inventory")]
    [Authorize]
    public class RoomInventoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RoomInventoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("room/{roomId}")]
        [Authorize(Roles = "Housekeeping,Admin")]
        public async Task<IActionResult> GetRoomInventory(int roomId)
        {
            var room = await _context.Rooms.FindAsync(roomId);
            if (room == null)
            {
                return NotFound(new { message = "Không tìm thấy phòng" });
            }

            var inventory = await _context.RoomInventories
                .Include(ri => ri.Equipment)
                .Where(ri => ri.RoomId == roomId && ri.IsActive == true && ri.Equipment != null && ri.Equipment.IsActive)
                .OrderBy(ri => ri.Equipment!.Name)
                .ToListAsync();

            return Ok(inventory);
        }

        [HttpGet("room-type/{roomTypeId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRoomTypeInventory(int roomTypeId)
        {
            var inventory = await _context.RoomInventories
                .Include(ri => ri.Equipment)
                .Include(ri => ri.Room)
                .Where(ri => ri.Room != null && ri.Room.RoomTypeId == roomTypeId && ri.IsActive == true && ri.Equipment != null && ri.Equipment.IsActive)
                .OrderBy(ri => ri.Equipment!.Name)
                .ToListAsync();

            return Ok(inventory);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateRoomInventory([FromBody] RoomInventory inventory)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var equipment = await _context.Equipments.FindAsync(inventory.EquipmentId);
            if (equipment == null || !equipment.IsActive)
            {
                return BadRequest(new { message = "Thiết bị không tồn tại" });
            }

            var room = await _context.Rooms.FindAsync(inventory.RoomId);
            if (room == null)
            {
                return BadRequest(new { message = "Phòng không tồn tại" });
            }

            var existing = await _context.RoomInventories
                .FirstOrDefaultAsync(ri => ri.RoomId == inventory.RoomId && ri.EquipmentId == inventory.EquipmentId && ri.IsActive == true);

            if (existing != null)
            {
                return BadRequest(new { message = "Mục inventory này đã tồn tại" });
            }

            inventory.IsActive = inventory.IsActive ?? true;
            _context.RoomInventories.Add(inventory);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRoomInventory), new { roomId = inventory.RoomId }, inventory);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateRoomInventory(int id, [FromBody] RoomInventory inventory)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existing = await _context.RoomInventories.FindAsync(id);
            if (existing == null)
            {
                return NotFound(new { message = "Không tìm thấy mục inventory" });
            }

            existing.Quantity = inventory.Quantity;
            existing.PriceIfLost = inventory.PriceIfLost;
            existing.Note = inventory.Note;
            existing.ItemType = inventory.ItemType;
            existing.IsActive = inventory.IsActive;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRoomInventory(int id)
        {
            var inventory = await _context.RoomInventories.FindAsync(id);
            if (inventory == null)
            {
                return NotFound(new { message = "Không tìm thấy mục inventory" });
            }

            inventory.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa mục inventory" });
        }
    }
}