using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    [Table("Equipments")]
    public class Equipment
    {
        public int Id { get; set; }
        public string? ItemCode { get; set; }
        public string? Name { get; set; }
        public string? Category { get; set; }
        public string? Unit { get; set; }
        public int TotalQuantity { get; set; }
        public int InUseQuantity { get; set; }
        public int DamagedQuantity { get; set; }
        public int LiquidatedQuantity { get; set; }
        public int InStockQuantity { get; set; } // Computed
        public decimal BasePrice { get; set; }
        public decimal DefaultPriceIfLost { get; set; }
        public string? Supplier { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? ImageUrl { get; set; }
    }

    [Table("Memberships")]
    public class Membership
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? Level { get; set; } // Bronze, Silver, Gold
        public int Points { get; set; }
        public DateTime JoinedAt { get; set; }
        public DateTime? LastUpdated { get; set; }

        public User? User { get; set; }
    }

    [Table("Room_Inventory")]
    public class RoomInventory
    {
        public int Id { get; set; }

        [Column("room_id")]
        public int RoomId { get; set; }

        public int EquipmentId { get; set; }
        public int Quantity { get; set; }

        [Column("price_if_lost")]
        public decimal PriceIfLost { get; set; }

        public string? Note { get; set; }

        [Column("is_active")]
        public bool? IsActive { get; set; }

        [Column("item_type")]
        public string? ItemType { get; set; }

        public Room? Room { get; set; }
        public Equipment? Equipment { get; set; }
    }
}