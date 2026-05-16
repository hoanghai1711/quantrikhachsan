using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    [Table("Users")]
    public class User
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("role_id")]
        public int? RoleId { get; set; }

        [Column("full_name")]
        public string? FullName { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("phone")]
        public string? Phone { get; set; }

        [Column("password_hash")]
        public string? PasswordHash { get; set; }

        [Column("status")]
        public bool? IsActive { get; set; }

        [Column("avatar_url")]
        public string? AvatarUrl { get; set; }

        [Column("created_at")]
        public DateTimeOffset? CreatedAt { get; set; }

        [Column("date_of_birth")]
        public DateTimeOffset? DateOfBirth { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        // Navigation properties
        public Role? Role { get; set; }
        public Membership? Membership { get; set; }
    }

    [Table("Permissions")]
    public class Permission
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}