using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    [Table("Invoices")]
    public class Invoice
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("booking_id")]
        public int? BookingId { get; set; }

        [Column("total_room_amount")]
        public decimal? TotalRoomAmount { get; set; }

        [Column("total_service_amount")]
        public decimal? TotalServiceAmount { get; set; }

        [Column("discount_amount")]
        public decimal? DiscountAmount { get; set; }

        [Column("tax_amount")]
        public decimal? TaxAmount { get; set; }

        [Column("final_total")]
        public decimal? FinalTotal { get; set; }

        [Column("status")]
        [StringLength(50)]
        public string? Status { get; set; } // Unpaid, Paid, Partial, Refunded

        [Column("created_at")]
        public DateTimeOffset? CreatedAt { get; set; }

        [Column("total_damage_amount")]
        public decimal? TotalDamageAmount { get; set; }

        // Navigation properties
        public Booking? Booking { get; set; }
        public ICollection<Payment>? Payments { get; set; }
    }

    [Table("Payments")]
    public class Payment
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("invoice_id")]
        public int? InvoiceId { get; set; }

        [Column("payment_method")]
        [StringLength(50)]
        public string? PaymentMethod { get; set; } // Cash, CreditCard, BankTransfer, MoMo, VNPay

        [Column("amount_paid")]
        public decimal AmountPaid { get; set; }

        [NotMapped]
        public decimal Amount => AmountPaid;

        [Column("transaction_code")]
        [StringLength(100)]
        public string? TransactionCode { get; set; }

        [Column("payment_date")]
        public DateTimeOffset? PaymentDate { get; set; }

        // Navigation properties
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
        public DateTimeOffset? CreatedAt { get; set; }

        [Column("image_url")]
        public string? ImageUrl { get; set; }

        // Navigation properties
        public BookingDetail? BookingDetail { get; set; }
        public RoomInventory? RoomInventory { get; set; }
    }
}
