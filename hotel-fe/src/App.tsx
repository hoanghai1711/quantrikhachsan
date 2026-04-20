import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Role } from './types/auth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import GuestHome from './pages/guest/GuestHome';
import Membership from './pages/guest/Membership';
import ArticleDetailPage from './pages/guest/ArticleDetailPage';
import AttractionsPage from './pages/guest/AttractionsPage';
import RoomDetailPage from './pages/guest/RoomDetailPage';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import UserManagement from './pages/Admin/UserManagement';
import ServiceManagement from './pages/Admin/ServiceManagement';
import PermissionsManagement from './pages/Admin/PermissionsManagement';
import VoucherManagement from './pages/Admin/VoucherManagement';
import ReviewModeration from './pages/Admin/ReviewModeration';
import RevenueReport from './pages/Admin/RevenueReport';
import BookingList from './pages/Admin/BookingList';
import SuppliesManagement from './pages/Admin/SuppliesManagement';
import ActivityLog from './pages/Admin/ActivityLog';
import RoomManagement from './pages/Admin/RoomManagement';
import CheckIn from './pages/Receptionist/CheckIn';
import SearchRoom from './pages/Receptionist/SearchRoom';
import POS from './pages/Receptionist/POS';
import BookingPage from './pages/Receptionist/BookingPage';
import Checkout from './pages/Receptionist/Checkout';
import MoMoCallback from './pages/Receptionist/MoMoCallback';
import RoomCleaning from './pages/Housekeeping/RoomCleaning';
import ToastNotification from './components/common/ToastNotification';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <ToastNotification />   {/* ← Thêm dòng này để toast hiển thị */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/" 
          element={
            !user || user.role === Role.GUEST ? 
              <GuestHome /> : 
              <Navigate to={user.role === Role.ADMIN || user.role === Role.MANAGER ? '/dashboard' : '/check-in'} />
          } 
        />

        {/* Admin & Manager routes */}
        <Route 
          path="/dashboard" 
          element={
            <MainLayout title="Dashboard">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <Dashboard />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <MainLayout title="Dashboard">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <Dashboard />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/user-management" 
          element={
            <MainLayout title="Quản lý người dùng">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <UserManagement />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <MainLayout title="Quản lý người dùng">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <UserManagement />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/services" 
          element={
            <MainLayout title="Quản lý dịch vụ">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <ServiceManagement />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/admin/services" 
          element={
            <MainLayout title="Quản lý dịch vụ">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <ServiceManagement />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/permissions" 
          element={
            <MainLayout title="Phân quyền">
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <PermissionsManagement />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/admin/permissions" 
          element={
            <MainLayout title="Phân quyền">
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <PermissionsManagement />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/vouchers" 
          element={
            <MainLayout title="Voucher">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <VoucherManagement />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/admin/vouchers" 
          element={
            <MainLayout title="Voucher">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <VoucherManagement />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/reviews" 
          element={
            <MainLayout title="Duyệt đánh giá">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <ReviewModeration />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/admin/review-moderation" 
          element={
            <MainLayout title="Duyệt đánh giá">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <ReviewModeration />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <MainLayout title="Báo cáo doanh thu">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <RevenueReport />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <MainLayout title="Báo cáo doanh thu">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <RevenueReport />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <MainLayout title="Danh sách đơn">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <BookingList />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/admin/orders" 
          element={
            <MainLayout title="Danh sách đơn">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <BookingList />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/pos" 
          element={
            <MainLayout title="POS dịch vụ">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER, Role.RECEPTIONIST]}>
                <POS />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/admin/pos" 
          element={
            <MainLayout title="POS dịch vụ">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER, Role.RECEPTIONIST]}>
                <POS />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route           
          path="/room-types" 
          element={
            <MainLayout title="Quản lý loại phòng">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <RoomManagement />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/admin/room-types" 
          element={
            <MainLayout title="Quản lý loại phòng">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <RoomManagement />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route           
          path="/inventory" 
          element={
            <MainLayout title="Quản lý vật tư">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <SuppliesManagement />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/admin/supplies" 
          element={
            <MainLayout title="Quản lý vật tư">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                <SuppliesManagement />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/activity-log" 
          element={
            <MainLayout title="Nhật ký hoạt động">
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <ActivityLog />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/search-room" 
          element={
            <MainLayout title="Tìm phòng">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER, Role.RECEPTIONIST, Role.HOUSEKEEPING]}>
                <SearchRoom />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route path="/book/:typeId" element={<BookingPage />} />

        {/* Receptionist routes */}
        <Route 
          path="/check-in" 
          element={
            <MainLayout title="Check-in">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER, Role.RECEPTIONIST]}>
                <CheckIn />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        <Route 
          path="/check-out" 
          element={
            <MainLayout title="Check-out">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER, Role.RECEPTIONIST]}>
                <Checkout />
              </ProtectedRoute>
            </MainLayout>
          } 
        />

        {/* MoMo Callback - Public route (no auth needed for MoMo redirect) */}
        <Route 
          path="/momo-callback" 
          element={<MoMoCallback />} 
        />

        {/* Guest routes */}
        <Route path="/articles" element={<ArticleDetailPage />} />
        <Route path="/articles/:slug" element={<ArticleDetailPage />} />
        <Route path="/attractions" element={<AttractionsPage />} />
        <Route path="/room/:id" element={<RoomDetailPage />} />
        <Route 
          path="/membership" 
          element={
            <MainLayout title="Membership">
              <ProtectedRoute allowedRoles={[Role.GUEST]}>
                <Membership />
              </ProtectedRoute>
            </MainLayout>
          } 
        />

        {/* Housekeeping routes */}
        <Route 
          path="/room-cleaning" 
          element={
            <MainLayout title="Dọn phòng">
              <ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER, Role.HOUSEKEEPING]}>
                <RoomCleaning />
              </ProtectedRoute>
            </MainLayout>
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;