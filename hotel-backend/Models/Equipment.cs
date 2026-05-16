using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    [Table("Equipments")]
    public class Equipment
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("ItemCode")]
        public string? ItemCode { get; set; }

        [Column("Name")]
        public string? Name { get; set; }

        [Column("Category")]
        public string? Category { get; set; }

        [Column("Unit")]
        public string? Unit { get; set; }

        [Column("TotalQuantity")]
        public int TotalQuantity { get; set; }

        [Column("InUseQuantity")]
        public int InUseQuantity { get; set; }

        [Column("DamagedQuantity")]
        public int DamagedQuantity { get; set; }

        [Column("LiquidatedQuantity")]
        public int LiquidatedQuantity { get; set; }

        [NotMapped]
        public int InStockQuantity => TotalQuantity - InUseQuantity - DamagedQuantity - LiquidatedQuantity;

        [Column("BasePrice")]
        public decimal BasePrice { get; set; }

        [Column("DefaultPriceIfLost")]
        public decimal DefaultPriceIfLost { get; set; }

        [Column("Supplier")]
        public string? Supplier { get; set; }

        [Column("IsActive")]
        public bool IsActive { get; set; }

        [Column("CreatedAt")]
        public DateTimeOffset? CreatedAt { get; set; }

        [Column("UpdatedAt")]
        public DateTimeOffset? UpdatedAt { get; set; }

        [Column("ImageUrl")]
        public string? ImageUrl { get; set; }
    }

    [Table("Room_Inventory")]
    public class RoomInventory
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("room_id")]
        public int? RoomId { get; set; }

        [Column("quantity")]
        public int? Quantity { get; set; }

        [Column("price_if_lost")]
        public decimal? PriceIfLost { get; set; }

        [Column("note")]
        public string? Note { get; set; }

        [Column("is_active")]
        public bool? IsActive { get; set; }

        [Column("item_type")]
        public string? ItemType { get; set; }

        [Column("EquipmentId")]
        public int EquipmentId { get; set; }

        // Navigation properties
        public Room? Room { get; set; }
        public Equipment? Equipment { get; set; }
    }
}