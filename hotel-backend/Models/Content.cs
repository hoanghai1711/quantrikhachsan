using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    public class Article
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? Author { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string? Status { get; set; } // Draft, Pending, Published
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? Slug { get; set; } // Unique
        public string? ImageUrl { get; set; }
        public int? CategoryId { get; set; }

        public ArticleCategory? Category { get; set; }
    }

    public class Attraction
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public string? Address { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Category { get; set; } // Danh lam, Am thuc, Giai tri...
        public string? ImageUrl { get; set; }
        public decimal DistanceFromHotel { get; set; }
        public bool IsActive { get; set; }
    }

    public class Review
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }

        [Column("booking_id")]
        public int? BookingId { get; set; }

        [Column("room_type_id")]
        public int? RoomTypeId { get; set; }

        [Column("rating")]
        public int Rating { get; set; }

        [Column("comment")]
        public string? Comment { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        [Column("rejection_reason")]
        public string? RejectionReason { get; set; }

        [Column("reviewed_by")]
        public int? ReviewedBy { get; set; }

        [Column("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        // Navigation properties
        public User? User { get; set; }
        public Booking? Booking { get; set; }
        public User? Reviewer { get; set; }
    }

    public class Voucher
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("code")]
        public string? Code { get; set; }

        [Column("discount_type")]
        public string? DiscountType { get; set; }

        [Column("discount_value")]
        public decimal DiscountValue { get; set; }

        [Column("min_booking_value")]
        public decimal? MinBookingValue { get; set; }

        [Column("valid_from")]
        public DateTime? ValidFrom { get; set; }

        [Column("valid_to")]
        public DateTime? ValidTo { get; set; }

        [Column("usage_limit")]
        public int? UsageLimit { get; set; }

        [Column("used_count")]
        public int UsedCount { get; set; }
    }

    public class AuditLog
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? Action { get; set; }
        public string? TableName { get; set; }
        public string? RecordId { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public DateTime Timestamp { get; set; }
        public string? IpAddress { get; set; }

        public User? User { get; set; }
    }

    public class Amenity
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? IconUrl { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ArticleCategory
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public bool? IsActive { get; set; }
    }
}