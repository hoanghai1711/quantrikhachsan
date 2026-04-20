using System;
using System.Linq;
using System.Threading.Tasks;
using HotelBackend.Data;
using HotelBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/vouchers")]
    public class VouchersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VouchersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetVouchers()
        {
            var vouchers = await _context.Vouchers.ToListAsync();
            return Ok(vouchers.Select(MapVoucher));
        }

        [HttpGet("{code}")]
        public async Task<IActionResult> GetVoucherByCode(string code)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == code);
            if (voucher == null)
                return NotFound(new { message = "Voucher không tồn tại" });

            return Ok(MapVoucher(voucher));
        }

        [HttpGet("validate")]
        public async Task<IActionResult> ValidateVoucher([FromQuery] string code, [FromQuery] decimal total)
        {
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest(new { message = "Mã voucher không được để trống" });

            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == code);
            if (voucher == null)
                return NotFound(new { valid = false, message = "Voucher không tồn tại" });

            if (voucher.ValidFrom.HasValue && voucher.ValidFrom.Value > DateTime.Now)
                return BadRequest(new { valid = false, message = "Voucher chưa đến hạn sử dụng" });

            if (voucher.ValidTo.HasValue && voucher.ValidTo.Value < DateTime.Now)
                return BadRequest(new { valid = false, message = "Voucher đã hết hạn" });

            if (voucher.MinBookingValue.HasValue && total < voucher.MinBookingValue.Value)
                return BadRequest(new { valid = false, message = "Tổng đơn chưa đạt điều kiện áp dụng voucher" });

            var usedCount = await _context.Bookings.CountAsync(b => b.VoucherId == voucher.Id);
            if (voucher.UsageLimit.HasValue && usedCount >= voucher.UsageLimit.Value)
                return BadRequest(new { valid = false, message = "Voucher đã hết lượt sử dụng" });

            var discount = voucher.DiscountType?.ToUpper() == "PERCENT"
                ? Math.Round(total * voucher.DiscountValue / 100, 2)
                : voucher.DiscountValue;

            return Ok(new
            {
                valid = true,
                message = "Voucher hợp lệ",
                discount,
                voucher = MapVoucher(voucher),
                usedCount
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest(new { message = "Mã voucher không được để trống" });

            var exists = await _context.Vouchers.AnyAsync(v => v.Code == request.Code);
            if (exists)
                return BadRequest(new { message = "Mã voucher đã tồn tại" });

            var voucher = new Voucher
            {
                Code = request.Code,
                DiscountType = request.Type,
                DiscountValue = request.Value,
                MinBookingValue = request.MinBookingValue,
                ValidFrom = request.ValidFrom ?? DateTime.Now,
                ValidTo = request.ValidTo ?? DateTime.Now.AddMonths(1),
                UsageLimit = request.UsageLimit,
                UsedCount = 0,
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();
            return Ok(MapVoucher(voucher));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateVoucher(int id, [FromBody] UpdateVoucherRequest request)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null)
                return NotFound(new { message = "Voucher không tồn tại" });

            voucher.Code = string.IsNullOrWhiteSpace(request.Code) ? voucher.Code : request.Code;
            voucher.DiscountType = request.Type ?? voucher.DiscountType;
            voucher.DiscountValue = request.Value ?? voucher.DiscountValue;
            voucher.MinBookingValue = request.MinBookingValue ?? voucher.MinBookingValue;
            voucher.ValidTo = request.ValidTo ?? voucher.ValidTo;
            voucher.UsageLimit = request.UsageLimit ?? voucher.UsageLimit;

            await _context.SaveChangesAsync();
            return Ok(MapVoucher(voucher));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null)
                return NotFound(new { message = "Voucher không tồn tại" });

            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("bulk-import")]
        public async Task<IActionResult> BulkImportVouchers([FromBody] List<CreateVoucherRequest> requests)
        {
            if (requests == null || requests.Count == 0)
                return BadRequest(new { message = "Danh sách vouchers không được để trống" });

            var created = new List<object>();
            var errors = new List<string>();

            foreach (var request in requests)
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(request.Code))
                    {
                        errors.Add($"Mã voucher không được để trống");
                        continue;
                    }

                    var exists = await _context.Vouchers.AnyAsync(v => v.Code == request.Code);
                    if (exists)
                    {
                        errors.Add($"Mã {request.Code} đã tồn tại");
                        continue;
                    }

                    var voucher = new Voucher
                    {
                        Code = request.Code,
                        DiscountType = request.Type,
                        DiscountValue = request.Value,
                        MinBookingValue = request.MinBookingValue,
                        ValidFrom = request.ValidFrom ?? DateTime.Now,
                        ValidTo = request.ValidTo ?? DateTime.Now.AddMonths(1),
                        UsageLimit = request.UsageLimit,
                        UsedCount = 0,
                    };

                    _context.Vouchers.Add(voucher);
                    await _context.SaveChangesAsync();
                    created.Add(MapVoucher(voucher));
                }
                catch (Exception ex)
                {
                    errors.Add($"Lỗi: {ex.Message}");
                }
            }

            return Ok(new
            {
                created = created.Count,
                total = requests.Count,
                results = created,
                errors = errors.Count > 0 ? errors : null
            });
        }

        private static object MapVoucher(Voucher voucher)
        {
            return new
            {
                id = voucher.Id,
                code = voucher.Code,
                type = voucher.DiscountType,
                value = voucher.DiscountValue,
                minBookingValue = voucher.MinBookingValue ?? 0,
                validFrom = voucher.ValidFrom?.ToString("yyyy-MM-dd") ?? string.Empty,
                validTo = voucher.ValidTo?.ToString("yyyy-MM-dd") ?? string.Empty,
                usageLimit = voucher.UsageLimit ?? 0,
                usedCount = voucher.UsedCount,
            };
        }
    }

    public class CreateVoucherRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Type { get; set; } = "PERCENT";
        public decimal Value { get; set; }
        public decimal MinBookingValue { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
        public int UsageLimit { get; set; } = 100;
    }

    public class UpdateVoucherRequest
    {
        public string? Code { get; set; }
        public string? Type { get; set; }
        public decimal? Value { get; set; }
        public decimal? MinBookingValue { get; set; }
        public DateTime? ValidTo { get; set; }
        public int? UsageLimit { get; set; }
    }
}
