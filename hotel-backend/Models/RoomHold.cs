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
        public DateTime CheckIn { get; set; }

        [Column("check_out")]
        public DateTime CheckOut { get; set; }

        [Column("hold_expiry")]
        public DateTime HoldExpiry { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        public RoomType? RoomType { get; set; }
    }
}
