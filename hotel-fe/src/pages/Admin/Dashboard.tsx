import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, Table, Spinner, Alert, Button } from 'react-bootstrap';
import { FaMoneyBillWave, FaUsers, FaBed, FaClipboardList, FaStar, FaChartBar, FaUser, FaCog, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRevenueReport } from '../../api/report';
import { RevenuePoint } from '../../types';
import { Link } from 'react-router-dom';


const AdminDashboard: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [userStats, setUserStats] = useState({ totalUsers: 0, employees: 0, guests: 0 });
  const [roomOccupancy, setRoomOccupancy] = useState({ total: 0, occupied: 0, available: 0 });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setRevenueError(null);

      // Fetch revenue data
      try {
        const data = await getRevenueReport();
        setRevenueData(data || []);
      } catch (revenueErr: any) {
        console.error('Revenue fetch error:', revenueErr);
        setRevenueError(revenueErr?.message || 'Không thể tải doanh thu');
        setRevenueData([]);
      }
      
      // Fetch user stats
      try {
        const usersRes = await fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
        });
        if (usersRes.ok) {
          const users = await usersRes.json();
          const usersList = Array.isArray(users) ? users : (users?.$values || []);
          setUserStats({
            totalUsers: usersList.length,
            employees: usersList.filter((u: any) => u.role === 'Employee' || u.role === 'Manager' || u.role === 'Admin').length,
            guests: usersList.filter((u: any) => u.role === 'Customer').length
          });
        }
      } catch (err) {
        console.error('Error fetching user stats:', err);
      }
      
      // Fetch room occupancy
      try {
        const roomsRes = await fetch('/api/rooms', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
        });
        if (roomsRes.ok) {
          const rooms = await roomsRes.json();
          const roomsList = Array.isArray(rooms) ? rooms : (rooms?.$values || []);
          const occupied = roomsList.filter((r: any) => r.status === 'Occupied').length;
          setRoomOccupancy({
            total: roomsList.length,
            occupied: occupied,
            available: roomsList.length - occupied
          });
        }
      } catch (err) {
        console.error('Error fetching room occupancy:', err);
      }
      
      // Fetch pending reviews
      try {
        const reviewsRes = await fetch('/api/reviews?status=Pending', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
        });
        if (reviewsRes.ok) {
          const reviews = await reviewsRes.json();
          const reviewsList = Array.isArray(reviews) ? reviews : (reviews?.$values || []);
          setPendingReviews(reviewsList.length);
        }
      } catch (err) {
        console.error('Error fetching pending reviews:', err);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải một số dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  return (
    <div className="p-3" style={{ background: '#f4f7fc', minHeight: '100vh' }}>
      {/* Header */}
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden mb-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h3 className="fw-bold mb-1" style={{ color: '#1e466e' }}>Dashboard</h3>
              <p className="text-muted mb-0">Tổng quan hệ thống quản lý khách sạn</p>
            </div>
            <Button variant="outline-primary" size="sm" onClick={loadData}>
              <FaSync className="me-1" /> Làm mới
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* General Error Alert */}
      {error && (
        <Alert variant="warning" dismissible onClose={() => setError(null)} className="mb-3">
          <FaExclamationTriangle className="me-2" /> {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Doanh thu hôm nay</p>
                  <h4 className="text-primary fw-bold mb-0">{totalRevenueToday.toLocaleString()}</h4>
                  <small className="text-muted">VND</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                  <FaMoneyBillWave size={24} className="text-primary" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Doanh thu tháng</p>
                  <h4 className="text-success fw-bold mb-0">{totalRevenueMonth.toLocaleString()}</h4>
                  <small className="text-muted">VND</small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-3">
                  <FaMoneyBillWave size={24} className="text-success" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Người dùng</p>  
                  <h4 className="text-info fw-bold mb-0">{userStats.totalUsers}</h4>
                  <small className="text-muted">{userStats.employees} NV, {userStats.guests} khách</small>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded-3">
                  <FaUsers size={24} className="text-info" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Công suất phòng</p>
                  <h4 className="text-warning fw-bold mb-0">{Math.round((roomOccupancy.occupied / Math.max(roomOccupancy.total, 1)) * 100)}%</h4>
                  <small className="text-muted">{roomOccupancy.occupied}/{roomOccupancy.total} phòng</small>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-3">
                  <FaBed size={24} className="text-warning" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Header className="bg-light p-3 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <FaChartBar className="text-info" />
                <h5 className="mb-0 fw-bold">Doanh thu 7 ngày qua</h5>
              </div>
            </Card.Header>
            <Card.Body>
              {revenueError ? (
                <Alert variant="danger" className="mb-0">
                  <FaExclamationTriangle className="me-2" />
                  {revenueError}
                  <div className="mt-2">
                    <Button size="sm" variant="outline-danger" onClick={() => getRevenueReport().then(setRevenueData).catch(err => setRevenueError(err.message))}>
                      <FaSync className="me-1" /> Thử lại
                    </Button>
                  </div>
                </Alert>
              ) : revenueData.length === 0 ? (
                <Alert variant="info" className="mb-0">
                  Không có dữ liệu doanh thu trong khoảng thời gian này
                </Alert>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number) => [value.toLocaleString() + ' VND', '']} />
                    <Bar dataKey="total" fill="#0d6efd" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* Pending Reviews */}
        <Col md={4}>
          <Card className="shadow-lg border-0 rounded-4 text-center">
            <Card.Body className="p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-3 d-inline-flex mb-3">
                <FaStar size={32} className="text-warning" />
              </div>
              <h5 className="mb-2">Đánh giá chờ duyệt</h5>
              <h2 className="text-warning fw-bold mb-3">{pendingReviews}</h2>
              <Link to="/admin/review-moderation" className="btn btn-outline-warning btn-sm">
                Xem chi tiết
              </Link>
            </Card.Body>
          </Card>
        </Col>

        {/* Top Services */}
        <Col md={4}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Header className="bg-light p-3 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <FaClipboardList className="text-primary" />
                <h6 className="mb-0 fw-bold">Dịch vụ được đặt nhiều</h6>
              </div>
            </Card.Header>
            <Card.Body>
              {topServices.length === 0 ? (
                <p className="text-muted mb-0">Chưa có dữ liệu</p>
              ) : (
                topServices.map((service, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ fontSize: '0.9rem' }}>{service.name}</span>
                    <Badge bg="primary">{service.orders}</Badge>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Links */}
        <Col md={4}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Header className="bg-light p-3 border-bottom">
              <h6 className="mb-0 fw-bold">Điều hướng nhanh</h6>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-2 p-2">
              <Link to="/admin/users" className="btn btn-outline-primary btn-sm">
                <FaUser size={14} className="me-1" /> Quản lý nhân viên
              </Link>
              <Link to="/admin/permissions" className="btn btn-outline-secondary btn-sm">
                <FaCog size={14} className="me-1" /> Phân quyền
              </Link>
              <Link to="/admin/services" className="btn btn-outline-success btn-sm">
                <FaClipboardList size={14} className="me-1" /> Dịch vụ
              </Link>
              <Link to="/admin/vouchers" className="btn btn-outline-warning btn-sm">
                <FaMoneyBillWave size={14} className="me-1" /> Voucher
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
        