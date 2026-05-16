using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HotelBackend.Models
{
    [Table("Bookings")]
    public class Booking
    {
        [Column("id")]
        public int Id { get; set; }

        

        [Column("user_id")]
        public int? UserId { get; set; }

        [Column("guest_name")]
        [StringLength(255)]
        public string? GuestName { get; set; }

        [Column("guest_phone")]
        [StringLength(50)]
        public string? GuestPhone { get; set; }
        
        [Column("guest_email")]
        [StringLength(255)]
        public string? GuestEmail { get; set; }

        [Column("booking_code")]
        [StringLength(50)]
        public string? BookingCode { get; set; }
        [Column("voucher_id")]
        public int? VoucherId { get; set; }

        [Column("status")]
        [StringLength(50)]
        public string? Status { get; set; } // Pending, Confirmed, CheckedIn, CheckedOut, Cancelled, Completed

        [Column("total_estimated_amount")]
        public decimal? TotalEstimatedAmount { get; set; }

        [Column("paid_amount")]
        public decimal? PaidAmount { get; set; }

        [Column("loyalty_earned")]
        public int? LoyaltyEarned { get; set; }

        [Column("hold_expires")]
        public DateTimeOffset? HoldExpires { get; set; }

        [Column("created_at")]
        public DateTimeOffset? CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTimeOffset? UpdatedAt { get; set; }

        // Temporary properties for booking creation workflow
        [NotMapped]
        public string? RoomTypeName { get; set; }

        [NotMapped]
        public List<int>? RoomIds { get; set; }

        [NotMapped]
        public DateTimeOffset CheckInDate { get; set; }

        [NotMapped]
        public DateTimeOffset CheckOutDate { get; set; }

        [NotMapped]
        public int RoomTypeId { get; set; }

        [NotMapped]
        public string? VoucherCode { get; set; }

        // Navigation properties
        public Voucher? Voucher { get; set; }
        public User? User { get; set; }
        public ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();
        public Invoice? Invoice { get; set; }
    }

    [Table("Booking_Details")]
    public class BookingDetail
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("booking_id")]
        public int? BookingId { get; set; }

        [Column("room_id")]
        public int? RoomId { get; set; }

        [Column("room_type_id")]
        public int? RoomTypeId { get; set; }

        [Column("check_in_date")]
        public DateTimeOffset CheckInDate { get; set; }

        [Column("check_out_date")]
        public DateTimeOffset CheckOutDate { get; set; }

        [Column("price_per_night")]
        public decimal PricePerNight { get; set; }

        // Navigation properties
        public Booking? Booking { get; set; }
        public RoomType? RoomType { get; set; }
        public Room? Room { get; set; }
    }
}