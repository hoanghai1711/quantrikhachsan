using System;
using System.Threading.Tasks;
using HotelBackend.Models;
using HotelBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/services")]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public ServiceController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetServices()
        {
            var services = await _serviceService.GetServicesAsync();
            var result = services.Select(s => new
            {
                id = s.Id,
                categoryId = s.CategoryId,
                category = s.Category == null ? null : new { id = s.Category.Id, name = s.Category.Name },
                name = s.Name,
                description = s.Description,
                price = s.Price,
                isActive = s.IsActive
            }).ToList();
            return Ok(result);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetServiceCategories()
        {
            var categories = await _serviceService.GetServiceCategoriesAsync();
            var result = categories.Select(c => new
            {
                id = c.Id,
                name = c.Name
            }).ToList();
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetService(int id)
        {
            var service = await _serviceService.GetServiceByIdAsync(id);
            if (service == null)
            {
                return NotFound(new { message = "Dịch vụ không tồn tại" });
            }
            return Ok(service);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> CreateService([FromBody] Service service)
        {
            if (string.IsNullOrWhiteSpace(service.Name))
            {
                return BadRequest(new { message = "Tên dịch vụ không được để trống" });
            }

            var created = await _serviceService.CreateServiceAsync(service);
            return CreatedAtAction(nameof(GetService), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] Service request)
        {
            var updated = await _serviceService.UpdateServiceAsync(id, request);
            if (!updated) return NotFound(new { message = "Dịch vụ không tồn tại" });
            return Ok(new { message = "Cập nhật dịch vụ thành công" });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var deleted = await _serviceService.DeleteServiceAsync(id);
            if (!deleted) return NotFound(new { message = "Dịch vụ không tồn tại" });
            return NoContent();
        }

        [HttpPut("{id:int}/toggle")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> ToggleService(int id)
        {
            var toggled = await _serviceService.ToggleServiceAsync(id);
            if (!toggled) return NotFound(new { message = "Dịch vụ không tồn tại" });
            return Ok(new { message = "Cập nhật trạng thái dịch vụ thành công" });
        }
    }

    [ApiController]
    [Route("api/order-services")]
    public class OrderServicesController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public OrderServicesController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager,Receptionist")]
        public async Task<IActionResult> CreateOrderService([FromBody] CreateOrderServiceRequest request)
        {
            if (request.BookingId <= 0 || request.ServiceId <= 0 || request.Quantity <= 0)
            {
                return BadRequest(new { message = "Thông tin đơn dịch vụ không hợp lệ" });
            }

            try
            {
                var order = await _serviceService.CreateOrderServiceAsync(request.BookingId, request.ServiceId, request.Quantity);
                return Created(string.Empty, order);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể tạo đơn dịch vụ", error = ex.Message });
            }
        }
    }

    public class CreateOrderServiceRequest
    {
        public int BookingId { get; set; }
        public int ServiceId { get; set; }
        public int Quantity { get; set; }
    }
}
