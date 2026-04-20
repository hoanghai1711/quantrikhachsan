import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, Table, Spinner, Alert } from 'react-bootstrap';
import { FaMoneyBillWave, FaUsers, FaBed, FaClipboardList, FaStar, FaChartBar, FaUser, FaCog } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRevenueReport } from '../../api/report';
import { RevenuePoint } from '../../types';
import { Link } from 'react-router-dom';


const mockUserStats = { totalUsers: 150, employees: 25, guests: 125 };
const mockRoomOccupancy = { total: 50, occupied: 35, available: 15 };
const mockRecentActivities = [
  { id: 1, action: 'Check-in phòng 101', user: 'Nguyễn Văn A', time: '5 phút trước' },
  { id: 2, action: 'Thanh toán đơn #1234', user: 'Trần Thị B', time: '15 phút trước' },
  { id: 3, action: 'Đặt phòng Deluxe', user: 'Lê Văn C', time: '40 phút trước' },
  { id: 4, action: 'Dọn dẹp phòng 205', user: 'Phạm Thị D', time: '1 giờ trước' },
  { id: 5, action: 'Cập nhật vật tư', user: 'Hoàng Văn E', time: '2 giờ trước' },
];
const mockTopServices = [
  { name: 'Dịch vụ giặt ủi', orders: 45 },
  { name: 'Ăn sáng tại phòng', orders: 38 },
  { name: 'Massage', orders: 25 },
  { name: 'Thuê xe', orders: 18 },
  { name: 'Đồ uống mini bar', orders: 12 },
];
const mockPendingReviews = 7;

const AdminDashboard: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRevenueReport();
        setRevenueData(data);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        // Fallback to mock data
        setRevenueData([
          { label: 'T2', room: 1250000, service: 420000, damage: 0, total: 1670000 },
          { label: 'T3', room: 1450000, service: 300000, damage: 0, total: 1750000 },
          { label: 'T4', room: 1180000, service: 520000, damage: 0, total: 1700000 },
          { label: 'T5', room: 1600000, service: 380000, damage: 0, total: 1980000 },
          { label: 'T6', room: 1720000, service: 410000, damage: 0, total: 2130000 },
          { label: 'T7', room: 1950000, service: 520000, damage: 0, total: 2470000 },
          { label: 'CN', room: 1820000, service: 460000, damage: 0, total: 2280000 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenueToday = revenueData.length > 0 ? revenueData[revenueData.length - 1].total : 0;
  const totalRevenueMonth = revenueData.reduce((sum, day) => sum + day.total, 0);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h3 className="mb-4">Admin Dashboard - Tổng quan hệ thống</h3>

      {/* KPI Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="text-center p-3 border-primary">
            <FaMoneyBillWave size={40} className="text-primary mb-2" />
            <h5>Doanh thu hôm nay</h5>
            <h3 className="text-primary">{totalRevenueToday.toLocaleString()} VND</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center p-3 border-success">
            <FaMoneyBillWave size={40} className="text-success mb-2" />
            <h5>Doanh thu tháng</h5>
            <h3 className="text-success">{totalRevenueMonth.toLocaleString()} VND</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center p-3 border-info">
            <FaUsers size={40} className="text-info mb-2" />
            <h5>Người dùng</h5>
            <h6>Tổng: {mockUserStats.totalUsers}</h6>
            <small>Nhân viên: {mockUserStats.employees} | Khách: {mockUserStats.guests}</small>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center p-3 border-warning">
            <FaBed size={40} className="text-warning mb-2" />
            <h5>Công suất phòng</h5>
            <h3 className="text-warning">{Math.round((mockRoomOccupancy.occupied / mockRoomOccupancy.total) * 100)}%</h3>
            <small>{mockRoomOccupancy.occupied}/{mockRoomOccupancy.total} phòng</small>
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <FaChartBar className="me-2" />
              Doanh thu 7 ngày qua
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number) => [value.toLocaleString() + ' VND', '']} />
                  <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Recent Activities */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <FaClipboardList className="me-2" />
              Hoạt động gần đây
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                <tbody>
                  {mockRecentActivities.map(activity => (
                    <tr key={activity.id}>
                      <td>
                        <strong>{activity.action}</strong><br />
                        <small className="text-muted">{activity.user} • {activity.time}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Top Services */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <FaStar className="me-2" />
              Dịch vụ được đặt nhiều nhất
            </Card.Header>
            <Card.Body>
              {mockTopServices.map((service, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                  <span>{service.name}</span>
                  <Badge bg="primary">{service.orders} đơn</Badge>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Reviews Badge */}
      <Row className="mt-4">
        <Col>
          <Card className="text-center p-3">
            <FaStar size={30} className="text-warning mb-2" />
            <h5>Đánh giá chờ duyệt</h5>
            <Badge bg="danger" className="fs-4 p-2">{mockPendingReviews}</Badge>
            <br />
            <Link to="/admin/review-moderation" className="btn btn-outline-primary mt-2">
              Xem chi tiết
            </Link>
          </Card>
        </Col>
      </Row>

      {/* Quick Navigation */}
      <Row className="mt-4">
        <Col>
          <h5>Điều hướng nhanh</h5>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/admin/users" className="btn btn-outline-primary me-2">
              <FaUser className="me-1" /> Quản lý người dùng
            </Link>
            <Link to="/admin/permissions" className="btn btn-outline-secondary me-2">
              <FaCog className="me-1" /> Phân quyền
            </Link>
            <Link to="/admin/services" className="btn btn-outline-success me-2">
              Dịch vụ
            </Link>
            <Link to="/admin/vouchers" className="btn btn-outline-info me-2">
              Voucher
            </Link>
            <Link to="/admin/reports" className="btn btn-outline-warning">
              Báo cáo
            </Link>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;