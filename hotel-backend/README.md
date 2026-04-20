# Hotel Backend API

Backend .NET Core 8 cho hệ thống quản lý khách sạn với Entity Framework Core và JWT authentication.

## Cấu trúc Project

```
hotel-backend/
├── Controllers/
│   ├── AuthController.cs
│   ├── BookingController.cs
│   └── RoomController.cs
├── Data/
│   └── ApplicationDbContext.cs
├── Models/
│   ├── User.cs
│   ├── Room.cs
│   ├── Booking.cs
│   ├── Payment.cs
│   ├── Service.cs
│   └── Content.cs
├── Services/
│   ├── IServices.cs
│   └── AuthService.cs
├── appsettings.json
├── HotelBackend.csproj
└── Program.cs
```

## Chạy Backend

1. **Cài đặt .NET 8 SDK** (nếu chưa có)

2. **Chạy SQL Server** và import file `hotel.sql` để tạo database

3. **Cập nhật connection string** trong `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=YOUR_SERVER;Database=hotel;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```

4. **Build và chạy**:
   ```bash
   cd hotel-backend
   dotnet build
   dotnet run
   ```

Backend sẽ chạy trên `http://localhost:5000` hoặc port được chỉ định.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập

### Rooms
- `GET /api/rooms/types` - Danh sách loại phòng
- `GET /api/rooms/available?checkIn=...&checkOut=...` - Phòng trống
- `PUT /api/rooms/{id}/status` - Cập nhật trạng thái phòng

### Bookings
- `GET /api/bookings/{code}` - Lấy booking theo mã
- `GET /api/bookings?identifier=...&type=...` - Tìm booking theo mã/SĐT
- `POST /api/bookings/search` - Tìm phòng trống
- `POST /api/bookings` - Tạo booking
- `POST /api/bookings/check-in` - Check-in

## Cập nhật Frontend

Trong `hotel-fe/src/api/`, thay thế mock data bằng fetch calls:

```typescript
// Thay vì mock data
export const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

Tương tự cho các API khác.

## Lưu ý

- Các service implementations khác (RoomService, BookingService, etc.) cần được implement tương tự AuthService
- Cần thêm logic nghiệp vụ cho việc tính toán phòng trống, hóa đơn, etc.
- JWT token cần được gửi trong header `Authorization: Bearer <token>` cho các API protected