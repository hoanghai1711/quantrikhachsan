using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBackend.Models
{
    [Table("Room_Types")]
    public class RoomType
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("base_price")]
        public decimal BasePrice { get; set; }

        [Column("capacity_adults")]
        public int CapacityAdults { get; set; }

        [Column("capacity_children")]
        public int CapacityChildren { get; set; }

        [NotMapped]
        public int MaxOccupancy
        {
            get => CapacityAdults + CapacityChildren;
            set => CapacityAdults = value;
        }

        [Column("size_sqm")]
        public decimal? Size { get; set; }

        [Column("bed_type")]
        public string? BedType { get; set; }

        [Column("view_type")]
        public string? ViewType { get; set; }

        [Column("slug")]
        public string? Slug { get; set; }

        [Column("content")]
        public string? Content { get; set; }

        [Column("is_active")]
        public bool? IsActive { get; set; }

        public ICollection<Room>? Rooms { get; set; }
        public ICollection<RoomImage>? RoomImages { get; set; }
        public ICollection<RoomAmenity>? RoomAmenities { get; set; }
    }

    [Table("Rooms")]
    public class Room
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("room_type_id")]
        public int? RoomTypeId { get; set; }

        [Column("room_number")]
        public string? RoomNumber { get; set; }

        [Column("status")]
        public string? Status { get; set; }

        [Column("floor")]
        public int? Floor { get; set; }
        [Column("cleaning_status")]
        public string? CleaningStatus { get; set; }
        
    

        public RoomType? RoomType { get; set; }
        public ICollection<BookingDetail>? BookingDetails { get; set; }
    }

    [Table("RoomType_Amenities")]
    public class RoomAmenity
    {
        [Column("room_type_id")]
        public int RoomTypeId { get; set; }

        [Column("amenity_id")]
        public int AmenityId { get; set; }

        public RoomType? RoomType { get; set; }
    }

    [Table("Room_Images")]
    public class RoomImage
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("room_type_id")]
        public int? RoomTypeId { get; set; }

        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [Column("is_primary")]
        public bool? IsPrimary { get; set; }

        [Column("is_active")]
        public bool? IsActive { get; set; }

        public RoomType? RoomType { get; set; }
    }
}