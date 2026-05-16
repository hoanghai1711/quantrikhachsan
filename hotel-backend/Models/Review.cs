using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    [Table("Reviews")]
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
        public DateTimeOffset? CreatedAt { get; set; }

        [Column("status")]
        [StringLength(50)]
        public string? Status { get; set; } // Pending, Approved, Rejected

        [Column("reviewed_by")]
        public int? ReviewedBy { get; set; }

        [Column("reviewed_at")]
        public DateTimeOffset? ReviewedAt { get; set; }

        [Column("rejection_reason")]
        public string? RejectionReason { get; set; }

        // Navigation properties
        public User? Reviewer { get; set; }
        public User? User { get; set; }
        public RoomType? RoomType { get; set; }
        public Booking? Booking { get; set; }
    }
}
