using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelBackend.Migrations
{
    /// <inheritdoc />
    public partial class data : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "id", "name", "description" },
                values: new object[,]
                {
                    { 1, "Admin", "System administrator" },
                    { 2, "Manager", "Hotel manager" },
                    { 3, "Housekeeping", "Housekeeping staff" },
                    { 4, "Receptionist", "Front desk staff" },
                    { 5, "Guest", "Hotel guest" }
                });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "id", "name" },
                values: new object[,]
                {
                    { 1, "manage_users" },
                    { 2, "manage_rooms" },
                    { 3, "manage_bookings" },
                    { 4, "manage_content" },
                    { 5, "manage_services" },
                    { 6, "view_reports" }
                });

            migrationBuilder.InsertData(
                table: "Role_Permissions",
                columns: new[] { "role_id", "permission_id" },
                values: new object[,]
                {
                    { 1, 1 },
                    { 1, 2 },
                    { 1, 3 },
                    { 1, 4 },
                    { 1, 5 },
                    { 1, 6 },
                    { 2, 2 },
                    { 2, 3 },
                    { 2, 4 },
                    { 2, 5 },
                    { 2, 6 },
                    { 3, 2 },
                    { 4, 3 },
                    { 4, 5 }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[]
                {
                    "id",
                    "role_id",
                    "full_name",
                    "email",
                    "phone",
                    "password_hash",
                    "status",
                    "avatar_url",
                    "created_at",
                    "date_of_birth",
                    "address"
                },
                values: new object[,]
                {
                    {
                        1,
                        1,
                        "Admin User",
                        "admin@hotel.test",
                        "0900000001",
                        BCrypt.Net.BCrypt.HashPassword("admin123"),
                        true,
                        null,
                        new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                        "1 Admin St"
                    },
                    {
                        2,
                        2,
                        "Manager User",
                        "manager@hotel.test",
                        "0900000002",
                        BCrypt.Net.BCrypt.HashPassword("manager123"),
                        true,
                        null,
                        new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(1995, 6, 15, 0, 0, 0, DateTimeKind.Utc),
                        "2 Manager St"
                    },
                    {
                        3,
                        5,
                        "Guest User",
                        "guest@hotel.test",
                        "0900000003",
                        BCrypt.Net.BCrypt.HashPassword("guest123"),
                        true,
                        null,
                        new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(1998, 9, 9, 0, 0, 0, DateTimeKind.Utc),
                        "3 Guest St"
                    },
                    {
                        4,
                        3,
                        "Housekeeping User",
                        "housekeeping@hotel.test",
                        "0900000004",
                        BCrypt.Net.BCrypt.HashPassword("housekeeping123"),
                        true,
                        null,
                        new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(1992, 3, 10, 0, 0, 0, DateTimeKind.Utc),
                        "4 Housekeeping St"
                    },
                    {
                        5,
                        4,
                        "Receptionist User",
                        "receptionist@hotel.test",
                        "0900000005",
                        BCrypt.Net.BCrypt.HashPassword("receptionist123"),
                        true,
                        null,
                        new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(1993, 8, 20, 0, 0, 0, DateTimeKind.Utc),
                        "5 Reception St"
                    }
                });

            migrationBuilder.InsertData(
                table: "Article_Categories",
                columns: new[] { "id", "name", "is_active" },
                values: new object[,]
                {
                    { 1, "News", true },
                    { 2, "Tips", true },
                    { 3, "Events", true }
                });

            migrationBuilder.InsertData(
                table: "Articles",
                columns: new[]
                {
                    "id",
                    "category_id",
                    "author_id",
                    "title",
                    "slug",
                    "content",
                    "thumbnail_url",
                    "published_at",
                    "is_active"
                },
                values: new object[,]
                {
                    {
                        1,
                        1,
                        1,
                        "Grand Opening",
                        "grand-opening",
                        "We are excited to welcome guests to our grand opening.",
                        "https://example.com/thumbnail-1.jpg",
                        new DateTime(2026, 5, 4, 8, 0, 0, DateTimeKind.Utc),
                        true
                    },
                    {
                        2,
                        2,
                        2,
                        "Packing Tips",
                        "packing-tips",
                        "Simple packing tips for a smooth trip.",
                        "https://example.com/thumbnail-2.jpg",
                        new DateTime(2026, 5, 5, 8, 0, 0, DateTimeKind.Utc),
                        true
                    }
                });

            migrationBuilder.InsertData(
                table: "Amenities",
                columns: new[] { "id", "name", "icon_url", "is_active" },
                values: new object[,]
                {
                    { 1, "Wi-Fi", "https://example.com/icons/wifi.svg", true },
                    { 2, "Pool", "https://example.com/icons/pool.svg", true },
                    { 3, "Breakfast", "https://example.com/icons/breakfast.svg", true }
                });

            migrationBuilder.InsertData(
                table: "Room_Types",
                columns: new[]
                {
                    "id",
                    "name",
                    "description",
                    "base_price",
                    "capacity_adults",
                    "capacity_children",
                    "size_sqm",
                    "bed_type",
                    "view_type",
                    "slug",
                    "content",
                    "is_active"
                },
                values: new object[,]
                {
                    {
                        1,
                        "Deluxe King",
                        "Spacious room with king bed.",
                        150m,
                        2,
                        1,
                        32.5m,
                        "King",
                        "City",
                        "deluxe-king",
                        "Deluxe king room with city view.",
                        true
                    },
                    {
                        2,
                        "Family Suite",
                        "Suite for families.",
                        220m,
                        2,
                        2,
                        48.0m,
                        "Queen",
                        "Garden",
                        "family-suite",
                        "Family suite with extra living space.",
                        true
                    },
                    {
                        3,
                        "Standard Twin",
                        "Compact twin room.",
                        90m,
                        2,
                        0,
                        24.0m,
                        "Twin",
                        "None",
                        "standard-twin",
                        "Standard twin room for short stays.",
                        true
                    }
                });

            migrationBuilder.InsertData(
                table: "RoomType_Amenities",
                columns: new[] { "room_type_id", "amenity_id" },
                values: new object[,]
                {
                    { 1, 1 },
                    { 1, 3 },
                    { 2, 1 },
                    { 2, 2 },
                    { 2, 3 },
                    { 3, 1 }
                });

            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[]
                {
                    "id",
                    "room_type_id",
                    "room_number",
                    "floor",
                    "status",
                    "cleaning_status",
                    "extension_number"
                },
                values: new object[,]
                {
                    { 1, 1, "101", 1, "available", "clean", "1101" },
                    { 2, 1, "102", 1, "available", "clean", "1102" },
                    { 3, 2, "201", 2, "occupied", "dirty", "1201" },
                    { 4, 2, "202", 2, "available", "clean", "1202" },
                    { 5, 3, "301", 3, "available", "clean", "1301" },
                    { 6, 3, "302", 3, "maintenance", "dirty", "1302" }
                });

            migrationBuilder.InsertData(
                table: "Room_Images",
                columns: new[] { "id", "room_type_id", "image_url", "is_primary", "is_active" },
                values: new object[,]
                {
                    { 1, 1, "https://example.com/rooms/deluxe-1.jpg", true, true },
                    { 2, 2, "https://example.com/rooms/family-1.jpg", true, true },
                    { 3, 3, "https://example.com/rooms/standard-1.jpg", true, true }
                });

            migrationBuilder.InsertData(
                table: "Service_Categories",
                columns: new[] { "id", "name" },
                values: new object[,]
                {
                    { 1, "Spa" },
                    { 2, "Laundry" },
                    { 3, "Dining" }
                });

            migrationBuilder.InsertData(
                table: "Services",
                columns: new[] { "id", "category_id", "name", "description", "price", "unit" },
                values: new object[,]
                {
                    { 1, 1, "Full Body Massage", "60-minute massage.", 50m, "session" },
                    { 2, 2, "Wash and Fold", "Laundry service.", 5m, "kg" },
                    { 3, 3, "Breakfast Buffet", "Morning buffet.", 12m, "person" }
                });

            migrationBuilder.InsertData(
                table: "Equipments",
                columns: new[]
                {
                    "id",
                    "ItemCode",
                    "Name",
                    "Category",
                    "Unit",
                    "TotalQuantity",
                    "InUseQuantity",
                    "DamagedQuantity",
                    "LiquidatedQuantity",
                    "BasePrice",
                    "DefaultPriceIfLost",
                    "Supplier",
                    "IsActive",
                    "CreatedAt",
                    "UpdatedAt",
                    "ImageUrl"
                },
                values: new object[,]
                {
                    {
                        1,
                        "EQ-001",
                        "Hair Dryer",
                        "Appliance",
                        "piece",
                        20,
                        5,
                        1,
                        0,
                        25m,
                        30m,
                        "Hotel Supply Co",
                        true,
                        new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                        "https://example.com/equipment/hair-dryer.jpg"
                    },
                    {
                        2,
                        "EQ-002",
                        "Electric Kettle",
                        "Appliance",
                        "piece",
                        30,
                        10,
                        0,
                        0,
                        18m,
                        22m,
                        "Hotel Supply Co",
                        true,
                        new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                        "https://example.com/equipment/kettle.jpg"
                    },
                    {
                        3,
                        "EQ-003",
                        "Bathrobe",
                        "Linen",
                        "piece",
                        50,
                        12,
                        2,
                        0,
                        12m,
                        15m,
                        "Linen Co",
                        true,
                        new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                        "https://example.com/equipment/bathrobe.jpg"
                    }
                });

            migrationBuilder.InsertData(
                table: "Room_Inventory",
                columns: new[]
                {
                    "id",
                    "room_id",
                    "quantity",
                    "price_if_lost",
                    "note",
                    "is_active",
                    "item_type",
                    "EquipmentId"
                },
                values: new object[,]
                {
                    { 1, 1, 1, 30m, "Hair dryer", true, "equipment", 1 },
                    { 2, 5, 2, 15m, "Bathrobe", true, "equipment", 3 }
                });

            migrationBuilder.InsertData(
                table: "Vouchers",
                columns: new[]
                {
                    "id",
                    "code",
                    "discount_type",
                    "discount_value",
                    "min_booking_value",
                    "valid_from",
                    "valid_to",
                    "usage_limit",
                    "used_count"
                },
                values: new object[,]
                {
                    {
                        1,
                        "WELCOME10",
                        "percent",
                        10m,
                        50m,
                        new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc),
                        500,
                        0
                    },
                    {
                        2,
                        "VIP200",
                        "amount",
                        200m,
                        1000m,
                        new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc),
                        50,
                        0
                    }
                });

            migrationBuilder.InsertData(
                table: "Bookings",
                columns: new[]
                {
                    "id",
                    "user_id",
                    "guest_name",
                    "guest_phone",
                    "guest_email",
                    "booking_code",
                    "voucher_id",
                    "status",
                    "total_estimated_amount",
                    "paid_amount",
                    "loyalty_earned",
                    "hold_expires",
                    "created_at",
                    "updated_at"
                },
                values: new object[,]
                {
                    {
                        1,
                        3,
                        "Nguyen Van A",
                        "0900000101",
                        "guest1@hotel.test",
                        "BK20260504-001",
                        1,
                        "confirmed",
                        350m,
                        100m,
                        30,
                        new DateTime(2026, 5, 5, 12, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 5, 4, 9, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 5, 4, 9, 30, 0, DateTimeKind.Utc)
                    },
                    {
                        2,
                        3,
                        "Tran Thi B",
                        "0900000102",
                        "guest2@hotel.test",
                        "BK20260504-002",
                        null,
                        "pending",
                        180m,
                        0m,
                        15,
                        new DateTime(2026, 5, 6, 12, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 5, 4, 10, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 5, 4, 10, 0, 0, DateTimeKind.Utc)
                    }
                });

            migrationBuilder.InsertData(
                table: "Booking_Details",
                columns: new[]
                {
                    "id",
                    "booking_id",
                    "room_id",
                    "room_type_id",
                    "check_in_date",
                    "check_out_date",
                    "price_per_night"
                },
                values: new object[,]
                {
                    {
                        1,
                        1,
                        1,
                        1,
                        new DateTime(2026, 6, 1, 14, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 6, 3, 12, 0, 0, DateTimeKind.Utc),
                        150m
                    },
                    {
                        2,
                        2,
                        5,
                        3,
                        new DateTime(2026, 6, 10, 14, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 6, 12, 12, 0, 0, DateTimeKind.Utc),
                        90m
                    }
                });

            migrationBuilder.InsertData(
                table: "Invoices",
                columns: new[]
                {
                    "id",
                    "booking_id",
                    "total_room_amount",
                    "total_service_amount",
                    "discount_amount",
                    "tax_amount",
                    "final_total",
                    "status",
                    "created_at",
                    "total_damage_amount"
                },
                values: new object[,]
                {
                    {
                        1,
                        1,
                        300m,
                        50m,
                        30m,
                        10m,
                        330m,
                        "paid",
                        new DateTime(2026, 6, 3, 12, 30, 0, DateTimeKind.Utc),
                        0m
                    },
                    {
                        2,
                        2,
                        180m,
                        0m,
                        0m,
                        9m,
                        189m,
                        "unpaid",
                        new DateTime(2026, 6, 12, 12, 30, 0, DateTimeKind.Utc),
                        0m
                    }
                });

            migrationBuilder.InsertData(
                table: "Payments",
                columns: new[]
                {
                    "id",
                    "invoice_id",
                    "payment_method",
                    "amount_paid",
                    "transaction_code",
                    "payment_date"
                },
                values: new object[,]
                {
                    {
                        1,
                        1,
                        "card",
                        330m,
                        "TXN-0001",
                        new DateTime(2026, 6, 3, 12, 45, 0, DateTimeKind.Utc)
                    }
                });

            migrationBuilder.InsertData(
                table: "Reviews",
                columns: new[]
                {
                    "id",
                    "user_id",
                    "booking_id",
                    "room_type_id",
                    "rating",
                    "comment",
                    "created_at",
                    "status",
                    "reviewed_by",
                    "reviewed_at",
                    "rejection_reason",
                    "ReviewerId"
                },
                values: new object[,]
                {
                    {
                        1,
                        3,
                        1,
                        1,
                        5,
                        "Great stay.",
                        new DateTime(2026, 6, 4, 8, 0, 0, DateTimeKind.Utc),
                        "approved",
                        1,
                        new DateTime(2026, 6, 4, 9, 0, 0, DateTimeKind.Utc),
                        null,
                        1
                    }
                });

            migrationBuilder.InsertData(
                table: "Order_Services",
                columns: new[] { "id", "booking_detail_id", "order_date", "total_amount", "status" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 6, 2, 10, 0, 0, DateTimeKind.Utc), 50m, "completed" },
                    { 2, 1, new DateTime(2026, 6, 2, 12, 0, 0, DateTimeKind.Utc), 24m, "completed" }
                });

            migrationBuilder.InsertData(
                table: "Order_Service_Details",
                columns: new[] { "id", "order_service_id", "service_id", "quantity", "unit_price" },
                values: new object[,]
                {
                    { 1, 1, 1, 1, 50m },
                    { 2, 2, 3, 2, 12m }
                });

            migrationBuilder.InsertData(
                table: "Memberships",
                columns: new[] { "id", "tier_name", "min_points", "discount_percent", "user_id" },
                values: new object[,]
                {
                    { 1, "Silver", 1000, 5m, 3 }
                });

            migrationBuilder.InsertData(
                table: "Notifications",
                columns: new[]
                {
                    "id",
                    "user_id",
                    "title",
                    "content",
                    "type",
                    "reference_link",
                    "is_read",
                    "created_at"
                },
                values: new object[,]
                {
                    {
                        1,
                        3,
                        "Booking Confirmed",
                        "Your booking BK20260504-001 is confirmed.",
                        "booking",
                        "/bookings/1",
                        false,
                        new DateTime(2026, 5, 4, 9, 35, 0, DateTimeKind.Utc)
                    },
                    {
                        2,
                        2,
                        "New Review",
                        "A new review needs approval.",
                        "review",
                        "/reviews/1",
                        false,
                        new DateTime(2026, 6, 4, 9, 5, 0, DateTimeKind.Utc)
                    }
                });

            migrationBuilder.InsertData(
                table: "Attractions",
                columns: new[]
                {
                    "id",
                    "name",
                    "distance_km",
                    "description",
                    "map_embed_link",
                    "latitude",
                    "longitude",
                    "address",
                    "is_active"
                },
                values: new object[,]
                {
                    {
                        1,
                        "City Museum",
                        1.50m,
                        "Local history museum.",
                        "https://maps.example.com/museum",
                        10.7626220m,
                        106.6601720m,
                        "123 Main St",
                        true
                    },
                    {
                        2,
                        "Central Park",
                        2.00m,
                        "Green space for walks.",
                        "https://maps.example.com/park",
                        10.7750000m,
                        106.7000000m,
                        "456 Park Ave",
                        true
                    }
                });

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Attractions",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Attractions",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Notifications",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Notifications",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Memberships",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Order_Service_Details",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Order_Service_Details",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Order_Services",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Order_Services",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Payments",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Invoices",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Invoices",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Booking_Details",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Booking_Details",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Bookings",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Bookings",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Vouchers",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Vouchers",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Room_Inventory",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Room_Inventory",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Equipments",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Equipments",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Equipments",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Services",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Services",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Services",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Service_Categories",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Service_Categories",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Service_Categories",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Room_Images",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Room_Images",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Room_Images",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "RoomType_Amenities",
                keyColumns: new[] { "room_type_id", "amenity_id" },
                keyValues: new object[] { 1, 1 });

            migrationBuilder.DeleteData(
                table: "RoomType_Amenities",
                keyColumns: new[] { "room_type_id", "amenity_id" },
                keyValues: new object[] { 1, 3 });

            migrationBuilder.DeleteData(
                table: "RoomType_Amenities",
                keyColumns: new[] { "room_type_id", "amenity_id" },
                keyValues: new object[] { 2, 1 });

            migrationBuilder.DeleteData(
                table: "RoomType_Amenities",
                keyColumns: new[] { "room_type_id", "amenity_id" },
                keyValues: new object[] { 2, 2 });

            migrationBuilder.DeleteData(
                table: "RoomType_Amenities",
                keyColumns: new[] { "room_type_id", "amenity_id" },
                keyValues: new object[] { 2, 3 });

            migrationBuilder.DeleteData(
                table: "RoomType_Amenities",
                keyColumns: new[] { "room_type_id", "amenity_id" },
                keyValues: new object[] { 3, 1 });

            migrationBuilder.DeleteData(
                table: "Room_Types",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Room_Types",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Room_Types",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Amenities",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Amenities",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Amenities",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Article_Categories",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Article_Categories",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Article_Categories",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 1, 1 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 1, 2 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 1, 3 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 1, 4 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 1, 5 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 1, 6 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 2, 2 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 2, 3 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 2, 4 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 2, 5 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 2, 6 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 3, 2 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 4, 3 });

            migrationBuilder.DeleteData(
                table: "Role_Permissions",
                keyColumns: new[] { "role_id", "permission_id" },
                keyValues: new object[] { 4, 5 });

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 5);

        }
    }
}
