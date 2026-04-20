namespace HotelBackend.Models;
public class Role
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    // Khởi tạo collection rỗng để tránh null
    public ICollection<Permission> Permissions { get; set; } = new List<Permission>();
}