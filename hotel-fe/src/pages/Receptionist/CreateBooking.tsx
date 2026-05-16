import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Form, Button, Alert, Spinner, Badge,
  InputGroup, Modal
} from 'react-bootstrap';
import {
  FaCalendarAlt, FaUsers, FaUser, FaPhone, FaEnvelope,
  FaTicketAlt, FaMoneyBillWave, FaCheckCircle, FaSearch
} from 'react-icons/fa';
import { getRoomTypes, searchAvailableRooms } from '../../api/rooms';
import { getVouchers } from '../../api/voucher';
import { createBooking } from '../../api/booking';
import { getBookings } from '../../api/booking';
import { RoomType, Voucher, Booking } from '../../types';
import { showToast } from '../../components/common/ToastNotification';
import dayjs from 'dayjs';

interface RoomOption {
  id: number;
  name: string;
  basePrice: number;
  maxOccupancy: number;
  availableCount: number;
}

interface GuestInfo {
  name: string;
  phone: string;
  email: string;
}

const CreateBooking: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomOption[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // Form state
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number>(0);
  const [checkIn, setCheckIn] = useState(dayjs().format('YYYY-MM-DD'));
  const [checkOut, setCheckOut] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [showGuestSearch, setShowGuestSearch] = useState(false);
  const [searchGuestKeyword, setSearchGuestKeyword] = useState('');
  const [guestSearchResults, setGuestSearchResults] = useState<GuestInfo[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<GuestInfo | null>(null);

  // Tính toán tạm thời
  const nights = Math.max(1, dayjs(checkOut).diff(dayjs(checkIn), 'day'));
  const [roomPrice, setRoomPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  // Tải danh sách loại phòng và voucher khi component mount
  useEffect(() => {
    loadRoomTypes();
    loadVouchers();
  }, []);

  // Khi chọn loại phòng, cập nhật giá
  useEffect(() => {
    const selected = roomTypes.find(rt => rt.id === selectedRoomTypeId);
    if (selected) {
      setRoomPrice(selected.basePrice);
    } else {
      setRoomPrice(0);
    }
  }, [selectedRoomTypeId, roomTypes]);

  // Tính tổng tiền khi roomPrice, nights, voucher thay đổi
  useEffect(() => {
    const subtotal = roomPrice * nights;
    let discount = 0;
    if (appliedVoucher) {
      if (appliedVoucher.type === 'PERCENT') {
        discount = subtotal * appliedVoucher.value / 100;
      } else {
        discount = appliedVoucher.value;
      }
      // Không giảm quá subtotal
      discount = Math.min(discount, subtotal);
    }
    setTotalAmount(subtotal);
    setDiscountAmount(discount);
    setFinalAmount(subtotal - discount);
  }, [roomPrice, nights, appliedVoucher]);

  const loadRoomTypes = async () => {
    try {
      const types = await getRoomTypes();
      // Lọc các loại phòng đang hoạt động
      const activeTypes = types.filter(t => t.isActive);
      // Map sang RoomOption
      const options = activeTypes.map(t => ({
        id: t.id,
        name: t.name || '',
        basePrice: t.basePrice,
        maxOccupancy: t.maxOccupancy || (t.capacityAdults + t.capacityChildren) || 2,
        availableCount: 0 // sẽ cập nhật sau
      }));
      setRoomTypes(options);
      // Mặc định chọn loại phòng đầu tiên nếu có
      if (options.length > 0 && !selectedRoomTypeId) {
        setSelectedRoomTypeId(options[0].id);
      }
      // Cập nhật số phòng trống
      await updateAvailableCounts(checkIn, checkOut);
    } catch (error) {
      console.error('Load room types error:', error);
      showToast('danger', 'Không thể tải danh sách loại phòng');
    }
  };

  const updateAvailableCounts = async (startDate: string, endDate: string) => {
    try {
      const availableRooms = await searchAvailableRooms({ checkIn: startDate, checkOut: endDate });
      const countMap = new Map<number, number>();
      availableRooms.forEach(room => {
        if (room.status?.toLowerCase() !== 'available') return;
        const typeIdRaw = room.roomTypeId ?? room.roomType?.id;
        const typeId = typeof typeIdRaw === 'string' ? Number(typeIdRaw) : typeIdRaw;
        if (!typeId) return;
        countMap.set(typeId, (countMap.get(typeId) || 0) + 1);
      });
      setRoomTypes(prev => prev.map(rt => ({
        ...rt,
        availableCount: countMap.get(rt.id) || 0
      })));
    } catch (error) {
      console.error('Update available counts error:', error);
    }
  };

  const loadVouchers = async () => {
    try {
      const vouchersData = await getVouchers();
      setVouchers(vouchersData);
    } catch (error) {
      console.error('Load vouchers error:', error);
    }
  };

  const handleDateChange = (dateType: 'checkIn' | 'checkOut', value: string) => {
    const newCheckIn = dateType === 'checkIn' ? value : checkIn;
    const newCheckOut = dateType === 'checkOut' ? value : checkOut;

    if (dateType === 'checkIn') {
      setCheckIn(value);
      // Nếu check-in >= check-out, đẩy check-out lên 1 ngày sau check-in
      if (dayjs(value).isSame(dayjs(checkOut), 'day') || dayjs(value).isAfter(dayjs(checkOut), 'day')) {
        setCheckOut(dayjs(value).add(1, 'day').format('YYYY-MM-DD'));
      }
    } else {
      setCheckOut(value);
      // Nếu check-out <= check-in, đặt check-out = check-in + 1
      if (dayjs(value).isSame(dayjs(checkIn), 'day') || dayjs(value).isBefore(dayjs(checkIn), 'day')) {
        setCheckOut(dayjs(checkIn).add(1, 'day').format('YYYY-MM-DD'));
        showToast('warning', 'Ngày trả phòng phải sau ngày nhận phòng');
      }
    }
    // Cập nhật số lượng phòng trống
    updateAvailableCounts(newCheckIn, newCheckOut);
  };

  const handleVoucherApply = async () => {
    if (!voucherCode.trim()) {
      showToast('warning', 'Vui lòng nhập mã voucher');
      return;
    }
    setValidatingVoucher(true);
    try {
      const response = await fetch(`/api/vouchers/validate?code=${encodeURIComponent(voucherCode)}&total=${totalAmount}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_token')}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Voucher không hợp lệ');
      }
      const result = await response.json();
      if (result.valid) {
        setAppliedVoucher(result.voucher);
        showToast('success', `Áp dụng voucher thành công! Giảm ${result.discount.toLocaleString()} VND`);
      } else {
        throw new Error(result.message || 'Voucher không hợp lệ');
      }
    } catch (error: any) {
      showToast('danger', error.message);
      setAppliedVoucher(null);
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    showToast('info', 'Đã bỏ voucher');
  };

  const searchGuest = async () => {
    if (!searchGuestKeyword.trim()) return;
    try {
      const allBookings = await getBookings();
      const results = allBookings.filter(b =>
        b.guestName?.toLowerCase().includes(searchGuestKeyword.toLowerCase()) ||
        b.guestPhone?.includes(searchGuestKeyword)
      );
      const uniqueGuests = new Map<string, GuestInfo>();
      results.forEach(b => {
        const key = `${b.guestName}|${b.guestPhone}`;
        if (!uniqueGuests.has(key)) {
          uniqueGuests.set(key, {
            name: b.guestName || '',
            phone: b.guestPhone || '',
            email: b.guestEmail || ''
          });
        }
      });
      setGuestSearchResults(Array.from(uniqueGuests.values()));
    } catch (error) {
      console.error('Search guest error:', error);
      showToast('danger', 'Không thể tìm kiếm khách hàng');
    }
  };

  const selectGuest = (guest: GuestInfo) => {
    setSelectedGuest(guest);
    setGuestName(guest.name);
    setGuestPhone(guest.phone);
    setGuestEmail(guest.email);
    setShowGuestSearch(false);
    setSearchGuestKeyword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoomTypeId) {
      showToast('warning', 'Vui lòng chọn loại phòng');
      return;
    }

    const checkInDate = dayjs(checkIn);
    const checkOutDate = dayjs(checkOut);
    
    if (!checkInDate.isValid() || !checkOutDate.isValid()) {
      showToast('danger', 'Ngày không hợp lệ. Vui lòng chọn lại.');
      return;
    }

    // Kiểm tra ngày nhận phòng từ ngày mai trở đi
    if (checkInDate.isBefore(dayjs().add(1, 'day'), 'day')) {
      showToast('warning', 'Ngày nhận phòng phải từ ngày mai trở đi');
      return;
    }

    // Kiểm tra ngày trả phòng phải sau ngày nhận phòng
    if (checkOutDate.isSame(checkInDate, 'day') || checkOutDate.isBefore(checkInDate, 'day')) {
      showToast('warning', 'Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    if (!guestName.trim() || !guestPhone.trim()) {
      showToast('warning', 'Vui lòng nhập họ tên và số điện thoại của khách');
      return;
    }

    const selectedType = roomTypes.find(rt => rt.id === selectedRoomTypeId);
    if (selectedType && selectedType.availableCount <= 0) {
      showToast('warning', `Loại phòng "${selectedType.name}" không còn phòng trống từ ${checkIn} đến ${checkOut}. Vui lòng chọn ngày khác hoặc loại phòng khác.`);
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim() || undefined,
        guestPhone: guestPhone.trim(),
        checkIn,
        checkOut,
        adults,
        children,
        roomTypeId: selectedRoomTypeId,
        nights,
        voucherCode: appliedVoucher?.code
      };
      const newBooking = await createBooking(bookingData);
      showToast('success', `Tạo booking thành công! Mã: ${newBooking.bookingCode}`);
      navigate('/receptionist/check-in');
    } catch (error: any) {
      console.error('Create booking error:', error);
      const errorMsg = error?.message || 'Không thể tạo booking';
      if (errorMsg.includes('No available')) {
        showToast('danger', `Không có phòng trống cho ngày được chọn.\n${errorMsg}\nVui lòng thử ngày khác.`);
      } else if (errorMsg.includes('future')) {
        showToast('warning', 'Ngày nhận phòng phải từ ngày mai trở đi');
      } else {
        showToast('danger', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedRoomType = roomTypes.find(rt => rt.id === selectedRoomTypeId);

  return (
    <div className="p-3" style={{ background: '#f4f7fc', minHeight: '100vh' }}>
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3">
              <FaMoneyBillWave size={28} className="text-primary" />
            </div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e466e' }}>
              Tạo đơn đặt phòng trực tiếp
            </h3>
            <Badge bg="primary" className="ms-2 px-3 py-2">Quầy lễ tân</Badge>
          </div>

          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              {/* Thông tin khách hàng */}
              <Col lg={5}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0 d-flex align-items-center gap-2">
                      <FaUser /> Thông tin khách hàng
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <Form.Label className="fw-semibold">Họ tên <span className="text-danger">*</span></Form.Label>
                        <Button variant="link" size="sm" onClick={() => setShowGuestSearch(true)}>
                          <FaSearch /> Tìm khách cũ
                        </Button>
                      </div>
                      <Form.Control
                        type="text"
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        placeholder="Nhập họ tên khách"
                        required
                      />
                    </div>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Số điện thoại <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="tel"
                        value={guestPhone}
                        onChange={e => setGuestPhone(e.target.value)}
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        placeholder="Nhập email (không bắt buộc)"
                      />
                    </Form.Group>
                    {selectedGuest && (
                      <Alert variant="info" className="mt-2 mb-0 py-2">
                        <small>Đã điền thông tin từ khách cũ: {selectedGuest.name}</small>
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Thông tin đặt phòng */}
              <Col lg={7}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0 d-flex align-items-center gap-2">
                      <FaCalendarAlt /> Chi tiết đặt phòng
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Ngày nhận phòng</Form.Label>
                          <InputGroup>
                            <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                            <Form.Control
                              type="date"
                              value={checkIn}
                              onChange={e => handleDateChange('checkIn', e.target.value)}
                              min={dayjs().format('YYYY-MM-DD')}
                              required
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Ngày trả phòng</Form.Label>
                          <InputGroup>
                            <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                            <Form.Control
                              type="date"
                              value={checkOut}
                              onChange={e => handleDateChange('checkOut', e.target.value)}
                              min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
                              required
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="g-3 mt-2">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Loại phòng</Form.Label>
                          <Form.Select
                            value={selectedRoomTypeId}
                            onChange={e => setSelectedRoomTypeId(Number(e.target.value))}
                            required
                          >
                            <option value="">-- Chọn loại phòng --</option>
                            {roomTypes.map(rt => (
                              <option key={rt.id} value={rt.id} disabled={rt.availableCount === 0}>
                                {rt.name} - {rt.basePrice.toLocaleString()} VND/đêm
                                {rt.availableCount === 0 && ' (Hết phòng)'}
                              </option>
                            ))}
                          </Form.Select>
                          {selectedRoomType && (
                            <Form.Text className="text-muted">
                              Còn {selectedRoomType.availableCount} phòng trống • Sức chứa tối đa {selectedRoomType.maxOccupancy} người
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Người lớn</Form.Label>
                          <Form.Control
                            type="number"
                            min={1}
                            value={adults}
                            onChange={e => setAdults(Number(e.target.value))}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Trẻ em</Form.Label>
                          <Form.Control
                            type="number"
                            min={0}
                            value={children}
                            onChange={e => setChildren(Number(e.target.value))}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="g-3 mt-2">
                      <Col md={8}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Mã giảm giá (voucher)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text><FaTicketAlt /></InputGroup.Text>
                            <Form.Control
                              type="text"
                              value={voucherCode}
                              onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                              placeholder="Nhập mã voucher"
                              disabled={!!appliedVoucher}
                            />
                            {!appliedVoucher ? (
                              <Button
                                variant="outline-primary"
                                onClick={handleVoucherApply}
                                disabled={validatingVoucher || !voucherCode}
                              >
                                {validatingVoucher ? <Spinner size="sm" /> : 'Áp dụng'}
                              </Button>
                            ) : (
                              <Button variant="outline-danger" onClick={handleRemoveVoucher}>
                                Bỏ
                              </Button>
                            )}
                          </InputGroup>
                          {appliedVoucher && (
                            <Form.Text className="text-success">
                              Đã áp dụng: {appliedVoucher.code} (giảm {appliedVoucher.type === 'PERCENT' ? `${appliedVoucher.value}%` : `${appliedVoucher.value.toLocaleString()} VND`})
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Tóm tắt thanh toán */}
                <Card className="border-0 shadow-sm mt-3">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">Tóm tắt thanh toán</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Giá phòng/đêm:</span>
                      <strong>{roomPrice.toLocaleString()} VND</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Số đêm:</span>
                      <strong>{nights}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tạm tính:</span>
                      <strong>{totalAmount.toLocaleString()} VND</strong>
                    </div>
                    {discountAmount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Giảm giá:</span>
                        <strong>- {discountAmount.toLocaleString()} VND</strong>
                      </div>
                    )}
                    <hr />
                    <div className="d-flex justify-content-between mb-3">
                      <span className="fw-bold">Tổng cộng:</span>
                      <span className="fw-bold text-primary fs-5">{finalAmount.toLocaleString()} VND</span>
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-100 rounded-pill py-2"
                      disabled={loading || !selectedRoomTypeId || (selectedRoomType && selectedRoomType.availableCount === 0)}
                    >
                      {loading ? <Spinner size="sm" className="me-2" /> : <FaCheckCircle className="me-2" />}
                      Xác nhận đặt phòng
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Modal tìm kiếm khách cũ */}
      <Modal show={showGuestSearch} onHide={() => setShowGuestSearch(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tìm khách hàng cũ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Nhập tên hoặc số điện thoại"
              value={searchGuestKeyword}
              onChange={e => setSearchGuestKeyword(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && searchGuest()}
            />
            <Button variant="primary" onClick={searchGuest}>
              <FaSearch /> Tìm
            </Button>
          </InputGroup>
          {guestSearchResults.length === 0 && searchGuestKeyword && (
            <Alert variant="info">Không tìm thấy khách hàng nào.</Alert>
          )}
          {guestSearchResults.map((guest, idx) => (
            <div key={idx} className="border rounded p-3 mb-2 d-flex justify-content-between align-items-center">
              <div>
                <div><strong>{guest.name}</strong></div>
                <div className="text-muted small">{guest.phone} • {guest.email || 'Chưa có email'}</div>
              </div>
              <Button variant="outline-primary" size="sm" onClick={() => selectGuest(guest)}>
                Chọn
              </Button>
            </div>
          ))}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CreateBooking;