using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    [Table("Memberships")]
    public class Membership
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("tier_name")]
        [StringLength(100)]
        public string? TierName { get; set; }

        [Column("min_points")]
        public int? MinPoints { get; set; }

        [Column("discount_percent")]
        public decimal? DiscountPercent { get; set; }

            [Column("user_id")]
            public int? UserId { get; set; }

            // Navigation properties
            public User? User { get; set; }
    }
}
