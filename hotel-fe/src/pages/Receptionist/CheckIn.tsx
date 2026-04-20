import React, { useState } from 'react';
import { Row, Col, Card, Button, Form, Spinner, Alert, Modal, Badge, InputGroup } from 'react-bootstrap';
import { getBookingByIdentifier, getAvailableRooms, checkIn } from '../../api/booking';
import { showToast } from '../../components/common/ToastNotification';
import { Search, CheckCircle, User, Calendar, DollarSign, LogIn  } from 'react-feather'; // icon

const CheckIn: React.FC = () => {
  const [searchType, setSearchType] = useState<'code' | 'phone'>('code');
  const [searchValue, setSearchValue] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const searchBooking = async () => {
    if (!searchValue.trim()) return;
    setLoading(true);
    setNotFound(false);
    setBooking(null);
    setSelectedRoom(null);

    // Gọi API với identifier (có thể là code hoặc phone)
    const data = await getBookingByIdentifier(searchValue.trim(), searchType);
    if (!data) {
      setNotFound(true);
      setRooms([]);
      setLoading(false);
      return;
    }

    setBooking(data);
    const avail = await getAvailableRooms(data.roomTypeId, data.checkIn, data.checkOut);
    setRooms(avail);
    setLoading(false);
  };

  const handleCheckIn = () => {
    if (!booking || !selectedRoom) return;
    setShowConfirm(true);
  };

  const performCheckIn = async () => {
    if (!booking || !selectedRoom) return;
    setLoading(true);
    await checkIn(booking.id, [selectedRoom]);
    setShowConfirm(false);
    // Reload lại thông tin booking sau check-in
    const updatedBooking = await getBookingByIdentifier(searchValue, searchType);
    setBooking(updatedBooking);
    setRooms([]);
    setSelectedRoom(null);
    setLoading(false);
    showToast('success', 'Check-in thành công');
  };

  // Format ngày tháng
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="p-3" style={{ background: '#f4f7fc', minHeight: '100vh' }}>
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
        <Card.Body className="p-4">
          {/* Header với gradient */}
          <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3">
              <LogIn size={28} className="text-primary" />
            </div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e466e' }}>Check-in khách hàng</h3>
            <Badge bg="warning" className="ms-2 px-3 py-2">Quầy lễ tân</Badge>
          </div>

          {/* Thanh tìm kiếm */}
          <Row className="g-3 mb-4">
            <Col md={3}>
              <Form.Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="rounded-pill border-0 bg-light shadow-sm"
              >
                <option value="code">Mã booking</option>
                <option value="phone">Số điện thoại</option>
              </Form.Select>
            </Col>
            <Col md={7}>
              <InputGroup className="shadow-sm">
                <InputGroup.Text className="bg-white border-end-0">
                  <Search size={18} className="text-secondary" />
                </InputGroup.Text>
                <Form.Control
                  placeholder={searchType === 'code' ? 'Nhập mã booking...' : 'Nhập số điện thoại khách hàng...'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchBooking()}
                  className="border-start-0 py-2"
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Button
                variant="primary"
                onClick={searchBooking}
                disabled={loading}
                className="w-100 rounded-pill py-2 fw-semibold shadow-sm"
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Tìm kiếm'}
              </Button>
            </Col>
          </Row>

          {/* Thông báo không tìm thấy */}
          {notFound && (
            <Alert variant="danger" className="rounded-3">
              ⚠️ Không tìm thấy booking với {searchType === 'code' ? 'mã' : 'số điện thoại'} này.
            </Alert>
          )}

          {/* Kết quả booking */}
          {booking && (
            <Row className="g-4 mt-2">
              <Col lg={7}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="fw-bold text-primary">
                        <User size={20} className="me-2" />
                        Thông tin đặt phòng
                      </h5>
                      <Badge bg={booking.status === 'confirmed' ? 'success' : 'warning'} pill>
                        {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xử lý'}
                      </Badge>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="mb-2">
                          <span className="text-secondary small">Mã booking</span>
                          <p className="fw-bold mb-0">{booking.code}</p>
                        </div>
                        <div className="mb-2">
                          <span className="text-secondary small">Họ tên khách</span>
                          <p className="fw-bold mb-0">{booking.guestName}</p>
                        </div>
                        <div className="mb-2">
                          <span className="text-secondary small">Số điện thoại</span>
                          <p className="fw-bold mb-0">{booking.guestPhone || 'Chưa cập nhật'}</p>
                        </div>
                        <div className="mb-2">
                          <span className="text-secondary small">Email</span>
                          <p className="fw-bold mb-0">{booking.guestEmail}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-2">
                          <span className="text-secondary small">Loại phòng</span>
                          <p className="fw-bold mb-0">{booking.roomTypeName}</p>
                        </div>
                        <div className="mb-2">
                          <span className="text-secondary small">
                            <Calendar size={14} className="me-1" /> Ngày nhận
                          </span>
                          <p className="fw-bold mb-0">{formatDate(booking.checkIn)}</p>
                        </div>
                        <div className="mb-2">
                          <span className="text-secondary small">
                            <Calendar size={14} className="me-1" /> Ngày trả
                          </span>
                          <p className="fw-bold mb-0">{formatDate(booking.checkOut)}</p>
                        </div>
                        <div className="mb-2">
                          <span className="text-secondary small">
                            <DollarSign size={14} className="me-1" /> Tổng tiền
                          </span>
                          <p className="fw-bold text-success mb-0">
                            {booking.totalAmount.toLocaleString()} VND
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={5}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="p-4">
                    <h5 className="fw-bold text-primary mb-3">
                      <LogIn size={20} className="me-2" />
                      Chọn phòng trống
                    </h5>
                    {rooms.length === 0 ? (
                      <Alert variant="warning" className="rounded-3">
                        😞 Không có phòng trống cho loại phòng này trong khoảng thời gian yêu cầu.
                      </Alert>
                    ) : (
                      <>
                        <Form.Select
                          value={selectedRoom ?? ''}
                          onChange={(e) => setSelectedRoom(Number(e.target.value))}
                          className="rounded-3 py-2 mb-3"
                        >
                          <option value="">-- Chọn phòng --</option>
                          {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              Phòng {room.number} - Tầng {room.floor} - {room.pricePerNight?.toLocaleString()} VND/đêm
                            </option>
                          ))}
                        </Form.Select>
                        <Button
                          variant="success"
                          onClick={handleCheckIn}
                          disabled={!selectedRoom}
                          className="w-100 rounded-pill py-2 fw-semibold shadow-sm"
                        >
                          <CheckCircle size={18} className="me-2" />
                          Xác nhận check-in
                        </Button>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Modal xác nhận check-in */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Xác nhận check‑in</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <p>
            Bạn có chắc muốn check‑in cho booking <strong className="text-primary">{booking?.code}</strong> với phòng{' '}
            <strong className="text-success">
              {rooms.find((r) => r.id === selectedRoom)?.number}
            </strong> không?
          </p>
          <div className="bg-light p-3 rounded-3 mt-3">
            <small className="text-secondary">Thông tin khách: {booking?.guestName}</small><br />
            <small className="text-secondary">Ngày nhận: {formatDate(booking?.checkIn)}</small>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShowConfirm(false)} className="rounded-pill px-4">
            Hủy
          </Button>
          <Button variant="primary" onClick={performCheckIn} className="rounded-pill px-4" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Xác nhận'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckIn;