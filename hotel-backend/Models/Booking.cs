using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;

namespace HotelBackend.Models
{
    [Table("Bookings")]
    public class Booking
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("booking_code")]
        [StringLength(20)]
        public string? BookingCode { get; set; }

        [Column("user_id")]
        [Required]
        public int UserId { get; set; }

        [Column("guest_name")]
        [Required]
        [StringLength(100)]
        public string? GuestName { get; set; }

        [Column("guest_email")]
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string? GuestEmail { get; set; }

        [Column("guest_phone")]
        [Required]
        [Phone]
        [StringLength(20)]
        public string? GuestPhone { get; set; }

        [Column("voucher_id")]
        public int? VoucherId { get; set; }

        public Voucher? Voucher { get; set; }

        [NotMapped]
        [Range(1, int.MaxValue)]
        public int RoomTypeId { get; set; }

        [NotMapped]
        [Range(1, 10)]
        public int Adults { get; set; }

        [NotMapped]
        [Range(0, 10)]
        public int Children { get; set; }

        [NotMapped]
        [Range(1, 30)]
        public int Nights { get; set; }

        [NotMapped]
        public List<int>? RoomIds { get; set; }

        [NotMapped]
        [JsonPropertyName("checkIn")]
        [Required]
        public DateTime CheckInDate { get; set; }

        [NotMapped]
        [JsonPropertyName("checkOut")]
        [Required]
        public DateTime CheckOutDate { get; set; }

        [Column("status")]
        public string? Status { get; set; } // Pending, Confirmed, CheckedIn, CheckedOut, Cancelled

        [Column("total_estimated_amount")]
        public decimal TotalEstimatedAmount { get; set; }

        [NotMapped]
        public decimal TotalAmount => BookingDetails?.Sum(d => d.Subtotal) ?? 0;

        [NotMapped]
        public decimal DiscountAmount => Math.Max(0, (BookingDetails?.Sum(d => d.Subtotal) ?? 0) - TotalEstimatedAmount);

        [NotMapped]
        public string? VoucherCode { get; set; }

        [NotMapped]
        public DateTime CreatedAt { get; set; }

        [NotMapped]
        public DateTime? UpdatedAt { get; set; }

        public User? User { get; set; }
        public ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

        [NotMapped]
        public string? RoomTypeName { get; set; }

        public Invoice? Invoice { get; set; }
    }

    [Table("Booking_Details")]
    public class BookingDetail
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("booking_id")]
        [Required]
        public int BookingId { get; set; }

        [Column("room_type_id")]
        [Required]
        public int RoomTypeId { get; set; }

        [Column("room_id")]
        public int? RoomId { get; set; }

        [Column("check_in_date")]
        [Required]
        public DateTime CheckInDate { get; set; }

        [Column("check_out_date")]
        [Required]
        public DateTime CheckOutDate { get; set; }

        [NotMapped]
        public int Quantity => 1;

        [Column("price_per_night")]
        [Range(0, double.MaxValue)]
        public decimal PricePerNight { get; set; }

        [NotMapped]
        public int NumberOfNights => Math.Max(1, (int)(CheckOutDate - CheckInDate).TotalDays);

        [NotMapped]
        public decimal Subtotal => PricePerNight * NumberOfNights;

        public Booking? Booking { get; set; }
        public RoomType? RoomType { get; set; }
        public Room? Room { get; set; }
    }
}