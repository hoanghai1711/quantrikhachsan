// src/pages/receptionist/CheckIn.tsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Spinner, Alert, Modal, Badge, InputGroup, Table, Form } from 'react-bootstrap';
import { checkIn, createMomoPayment, getAvailableRooms, getInvoice } from '../../api/booking';
import { showToast } from '../../components/common/ToastNotification';
import { Search, CheckCircle, User, Calendar, DollarSign, LogIn, Phone, Mail, Home } from 'react-feather';

const CheckIn: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'MoMo'>('Cash');

  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredBookings(bookings);
    } else {
      const query = searchValue.toLowerCase();
      const filtered = bookings.filter(b =>
        b.bookingCode?.toLowerCase().includes(query) ||
        b.guestName?.toLowerCase().includes(query) ||
        b.guestPhone?.includes(query) ||
        b.guestEmail?.toLowerCase().includes(query)
      );
      setFilteredBookings(filtered);
    }
  }, [searchValue, bookings]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` }
      });
      if (!response.ok) throw new Error('Failed to load bookings');
      let data = await response.json();
      console.log('Raw booking data from API:', data);
      
      if (data && Array.isArray(data.$values)) data = data.$values;
      else if (!Array.isArray(data)) data = [];
      const pendingBookings = data.filter((b: any) =>
        b.status === 'Pending' || b.status === 'Confirmed'
      );
      const normalized = pendingBookings.map((b: any) => {
        const details = b.bookingDetails?.[0];
        const normalized = {
          ...b,
          roomTypeId: b.roomTypeId || details?.roomTypeId || null,
          checkInDate: b.checkInDate || details?.checkInDate || null,
          checkOutDate: b.checkOutDate || details?.checkOutDate || null,
          roomTypeName: b.roomTypeName || details?.roomType?.name || null,
        };
        if (normalized.checkInDate === null || normalized.checkOutDate === null) {
          console.warn('Booking has null dates:', normalized.bookingCode, 'Details:', details);
        }
        return normalized;
      });
      console.log('Normalized bookings:', normalized);
      setBookings(normalized);
      setFilteredBookings(normalized);
    } catch (error) {
      console.error('Error loading bookings:', error);
      showToast('danger', 'Không thể tải danh sách booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBooking = async (booking: any) => {
    setSelectedBooking(booking);
    setSelectedRoomIds(booking.roomIds || []);
  };

  const loadAvailableRooms = async () => {
    if (!selectedBooking) return;
    const { checkInDate, checkOutDate } = selectedBooking;
    if (!checkInDate || !checkOutDate) {
      showToast('warning', 'Thiếu ngày nhận/trả phòng. Vui lòng cập nhật booking.');
      return;
    }
    setLoadingRooms(true);
    try {
      let rooms = await getAvailableRooms(null, checkInDate, checkOutDate);
      // Normalize the response in case it's wrapped in $values
      if (rooms && typeof rooms === 'object' && !Array.isArray(rooms)) {
        if (Array.isArray(rooms.$values)) {
          rooms = rooms.$values;
        } else {
          rooms = [];
        }
      }
      if (!Array.isArray(rooms)) {
        rooms = [];
      }
      console.log('Available rooms loaded:', rooms);
      setAvailableRooms(rooms);
      if (rooms.length > 0) {
        setShowRoomSelection(true);
      } else {
        showToast('warning', 'Không có phòng trống trong khoảng thời gian này');
      }
    } catch (error) {
      console.error('Error loading available rooms:', error);
      showToast('danger', 'Không thể tải danh sách phòng trống');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleCheckIn = () => {
    if (!selectedBooking) return;
    if (!selectedRoomIds.length) {
      loadAvailableRooms();
      return;
    }
    setShowConfirm(true);
  };

  const performCheckIn = async () => {
    if (!selectedBooking) return;
    const roomIdsToUse = selectedRoomIds;
    if (!roomIdsToUse.length) {
      showToast('warning', 'Chưa chọn phòng');
      return;
    }
    setCheckingIn(true);
    try {
      if (paymentMethod === 'MoMo') {
        const invoice = await getInvoice(selectedBooking.id);
        const amount = Number(invoice?.finalTotal ?? invoice?.totalEstimatedAmount ?? selectedBooking.totalEstimatedAmount ?? 0);
        if (!amount || amount <= 0) {
          throw new Error('So tien thanh toan phai lon hon 0');
        }
        const orderInfo = `Thanh toan booking ${selectedBooking.bookingCode || selectedBooking.id}`;
        localStorage.setItem('momo_checkin_booking_id', String(selectedBooking.id));
        localStorage.setItem('momo_checkin_room_ids', JSON.stringify(roomIdsToUse));
        const momoResponse = await createMomoPayment(selectedBooking.id, { amount, orderInfo });
        if (!momoResponse?.payUrl) {
          throw new Error('Khong lay duoc duong dan thanh toan MoMo');
        }
        window.location.href = momoResponse.payUrl;
        return;
      }

      await checkIn(selectedBooking.id, roomIdsToUse);
      setShowConfirm(false);
      showToast('success', 'Check-in thành công');
      await loadBookings();
      setSelectedBooking(null);
      setSelectedRoomIds([]);
      setAvailableRooms([]);
    } catch (error: any) {
      showToast('danger', error?.message || 'Check-in thất bại');
    } finally {
      setCheckingIn(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Chưa có';
    try {
      const date = new Date(dateStr);
      
      // Check if date is valid and reasonable (after 1900, before 2100)
      if (isNaN(date.getTime()) || date.getFullYear() < 1900 || date.getFullYear() > 2100) {
        console.warn('Invalid date:', dateStr, date);
        return 'Ngày không hợp lệ';
      }
      
      return date.toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error, dateStr);
      return dateStr || 'Chưa có';
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'Chưa có';
    return amount.toLocaleString() + ' VND';
  };

  return (
    <div className="p-3" style={{ background: '#f4f7fc', minHeight: '100vh' }}>
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden mb-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3">
              <LogIn size={28} className="text-primary" />
            </div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e466e' }}>Check-in khách hàng</h3>
            <Badge bg="info" className="ms-2 px-3 py-2">{filteredBookings.length} khách</Badge>
          </div>
          <InputGroup className="shadow-sm">
            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
            <input type="text" className="form-control border-start-0" placeholder="Tìm theo mã booking, tên khách, số điện thoại..." value={searchValue} onChange={e => setSearchValue(e.target.value)} />
          </InputGroup>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col lg={8}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p>Đang tải...</p></div>
              ) : filteredBookings.length === 0 ? (
                <Alert variant="info">ℹ️ Không có khách nào cần check-in</Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead className="bg-light">
                      <tr><th>Mã Booking</th><th>Tên khách</th><th>Số ĐT</th><th>Ngày nhận</th><th>Trạng thái</th><th>Hành động</th></tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(booking => (
                        <tr key={booking.id} className={selectedBooking?.id === booking.id ? 'bg-primary bg-opacity-10' : ''} style={{ cursor: 'pointer' }} onClick={() => handleSelectBooking(booking)}>
                          <td className="fw-bold text-primary">{booking.bookingCode}</td>
                          <td>{booking.guestName}</td>
                          <td>{booking.guestPhone}</td>
                          <td>{formatDate(booking.checkInDate)}</td>
                          <td><Badge bg={booking.status === 'Confirmed' ? 'success' : 'warning'} pill>{booking.status === 'Confirmed' ? 'Đã xác nhận' : 'Chờ xử lý'}</Badge></td>
                          <td><Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); handleSelectBooking(booking); }}>Chọn</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {selectedBooking ? (
            <Card className="shadow-lg border-0 rounded-4 sticky-top" style={{ top: '20px' }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold text-primary mb-3"><CheckCircle size={20} className="me-2" />Chi tiết check-in</h5>
                <div className="mb-3"><span className="text-secondary small">Mã Booking</span><p className="fw-bold text-primary">{selectedBooking.bookingCode}</p></div>
                <div className="mb-3"><span className="text-secondary small"><User size={14} className="me-1" />Tên khách</span><p className="fw-bold">{selectedBooking.guestName}</p></div>
                <div className="mb-3"><span className="text-secondary small"><Phone size={14} className="me-1" />Số điện thoại</span><p className="fw-bold">{selectedBooking.guestPhone}</p></div>
                <div className="mb-3"><span className="text-secondary small"><Mail size={14} className="me-1" />Email</span><p className="fw-bold">{selectedBooking.guestEmail || 'Chưa có'}</p></div>
                <hr />
                <div className="mb-3"><span className="text-secondary small"><Calendar size={14} className="me-1" />Ngày nhận</span><p className="fw-bold">{formatDate(selectedBooking.checkInDate)}</p></div>
                <div className="mb-3"><span className="text-secondary small"><Calendar size={14} className="me-1" />Ngày trả</span><p className="fw-bold">{formatDate(selectedBooking.checkOutDate)}</p></div>
                <div className="mb-3"><span className="text-secondary small">Loại phòng</span><p className="fw-bold">{selectedBooking.roomTypeName || (selectedBooking.roomTypeId ? `ID: ${selectedBooking.roomTypeId}` : 'Chưa xác định')}</p></div>
                <div className="mb-3">
                  <span className="text-secondary small"><Home size={14} className="me-1" />Phòng đã chọn</span>
                  {selectedRoomIds.length > 0 ? (
                    <div>
                      {selectedRoomIds.map(rid => <Badge key={rid} bg="info" className="me-1 mb-1">Phòng {rid}</Badge>)}
                      <Button variant="outline-secondary" size="sm" className="ms-2" onClick={loadAvailableRooms}>Đổi phòng</Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-warning fw-bold mb-1">Chưa chọn phòng</p>
                      <Button variant="primary" size="sm" onClick={loadAvailableRooms}>Chọn phòng</Button>
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <span className="text-secondary small"><DollarSign size={14} className="me-1" />Tổng tiền</span>
                  <p className="fw-bold text-success h5">{formatCurrency(selectedBooking.totalEstimatedAmount)}</p>
                </div>
                <div className="mb-4">
                  <span className="text-secondary small">Hình thức thanh toán</span>
                  <div className="mt-2">
                    <Form.Check
                      type="radio"
                      id="payment-cash"
                      name="paymentMethod"
                      label="Trả tiền mặt"
                      value="Cash"
                      checked={paymentMethod === 'Cash'}
                      onChange={() => setPaymentMethod('Cash')}
                    />
                    <Form.Check
                      type="radio"
                      id="payment-momo"
                      name="paymentMethod"
                      label="Quét mã (MoMo)"
                      value="MoMo"
                      checked={paymentMethod === 'MoMo'}
                      onChange={() => setPaymentMethod('MoMo')}
                    />
                  </div>
                </div>
                <Button variant="primary" size="lg" className="w-100 fw-bold rounded-pill py-2" onClick={handleCheckIn}>
                  <CheckCircle size={18} className="me-2" /> Thực hiện Check-in
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-lg border-0 rounded-4"><Card.Body className="text-center py-5"><User size={48} className="text-secondary mb-3" /><p className="text-secondary">Chọn khách từ danh sách bên trái</p></Card.Body></Card>
          )}
        </Col>
      </Row>

      {/* Modal chọn phòng */}
      <Modal show={showRoomSelection} onHide={() => setShowRoomSelection(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Chọn phòng cho booking {selectedBooking?.bookingCode}</Modal.Title></Modal.Header>
        <Modal.Body>
          {loadingRooms ? (
            <div className="text-center py-3"><Spinner animation="border" /><p>Đang tải phòng trống...</p></div>
          ) : availableRooms.length === 0 ? (
            <Alert variant="warning">Không có phòng trống trong khoảng thời gian đã chọn.</Alert>
          ) : (
            <Row className="g-3">
              {availableRooms.map(room => {
                const normalizedStatus = room.status?.toLowerCase();
                const isAvailable = normalizedStatus === 'available' || normalizedStatus === 'cleaned' || normalizedStatus === 'ready';
                const isSelected = selectedRoomIds.includes(room.id);
                
                return (
                  <Col md={4} key={room.id}>
                    <Card 
                      className={`border rounded-3 ${isSelected ? 'border-success bg-success bg-opacity-10' : isAvailable ? 'border-secondary' : 'border-danger'}`}
                      style={{ cursor: isAvailable ? 'pointer' : 'not-allowed', opacity: isAvailable ? 1 : 0.6 }}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedRoomIds(prev => prev.includes(room.id) ? prev.filter(id => id !== room.id) : [...prev, room.id]);
                        }
                      }}
                    >
                      <Card.Body className="text-center p-3">
                        <div className="fw-bold h5 mb-2">
                          <span>Phòng {room.roomNumber}</span>
                          {isAvailable && <Badge bg="success" className="ms-2">Còn trống</Badge>}
                          {!isAvailable && <Badge bg="danger" className="ms-2">Đã hết</Badge>}
                        </div>
                        <div className="text-muted small">Tầng {room.floor}</div>
                        <div className="text-primary small mb-2">{room.roomType?.name || 'Chưa xác định'}</div>
                        {isAvailable && (
                          <>
                            <hr className="my-2" />
                            <div className="text-muted small mb-2">Giá: {room.roomType?.basePrice?.toLocaleString?.() ?? 'N/A'} VND/đêm</div>
                            <Form.Check 
                              type="checkbox" 
                              label={isSelected ? "✓ Đã chọn" : "Chọn phòng này"} 
                              checked={isSelected} 
                              className="mt-2" 
                              onChange={() => {}} 
                            />
                          </>
                        )}
                        {!isAvailable && (
                          <div className="text-danger small mt-2">
                            <strong>Trạng thái:</strong> {room.status === 'Occupied' ? 'Đã có khách' : room.status === 'Cleaning' ? 'Đang vệ sinh' : room.status}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoomSelection(false)}>Đóng</Button>
          <Button variant="primary" onClick={() => setShowRoomSelection(false)} disabled={selectedRoomIds.length === 0}>Xác nhận ({selectedRoomIds.length} phòng)</Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton><Modal.Title>Xác nhận Check-in</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>Check-in cho khách <strong>{selectedBooking?.guestName}</strong>?</p>
          <Alert variant="info">
            Mã: {selectedBooking?.bookingCode}
            <br />Phòng: {selectedRoomIds.map(id => `Phòng ${id}`).join(', ')}
            <br />Thanh toán: {paymentMethod === 'Cash' ? 'Tiền mặt' : 'MoMo'}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Hủy</Button>
          <Button variant="primary" onClick={performCheckIn} disabled={checkingIn}>{checkingIn ? <Spinner size="sm" /> : 'Xác nhận'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckIn;