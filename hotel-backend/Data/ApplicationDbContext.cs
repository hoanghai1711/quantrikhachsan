using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using HotelBackend.Models;
using System.Collections.Generic;

namespace HotelBackend.Data
{
    public class ApplicationDbContext : AuditDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IHttpContextAccessor httpContextAccessor)
            : base(options, httpContextAccessor)
        {
        }

        // Users and Authentication
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Membership> Memberships { get; set; }

        // Rooms
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomAmenity> RoomAmenities { get; set; }
        public DbSet<RoomImage> RoomImages { get; set; }
        public DbSet<RoomHold> RoomHolds { get; set; }

        // Bookings
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingDetail> BookingDetails { get; set; }

        // Services
        public DbSet<ServiceCategory> ServiceCategories { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<OrderService> OrderServices { get; set; }
        public DbSet<OrderServiceDetail> OrderServiceDetails { get; set; }

        // Payments and Invoices
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<LossAndDamage> LossAndDamages { get; set; }

        // Content Management
        public DbSet<Article> Articles { get; set; }
        public DbSet<Attraction> Attractions { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Amenity> Amenities { get; set; }
        public DbSet<ArticleCategory> ArticleCategories { get; set; }

        // Equipments and Inventory
        public DbSet<Equipment> Equipments { get; set; }
        public DbSet<RoomInventory> RoomInventories { get; set; }

        // Notifications
        public DbSet<Notification> Notifications { get; set; }

        // Vouchers and Audit
        public DbSet<Voucher> Vouchers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Table name mappings
            modelBuilder.Entity<ServiceCategory>()
                .ToTable("Service_Categories");

            // Column name mappings for Services (snake_case)
            modelBuilder.Entity<Service>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.CategoryId).HasColumnName("category_id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Price).HasColumnName("price");
                entity.Property(e => e.Unit).HasColumnName("unit");
            });

            // Column name mappings for OrderService (snake_case)
            modelBuilder.Entity<OrderService>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.BookingDetailId).HasColumnName("booking_detail_id");
                entity.Property(e => e.OrderDate).HasColumnName("order_date");
                entity.Property(e => e.Status).HasColumnName("status");
                entity.Property(e => e.TotalAmount).HasColumnName("total_amount");
            });

            // Column name mappings for OrderServiceDetail (snake_case)
            modelBuilder.Entity<OrderServiceDetail>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrderServiceId).HasColumnName("order_service_id");
                entity.Property(e => e.ServiceId).HasColumnName("service_id");
                entity.Property(e => e.Quantity).HasColumnName("quantity");
                entity.Property(e => e.UnitPrice).HasColumnName("unit_price");
            });

            // RolePermission composite key
            modelBuilder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });

            // RoomAmenity uses a composite key in the database
            modelBuilder.Entity<RoomAmenity>()
                .HasKey(ra => new { ra.RoomTypeId, ra.AmenityId });

            // Review relationships
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.RoomType)
                .WithMany()
                .HasForeignKey(r => r.RoomTypeId)
                .OnDelete(DeleteBehavior.SetNull);

            // Article relationships
            modelBuilder.Entity<Article>()
                .HasOne(a => a.Category)
                .WithMany()
                .HasForeignKey(a => a.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Article>()
                .HasOne(a => a.Author)
                .WithMany()
                .HasForeignKey(a => a.AuthorId)
                .OnDelete(DeleteBehavior.SetNull);

            // RoomAmenity relationships
            modelBuilder.Entity<RoomAmenity>()
                .HasOne(ra => ra.RoomType)
                .WithMany(rt => rt.RoomAmenities)
                .HasForeignKey(ra => ra.RoomTypeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RoomAmenity>()
                .HasOne(ra => ra.Amenity)
                .WithMany(a => a.RoomAmenities)
                .HasForeignKey(ra => ra.AmenityId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraints
            modelBuilder.Entity<Article>()
                .HasIndex(a => a.Slug)
                .IsUnique();

            // Decimal precision configurations
            modelBuilder.Entity<Attraction>()
                .Property(a => a.DistanceFromHotel)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Attraction>()
                .Property(a => a.Latitude)
                .HasPrecision(10, 7);

            modelBuilder.Entity<Attraction>()
                .Property(a => a.Longitude)
                .HasPrecision(10, 7);

            modelBuilder.Entity<Booking>()
                .Property(b => b.TotalEstimatedAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Booking>()
                .Property(b => b.PaidAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<BookingDetail>()
                .Property(bd => bd.PricePerNight)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Equipment>()
                .Property(e => e.BasePrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Equipment>()
                .Property(e => e.DefaultPriceIfLost)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.FinalTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.TaxAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.TotalRoomAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.TotalServiceAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<LossAndDamage>()
                .Property(l => l.PenaltyAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderService>()
                .Property(o => o.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderServiceDetail>()
                .Property(o => o.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payment>()
                .Property(p => p.AmountPaid)
                .HasPrecision(18, 2);

            modelBuilder.Entity<RoomInventory>()
                .Property(r => r.PriceIfLost)
                .HasPrecision(18, 2);

            modelBuilder.Entity<RoomType>()
                .Property(r => r.BasePrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<RoomType>()
                .Property(r => r.Size)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Service>()
                .Property(s => s.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Voucher>()
                .Property(v => v.DiscountValue)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Voucher>()
                .Property(v => v.MinBookingValue)
                .HasPrecision(18, 2);

            // User-Membership relationship (one-to-one)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Membership)
                .WithOne(m => m.User)
                .HasForeignKey<Membership>(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            base.OnModelCreating(modelBuilder);
        }

    }
}