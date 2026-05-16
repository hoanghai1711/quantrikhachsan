using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    [Table("Room_Holds")]
    public class RoomHold
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("room_type_id")]
        public int RoomTypeId { get; set; }

        [Column("check_in")]
        public DateTimeOffset CheckIn { get; set; }

        [Column("check_out")]
        public DateTimeOffset CheckOut { get; set; }

        [Column("hold_expiry")]
        public DateTimeOffset HoldExpiry { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTimeOffset? UpdatedAt { get; set; }

        // Navigation properties
        public RoomType? RoomType { get; set; }
    }
}