using HotelBackend.Data;
using HotelBackend.Models;
using HotelBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/rooms")]
    [Authorize]
    public class RoomController : ControllerBase
    {
        private readonly IRoomService _roomService;
        private readonly ApplicationDbContext _context;

        public RoomController(IRoomService roomService, ApplicationDbContext context)
        {
            _roomService = roomService;
            _context = context;
        }

        [HttpGet("types")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRoomTypes()
        {
            var roomTypes = await _roomService.GetRoomTypesAsync();
            return Ok(roomTypes);
        }

        [HttpGet("types/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRoomType(int id)
        {
            var roomType = await _roomService.GetRoomTypeByIdAsync(id);
            if (roomType == null)
            {
                return NotFound(new { message = "Loại phòng không tồn tại" });
            }
            return Ok(roomType);
        }

        [HttpPost("types")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> CreateRoomType([FromBody] RoomType roomType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdRoomType = await _roomService.CreateRoomTypeAsync(roomType);
                return CreatedAtAction(nameof(GetRoomType), new { id = createdRoomType.Id }, createdRoomType);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Không thể tạo loại phòng", error = ex.Message });
            }
        }

        [HttpPut("types/{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateRoomType(int id, [FromBody] RoomType roomType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _roomService.UpdateRoomTypeAsync(id, roomType);
            if (!success)
            {
                return NotFound(new { message = "Loại phòng không tồn tại" });
            }

            return Ok(new { message = "Cập nhật loại phòng thành công" });
        }

        [HttpDelete("types/{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteRoomType(int id)
        {
            var success = await _roomService.DeleteRoomTypeAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Loại phòng không tồn tại" });
            }

            return Ok(new { message = "Xóa loại phòng thành công" });
        }

        [HttpPost("types/{roomTypeId}/images")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> AddRoomImage(int roomTypeId, [FromBody] AddRoomImageRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var image = await _roomService.AddRoomImageAsync(roomTypeId, request.ImageUrl, request.IsPrimary);
                return CreatedAtAction(nameof(GetRoomType), new { id = roomTypeId }, image);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể thêm ảnh", error = ex.Message });
            }
        }

        [HttpDelete("images/{imageId}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> RemoveRoomImage(int imageId)
        {
            var success = await _roomService.RemoveRoomImageAsync(imageId);
            if (!success)
            {
                return NotFound(new { message = "Ảnh không tồn tại" });
            }

            return Ok(new { message = "Xóa ảnh thành công" });
        }

        [HttpPut("images/{imageId}/primary")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> SetPrimaryImage(int imageId)
        {
            var success = await _roomService.SetPrimaryImageAsync(imageId);
            if (!success)
            {
                return NotFound(new { message = "Ảnh không tồn tại" });
            }

            return Ok(new { message = "Đặt ảnh chính thành công" });
        }

        [HttpGet]
        public async Task<IActionResult> GetRooms()
        {
            var rooms = await _roomService.GetRoomsAsync();
            return Ok(rooms);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoom(int id)
        {
            var room = await _roomService.GetRoomByIdAsync(id);
            if (room == null)
            {
                return NotFound(new { message = "Phòng không tồn tại" });
            }
            return Ok(room);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> CreateRoom([FromBody] CreateRoomRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate room type exists
            var roomType = await _roomService.GetRoomTypeByIdAsync(request.RoomTypeId);
            if (roomType == null)
            {
                return BadRequest(new { message = "Loại phòng không tồn tại" });
            }

            var room = new Room
            {
                RoomTypeId = request.RoomTypeId,
                RoomNumber = request.RoomNumber,
                Status = request.Status ?? "Available",
                Floor = request.Floor,
                
            };

            try{
           var createdRoom = await _roomService.CreateRoomAsync(room);
Console.WriteLine($"Created Room Id: {createdRoom.Id}, Number: {createdRoom.RoomNumber}");
return CreatedAtAction(nameof(GetRoom), new { id = createdRoom.Id }, createdRoom);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Không thể tạo phòng", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] UpdateRoomRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate room type exists if provided
            if (request.RoomTypeId.HasValue)
            {
                var roomType = await _roomService.GetRoomTypeByIdAsync(request.RoomTypeId.Value);
                if (roomType == null)
                {
                    return BadRequest(new { message = "Loại phòng không tồn tại" });
                }
            }

            var room = new Room
            {
                RoomTypeId = request.RoomTypeId ?? 0,
                RoomNumber = request.RoomNumber,
                Status = request.Status,
                Floor = request.Floor,
        
            };

            var success = await _roomService.UpdateRoomAsync(id, room);
            if (!success)
            {
                return NotFound(new { message = "Phòng không tồn tại" });
            }

            return Ok(new { message = "Cập nhật phòng thành công" });
        }

        [HttpPut("{id}/cleaning-status")]
        [Authorize(Roles = "Housekeeping,Admin")]
        public async Task<IActionResult> UpdateCleaningStatus(int id, [FromBody] UpdateCleaningStatusRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CleaningStatus))
            {
                return BadRequest(new { message = "CleaningStatus là bắt buộc" });
            }

            var success = await _roomService.UpdateRoomCleaningStatusAsync(id, request.CleaningStatus);
            if (!success)
            {
                return NotFound(new { message = "Phòng không tồn tại" });
            }

            return Ok(new { message = "Cập nhật trạng thái dọn dẹp thành công" });
        }

        [HttpGet("cleaning/list")]
        [Authorize(Roles = "Housekeeping,Admin")]
        public async Task<IActionResult> GetCleaningRooms()
        {
            var rooms = await _roomService.GetCleaningRoomsAsync();
            return Ok(rooms);
        }

        [HttpGet("available")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvailableRooms(
            [FromQuery] DateTime checkIn,
            [FromQuery] DateTime checkOut,
            [FromQuery] int? roomTypeId,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice)
        {
            if (checkIn >= checkOut)
            {
                return BadRequest(new { message = "Ngày đến phải trước ngày đi" });
            }

            try
            {
                var rooms = await _roomService.GetAvailableRoomsAsync(checkIn, checkOut, roomTypeId, minPrice, maxPrice);
                return Ok(rooms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi truy vấn phòng trống", error = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateRoomStatus(int id, [FromBody] UpdateRoomStatusRequest request)
        {
            var success = await _roomService.UpdateRoomStatusAsync(id, request.Status);
            if (!success)
            {
                return NotFound();
            }
            return Ok();
        }

        [HttpPost("hold")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateRoomHold([FromBody] CreateRoomHoldRequest request)
        {
            if (request.CheckIn >= request.CheckOut)
            {
                return BadRequest(new { message = "Ngày đến phải trước ngày đi" });
            }

            try
            {
                var hold = await _roomService.CreateRoomHoldAsync(request.RoomTypeId, request.CheckIn, request.CheckOut);
                return Ok(hold);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("hold/{holdId}/release")]
        [AllowAnonymous]
        public async Task<IActionResult> ReleaseRoomHold(int holdId)
        {
            var success = await _roomService.ReleaseRoomHoldAsync(holdId);
            if (!success)
            {
                return NotFound(new { message = "Hold không tồn tại" });
            }
            return Ok(new { message = "Release hold thành công" });
        }
    }

    public class UpdateRoomStatusRequest
    {
        public string Status { get; set; } = "";
    }

    public class CreateRoomRequest
    {
        public int RoomTypeId { get; set; }
        public string? RoomNumber { get; set; }
        public string? Status { get; set; }
        public int Floor { get; set; }
        public bool? IsActive { get; set; }
    }

    public class UpdateRoomRequest
    {
        public int? RoomTypeId { get; set; }
        public string? RoomNumber { get; set; }
        public string? Status { get; set; }
        public int Floor { get; set; }
        public bool? IsActive { get; set; }
    }

    public class AddRoomImageRequest
    {
        public string ImageUrl { get; set; } = "";
        public bool IsPrimary { get; set; } = false;
    }

    public class UpdateCleaningStatusRequest
    {
        public string? CleaningStatus { get; set; } // Clean, Cleaning, Dirty
    }

    public class CreateRoomHoldRequest
    {
        public int RoomTypeId { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
    }

}