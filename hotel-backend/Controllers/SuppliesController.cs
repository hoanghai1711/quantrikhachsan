using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/supplies")]
    public class SuppliesController : ControllerBase
    {
        private static readonly List<SupplyDto> Supplies = new()
        {
            new SupplyDto { Id = 1, Name = "Khăn tắm", Category = "Dọn phòng", Current = 32, Min = 20 },
            new SupplyDto { Id = 2, Name = "Xà phòng", Category = "Dọn phòng", Current = 18, Min = 20 },
            new SupplyDto { Id = 3, Name = "Nước lọc", Category = "Tiện nghi", Current = 45, Min = 30 },
            new SupplyDto { Id = 4, Name = "Giấy vệ sinh", Category = "Dọn phòng", Current = 12, Min = 15 },
            new SupplyDto { Id = 5, Name = "Đồ dùng minibar", Category = "Minibar", Current = 28, Min = 25 }
        };

        [HttpGet]
        public IActionResult GetSupplies()
        {
            return Ok(Supplies);
        }

        [HttpPut("{id}/restock")]
        public IActionResult RestockSupply(int id, [FromBody] RestockRequest request)
        {
            var supply = Supplies.FirstOrDefault(s => s.Id == id);
            if (supply == null)
            {
                return NotFound(new { message = "Không tìm thấy vật tư" });
            }

            if (request.Quantity <= 0)
            {
                return BadRequest(new { message = "Số lượng phải lớn hơn 0" });
            }

            supply.Current += request.Quantity;
            return Ok(supply);
        }
    }

    public class SupplyDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int Current { get; set; }
        public int Min { get; set; }
    }

    public class RestockRequest
    {
        public int Quantity { get; set; }
    }
}
