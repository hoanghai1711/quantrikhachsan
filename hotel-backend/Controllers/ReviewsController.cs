using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using HotelBackend.Data;
using HotelBackend.Hubs;
using HotelBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ReviewsController> _logger;
        private readonly IEmailService _emailService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ReviewsController(ApplicationDbContext context, ILogger<ReviewsController> logger, IEmailService emailService, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
            _hubContext = hubContext;
        }

        /// <summary>
        /// Create a new review (Guest only, must have checked out)
        /// </summary>
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
        {
            try
            {
                if (!request.BookingId.HasValue)
                    return BadRequest(new { message = "BookingId là bắt buộc" });

                if (request.Rating < 1 || request.Rating > 5)
                    return BadRequest(new { message = "Rating phải từ 1 đến 5" });

                if (string.IsNullOrWhiteSpace(request.Comment) || request.Comment.Length > 1000)
                    return BadRequest(new { message = "Bình luận không được để trống và không vượt quá 1000 ký tự" });

                var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("uid")?.Value;
                int? currentUserId = null;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var uid))
                {
                    currentUserId = uid;
                }

                var booking = await _context.Bookings
                    .Include(b => b.BookingDetails)
                    .FirstOrDefaultAsync(b => b.Id == request.BookingId.Value);

                if (booking == null)
                    return BadRequest(new { message = "Booking không tồn tại" });

                if (booking.Status != "CheckedOut")
                    return BadRequest(new { message = "Chỉ có thể đánh giá sau khi check-out" });

                if (currentUserId.HasValue && booking.UserId != currentUserId.Value)
                    return BadRequest(new { message = "Booking không thuộc về người dùng hiện tại" });

                if (request.UserId.HasValue && booking.UserId != request.UserId.Value)
                    return BadRequest(new { message = "UserId không khớp với booking" });

                var reviewUserId = currentUserId ?? request.UserId ?? booking.UserId;

                var existingReview = await _context.Reviews
                    .AnyAsync(r => r.BookingId == request.BookingId.Value);

                if (existingReview)
                    return BadRequest(new { message = "Booking này đã được đánh giá" });

                var review = new Review
                {
                    UserId = reviewUserId,
                    BookingId = request.BookingId,
                    RoomTypeId = booking.BookingDetails.FirstOrDefault()?.RoomTypeId,
                    Rating = request.Rating,
                    Comment = request.Comment,
                    CreatedAt = DateTime.UtcNow,
                    Status = ReviewStatusConstants.Pending
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Review created for booking {request.BookingId} by user {reviewUserId}");

                return CreatedAtAction(nameof(GetReviews), new { id = review.Id }, new
                {
                    id = review.Id,
                    message = "Bài đánh giá đã được gửi và đang chờ duyệt"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return StatusCode(500, new { message = "Lỗi khi tạo bài đánh giá" });
            }
        }

        /// <summary>
        /// Get all pending reviews for moderation
        /// </summary>
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingReviews()
        {
            try
            {
                var pendingReviews = await _context.Reviews
                    .Where(r => r.Status == ReviewStatusConstants.Pending)
                    .Include(r => r.User)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new
                    {
                        r.Id,
                        r.UserId,
                        GuestName = r.User != null ? r.User.FullName : "Anonymous",
                        GuestEmail = r.User != null ? r.User.Email : null,
                        r.RoomTypeId,
                        r.Rating,
                        r.Comment,
                        r.CreatedAt,
                        r.Status
                    })
                    .ToListAsync();

                _logger.LogInformation($"Retrieved {pendingReviews.Count} pending reviews");
                return Ok(pendingReviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending reviews");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách bài đánh giá chờ duyệt" });
            }
        }

        /// <summary>
        /// Get all reviews with optional status filter
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetReviews([FromQuery] string? status = null)
        {
            try
            {
                var query = _context.Reviews
                    .Include(r => r.User)
                    .Include(r => r.Reviewer)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(status))
                {
                    if (!new[] { "Pending", "Approved", "Rejected" }.Contains(status, StringComparer.OrdinalIgnoreCase))
                        return BadRequest(new { message = "Trạng thái không hợp lệ. Sử dụng: Pending, Approved, Rejected" });

                    query = query.Where(r => EF.Functions.Like(r.Status, $"%{status}%"));
                }

                var reviews = await query
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new
                    {
                        r.Id,
                        r.UserId,
                        GuestName = r.User != null ? r.User.FullName : "Anonymous",
                        r.Rating,
                        r.Comment,
                        r.CreatedAt,
                        r.Status,
                        r.RejectionReason,
                        r.ReviewedAt,
                        ReviewedBy = r.Reviewer != null ? r.Reviewer.FullName : null
                    })
                    .ToListAsync();

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reviews");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách bài đánh giá" });
            }
        }

        /// <summary>
        /// Approve a pending review (Admin only)
        /// </summary>
        [HttpPut("{id:int}/approve")]
        public async Task<IActionResult> ApproveReview(int id)
        {
            try
            {
                var review = await _context.Reviews.FindAsync(id);
                if (review == null)
                    return NotFound(new { message = "Bài đánh giá không tồn tại" });

                if (review.Status != ReviewStatusConstants.Pending)
                    return BadRequest(new { message = $"Chỉ có thể duyệt bài đánh giá ở trạng thái 'Pending'. Trạng thái hiện tại: {review.Status}" });

                // Get current user ID from claims
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("uid")?.Value;
                if (!int.TryParse(userId, out var currentUserId))
                {
                    _logger.LogWarning("Could not extract user ID from token");
                    return Unauthorized(new { message = "Không thể xác định người dùng" });
                }

                review.Status = ReviewStatusConstants.Approved;
                review.ReviewedBy = currentUserId;
                review.ReviewedAt = DateTime.UtcNow;
                review.RejectionReason = null;

                _context.Reviews.Update(review);
                await _context.SaveChangesAsync();

                // Send email notification
                var user = await _context.Users.FindAsync(review.UserId);
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    await _emailService.QueueEmailAsync(user.Email, "Review Approved", $"Your review has been approved.");
                }

                await _hubContext.Clients.Group($"User-{review.UserId}")
                    .SendAsync("ReceiveNotification", new NotificationPayload
                    {
                        Title = "Đánh giá của bạn đã được duyệt",
                        Message = "Bài đánh giá của bạn đã được duyệt và sẽ hiển thị trên hệ thống.",
                        Type = "success",
                        Timestamp = DateTime.UtcNow,
                        RelatedId = review.Id
                    });

                _logger.LogInformation($"Review {id} approved by user {currentUserId}");

                return Ok(new
                {
                    id = review.Id,
                    status = review.Status,
                    reviewedAt = review.ReviewedAt,
                    message = "Bài đánh giá đã được duyệt"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error approving review {id}");
                return StatusCode(500, new { message = "Lỗi khi duyệt bài đánh giá" });
            }
        }

        /// <summary>
        /// Reject a pending review with optional reason (Admin only)
        /// </summary>
        [HttpPut("{id:int}/reject")]
        public async Task<IActionResult> RejectReview(int id, [FromBody] RejectReviewRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Reason))
                    return BadRequest(new { message = "Lý do từ chối là bắt buộc" });

                if (request.Reason.Length > 1000)
                    return BadRequest(new { message = "Lý do không được vượt quá 1000 ký tự" });

                var review = await _context.Reviews.FindAsync(id);
                if (review == null)
                    return NotFound(new { message = "Bài đánh giá không tồn tại" });

                if (review.Status != ReviewStatusConstants.Pending)
                    return BadRequest(new { message = $"Chỉ có thể từ chối bài đánh giá ở trạng thái 'Pending'. Trạng thái hiện tại: {review.Status}" });

                // Get current user ID from claims
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("uid")?.Value;
                if (!int.TryParse(userId, out var currentUserId))
                {
                    _logger.LogWarning("Could not extract user ID from token");
                    return Unauthorized(new { message = "Không thể xác định người dùng" });
                }

                review.Status = ReviewStatusConstants.Rejected;
                review.ReviewedBy = currentUserId;
                review.ReviewedAt = DateTime.UtcNow;
                review.RejectionReason = request.Reason;

                _context.Reviews.Update(review);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Review {id} rejected by user {currentUserId}. Reason: {request.Reason}");

                return Ok(new
                {
                    id = review.Id,
                    status = review.Status,
                    rejectionReason = review.RejectionReason,
                    reviewedAt = review.ReviewedAt,
                    message = "Bài đánh giá đã bị từ chối"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error rejecting review {id}");
                return StatusCode(500, new { message = "Lỗi khi từ chối bài đánh giá" });
            }
        }

        /// <summary>
        /// Get single review by ID
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetReviewById(int id)
        {
            try
            {
                var review = await _context.Reviews
                    .Include(r => r.User)
                    .Include(r => r.Reviewer)
                    .Where(r => r.Id == id)
                    .Select(r => new
                    {
                        r.Id,
                        r.UserId,
                        GuestName = r.User != null ? r.User.FullName : "Anonymous",
                        GuestEmail = r.User != null ? r.User.Email : null,
                        r.RoomTypeId,
                        r.Rating,
                        r.Comment,
                        r.CreatedAt,
                        r.Status,
                        r.RejectionReason,
                        r.ReviewedAt,
                        ReviewedBy = r.Reviewer != null ? r.Reviewer.FullName : null
                    })
                    .FirstOrDefaultAsync();

                if (review == null)
                    return NotFound(new { message = "Bài đánh giá không tồn tại" });

                return Ok(review);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving review {id}");
                return StatusCode(500, new { message = "Lỗi khi lấy bài đánh giá" });
            }
        }

        /// <summary>
        /// Get review statistics
        /// </summary>
        [HttpGet("statistics")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewStatistics()
        {
            try
            {
                var approvedReviews = await _context.Reviews
                    .Where(r => r.Status == ReviewStatusConstants.Approved)
                    .ToListAsync();

                var averageRating = approvedReviews.Any() ? Math.Round(approvedReviews.Average(r => r.Rating), 2) : 0;

                var ratingsByRoomType = approvedReviews
                    .Where(r => r.RoomTypeId.HasValue)
                    .GroupBy(r => r.RoomTypeId.Value)
                    .Select(g => new
                    {
                        RoomTypeId = g.Key,
                        AverageRating = Math.Round(g.Average(r => r.Rating), 2),
                        ReviewCount = g.Count()
                    })
                    .ToList();

                return Ok(new
                {
                    overallAverageRating = averageRating,
                    totalReviews = approvedReviews.Count,
                    ratingsByRoomType
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving review statistics");
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê đánh giá" });
            }
        }

        /// <summary>
        /// Get reviews by room type
        /// </summary>
        [HttpGet("by-room-type/{roomTypeId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewsByRoomType(int roomTypeId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Where(r => r.RoomTypeId == roomTypeId && r.Status == ReviewStatusConstants.Approved)
                    .Include(r => r.User)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new
                    {
                        r.Id,
                        r.Rating,
                        r.Comment,
                        r.CreatedAt,
                        GuestName = r.User != null ? r.User.FullName : "Anonymous"
                    })
                    .ToListAsync();

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reviews by room type");
                return StatusCode(500, new { message = "Lỗi khi lấy đánh giá theo loại phòng" });
            }
        }
    }

    /// <summary>
    /// Request model for rejecting a review
    /// </summary>
    public class RejectReviewRequest
    {
        public string? Reason { get; set; }
    }

    /// <summary>
    /// Request model for creating a review
    /// </summary>
    public class CreateReviewRequest
    {
        public int? UserId { get; set; } // For anonymous or guest
        public int? BookingId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}
