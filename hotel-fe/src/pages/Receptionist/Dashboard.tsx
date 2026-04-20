import React, { useState } from 'react';
import { Row, Col, Card, Button, ListGroup, Form, InputGroup, Table, Badge, Alert } from 'react-bootstrap';
import { FaSignInAlt, FaBed, FaSearch, FaClock, FaCreditCard, FaPlus, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Mock data
const mockTodayCheckins = [
  { id: 1, code: 'BK001', guestName: 'Nguyễn Văn A', room: '101', checkInTime: '14:00' },
  { id: 2, code: 'BK002', guestName: 'Trần Thị B', room: '205', checkInTime: '15:30' },
  { id: 3, code: 'BK003', guestName: 'Lê Văn C', room: '312', checkInTime: '16:00' },
];
const mockAvailableRooms = [
  { type: 'Standard', available: 5, total: 20 },
  { type: 'Deluxe', available: 3, total: 15 },
  { type: 'Suite', available: 1, total: 5 },
];
const mockRecentBookings = [
  { id: 1, code: 'BK001', guestName: 'Nguyễn Văn A', checkIn: '2024-04-10', status: 'CheckedIn' },
  { id: 2, code: 'BK002', guestName: 'Trần Thị B', checkIn: '2024-04-10', status: 'Pending' },
  { id: 3, code: 'BK003', guestName: 'Lê Văn C', checkIn: '2024-04-09', status: 'CheckedOut' },
  { id: 4, code: 'BK004', guestName: 'Phạm Thị D', checkIn: '2024-04-09', status: 'CheckedOut' },
  { id: 5, code: 'BK005', guestName: 'Hoàng Văn E', checkIn: '2024-04-08', status: 'Cancelled' },
];
const mockPendingPayments = 3;

const ReceptionistDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock search logic
    if (searchQuery) {
      const results = mockRecentBookings.filter(booking =>
        booking.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.guestName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CheckedIn': return <Badge bg="success">Đã nhận phòng</Badge>;
      case 'Pending': return <Badge bg="warning">Chờ xử lý</Badge>;
      case 'CheckedOut': return <Badge bg="secondary">Đã trả phòng</Badge>;
      case 'Cancelled': return <Badge bg="danger">Đã hủy</Badge>;
      default: return <Badge bg="light">{status}</Badge>;
    }
  };

  return (
    <div>
      <h3 className="mb-4">Receptionist Dashboard - Lễ tân</h3>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/receptionist/check-in" className="btn btn-primary me-2">
              <FaSignInAlt className="me-1" /> Check-in
            </Link>
            <Link to="/receptionist/search-room" className="btn btn-success me-2">
              <FaBed className="me-1" /> Tìm phòng
            </Link>
            <Link to="/receptionist/booking" className="btn btn-info">
              <FaPlus className="me-1" /> Đặt phòng mới
            </Link>
          </div>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* Today Check-ins */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <FaSignInAlt className="me-2" />
              Khách check-in hôm nay ({mockTodayCheckins.length})
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {mockTodayCheckins.map(checkin => (
                  <ListGroup.Item key={checkin.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{checkin.guestName}</strong> - {checkin.code}
                      <br />
                      <small className="text-muted">Phòng {checkin.room} • {checkin.checkInTime}</small>
                    </div>
                    <Link to={`/receptionist/check-in/${checkin.id}`} className="btn btn-outline-primary btn-sm">
                      Check-in
                    </Link>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Available Rooms */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <FaBed className="me-2" />
              Phòng trống theo loại
            </Card.Header>
            <Card.Body>
              {mockAvailableRooms.map((roomType, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                  <span>{roomType.type}</span>
                  <Badge bg="success">{roomType.available}/{roomType.total}</Badge>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Search */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <FaSearch className="me-2" />
              Tìm kiếm booking nhanh
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Nhập mã booking hoặc tên/SĐT khách"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" variant="outline-primary">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form>
              {searchResults.length > 0 && (
                <div className="mt-3">
                  <h6>Kết quả tìm kiếm:</h6>
                  <ListGroup>
                    {searchResults.map(result => (
                      <ListGroup.Item key={result.id} className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{result.code}</strong> - {result.guestName}
                          <br />
                          <small className="text-muted">Check-in: {result.checkIn}</small>
                        </div>
                        {getStatusBadge(result.status)}
                        <Link to={`/receptionist/booking/${result.id}`} className="btn btn-outline-info btn-sm">
                          <FaEye />
                        </Link>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Recent Bookings */}
        <Col md={8}>
          <Card>
            <Card.Header>
              <FaClock className="me-2" />
              Booking gần nhất
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Khách hàng</th>
                    <th>Check-in</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRecentBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.code}</td>
                      <td>{booking.guestName}</td>
                      <td>{booking.checkIn}</td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td>
                        <Link to={`/receptionist/booking/${booking.id}`} className="btn btn-outline-primary btn-sm">
                          <FaEye />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Pending Payments */}
        <Col md={4}>
          <Card className="text-center">
            <Card.Header>
              <FaCreditCard className="me-2 text-danger" />
              Thanh toán chờ xử lý
            </Card.Header>
            <Card.Body>
              <h1 className="text-danger">{mockPendingPayments}</h1>
              <p>booking chưa thanh toán</p>
              <Alert variant="warning">
                <small>Cần xử lý ngay để tránh chậm trễ</small>
              </Alert>
              <Button variant="outline-danger" size="sm">
                Xem chi tiết
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReceptionistDashboard;
