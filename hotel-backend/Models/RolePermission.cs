using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    [Table("Role_Permissions")]
    public class RolePermission
    {
        [Column("role_id")]
        public int RoleId { get; set; }

        [Column("permission_id")]
        public int PermissionId { get; set; }

        [ForeignKey(nameof(RoleId))]
        public Role Role { get; set; } = null!;

        [ForeignKey(nameof(PermissionId))]
        public Permission Permission { get; set; } = null!;
    }
}