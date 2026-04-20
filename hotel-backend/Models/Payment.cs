using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    [Table("Invoices")]
    public class Invoice
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public decimal TotalRoomAmount { get; set; }
        public decimal TotalServiceAmount { get; set; }
        [Column("total_damage_amount")]
        public decimal TotalDamageAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal FinalTotal { get; set; }
        public string? Status { get; set; } // Unpaid, Paid, Partial
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }

        public Booking? Booking { get; set; }
        public ICollection<Payment>? Payments { get; set; }
    }

    public class Payment
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public string? PaymentMethod { get; set; } // Cash, CreditCard, BankTransfer
        public decimal Amount { get; set; }
        public string? TransactionId { get; set; }
        public DateTime PaymentDate { get; set; }
        public string? Notes { get; set; }

        public Invoice? Invoice { get; set; }
    }

    [Table("Loss_And_Damages")]
    public class LossAndDamage
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("booking_detail_id")]
        public int? BookingDetailId { get; set; }

        [Column("room_inventory_id")]
        public int? RoomInventoryId { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        [Column("penalty_amount")]
        public decimal PenaltyAmount { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("image_url")]
        public string? ImageUrl { get; set; }

        public BookingDetail? BookingDetail { get; set; }
    }
}