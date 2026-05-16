using System.Linq;
using System.Threading.Tasks;
using HotelBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/audit-logs")]
    public class AuditLogsController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuditLogsController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAuditLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? filter = null,
            [FromQuery] string? user = null,
            [FromQuery] string? action = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            var logs = await _userService.GetAuditLogsAsync(page, pageSize, filter, user, action, from, to);
            var result = logs.Select(log => new
            {
                id = log.Id,
                user_id = log.UserId,          // snake_case
                action = log.Action,
                table_name = log.TableName,    // snake_case
                record_id = log.RecordId,      // snake_case
                old_value = log.OldValues,
                new_value = log.NewValues,
                created_at = log.Timestamp     // snake_case
            });
            return Ok(result);
        }
    }
}