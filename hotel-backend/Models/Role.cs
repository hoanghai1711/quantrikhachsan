using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models;

[Table("Roles")]
public class Role
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string? Name { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}