namespace HotelBackend.Models
{
    public class ServiceCategory
    {
        public int Id { get; set; }
        public string? Name { get; set; }

        public ICollection<Service>? Services { get; set; }
    }

    public class Service
    {
        public int Id { get; set; }
        public int? CategoryId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; }

        public ServiceCategory? Category { get; set; }
        public ICollection<OrderServiceDetail>? OrderServiceDetails { get; set; }
    }

    public class OrderService
    {
        public int Id { get; set; }
        public int? BookingId { get; set; }
        public DateTime OrderDate { get; set; }
        public string? Status { get; set; } // Pending, Completed, Cancelled
        public decimal TotalAmount { get; set; }

        public Booking? Booking { get; set; }
        public ICollection<OrderServiceDetail>? OrderServiceDetails { get; set; }
    }

    public class OrderServiceDetail
    {
        public int Id { get; set; }
        public int OrderServiceId { get; set; }
        public int ServiceId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }

        public OrderService? OrderService { get; set; }
        public Service? Service { get; set; }
    }
}