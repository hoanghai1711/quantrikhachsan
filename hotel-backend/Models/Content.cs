using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    [Table("Articles")]
    public class Article
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("category_id")]
        public int? CategoryId { get; set; }

        [Column("author_id")]
        public int? AuthorId { get; set; }

        [Column("title")]
        public string? Title { get; set; }

        [Column("slug")]
        public string? Slug { get; set; }

        [Column("content")]
        public string? Content { get; set; }

        [Column("thumbnail_url")]
        public string? ImageUrl { get; set; }

        [Column("published_at")]
        public DateTimeOffset? PublishedAt { get; set; }

        [Column("is_active")]
        public bool? IsActive { get; set; }

        public ArticleCategory? Category { get; set; }
        public User? Author { get; set; }
    }

    [Table("Attractions")]
    public class Attraction
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        [Column("distance_km")]
        public decimal? DistanceFromHotel { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("map_embed_link")]
        public string? MapLink { get; set; }

        [Column("latitude")]
        public decimal? Latitude { get; set; }

        [Column("longitude")]
        public decimal? Longitude { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [Column("is_active")]
        public bool? IsActive { get; set; }
    }

    [Table("Vouchers")]
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
        public DateTimeOffset? ValidFrom { get; set; }

        [Column("valid_to")]
        public DateTimeOffset? ValidTo { get; set; }

        [Column("usage_limit")]
        public int? UsageLimit { get; set; }

        [Column("used_count")]
        public int UsedCount { get; set; }
    }

    [Table("Audit_Logs")]
    public class AuditLog
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }

        [Column("action")]
        public string? Action { get; set; }

        [Column("table_name")]
        public string? TableName { get; set; }

        [Column("record_id")]
        public int RecordId { get; set; }

        [Column("old_value")]
        public string? OldValues { get; set; }

        [Column("new_value")]
        public string? NewValues { get; set; }

        [Column("created_at")]
        public DateTimeOffset? Timestamp { get; set; }

        public User? User { get; set; }
    }

    [Table("Amenities")]
    public class Amenity
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        [Column("icon_url")]
        public string? IconUrl { get; set; }

        [Column("is_active")]
        public bool? IsActive { get; set; }

        // Navigation properties
        public ICollection<RoomAmenity>? RoomAmenities { get; set; }
    }

    [Table("Article_Categories")]
    public class ArticleCategory
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        [Column("is_active")]
        public bool? IsActive { get; set; }
    }

    public class CreateVoucherRequest
    {
        public string? Code { get; set; }
        public string? Type { get; set; }
        public decimal Value { get; set; }
        public decimal MinBookingValue { get; set; }
        public DateTimeOffset? ValidFrom { get; set; }
        public DateTimeOffset? ValidTo { get; set; }
        public int UsageLimit { get; set; }
    }

    public class UpdateVoucherRequest
    {
        public string? Code { get; set; }
        public string? Type { get; set; }
        public decimal? Value { get; set; }
        public decimal? MinBookingValue { get; set; }
        public DateTimeOffset? ValidTo { get; set; }
        public int? UsageLimit { get; set; }
    }
}