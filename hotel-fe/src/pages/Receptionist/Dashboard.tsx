import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, ListGroup, Form, InputGroup, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaSignInAlt, FaBed, FaSearch, FaClock, FaCreditCard, FaPlus, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getBookings } from '../../api/booking';
import { getRooms } from '../../api/rooms';
import { showToast } from '../../components/common/ToastNotification';

const ReceptionistDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [todayCheckins, setTodayCheckins] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      const results = recentBookings.filter(booking =>
        booking.bookingCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <Link to="/receptionist/create-booking" className="btn btn-success me-2">
            <FaPlus className="me-1" /> Tạo phòng mới
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
              Khách check-in hôm nay ({todayCheckins.length})
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {todayCheckins.map(checkin => (
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
              {availableRooms.map((roomType, index) => (
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
                  {recentBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.bookingCode}</td>
                      <td>{booking.guestName}</td>
                      <td>{booking.checkInDate}</td>
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
              <h1 className="text-danger">{pendingPayments}</h1>
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
