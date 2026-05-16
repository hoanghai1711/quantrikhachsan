using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    [Table("Service_Categories")]
    public class ServiceCategory
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        public ICollection<Service>? Services { get; set; }
    }

    [Table("Services")]
    public class Service
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("category_id")]
        public int? CategoryId { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("price")]
        public decimal Price { get; set; }

        [Column("unit")]
        public string? Unit { get; set; }


        // Navigation properties
        public ServiceCategory? Category { get; set; }
        public ICollection<OrderServiceDetail>? OrderServiceDetails { get; set; }
    }

    [Table("Order_Services")]
    public class OrderService
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("booking_detail_id")]
        public int? BookingDetailId { get; set; }

        [Column("order_date")]
        public DateTimeOffset? OrderDate { get; set; }

        [Column("total_amount")]
        public decimal? TotalAmount { get; set; }

        [Column("status")]
        [StringLength(50)]
        public string? Status { get; set; }

        // Navigation properties
        public BookingDetail? BookingDetail { get; set; }
        public ICollection<OrderServiceDetail>? OrderServiceDetails { get; set; }
    }

    [Table("Order_Service_Details")]
    public class OrderServiceDetail
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("order_service_id")]
        public int? OrderServiceId { get; set; }

        [Column("service_id")]
        public int? ServiceId { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        [Column("unit_price")]
        public decimal UnitPrice { get; set; }

        // Navigation properties
        public OrderService? OrderService { get; set; }
        public Service? Service { get; set; }
    }
}