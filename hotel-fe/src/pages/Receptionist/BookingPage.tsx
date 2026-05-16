import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { getRoomTypeById, createBooking, createMomoPayment } from '../../api/booking';
import { showToast } from '../../components/common/ToastNotification';
import { RoomType } from '../../types';

const BookingPage: React.FC = () => {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [checkIn, setCheckIn] = useState('');        // Không hardcode
  const [checkOut, setCheckOut] = useState('');      // Không hardcode
  const [adults, setAdults] = useState<number | ''>('');
  const [children, setChildren] = useState<number | ''>('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [voucher, setVoucher] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeId) {
      getRoomTypeById(Number(typeId)).then(setRoom);
    }
  }, [typeId]);

  // Tính số đêm, chỉ khi cả hai ngày đều có giá trị
  const nights = (checkIn && checkOut) 
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24))
    : 0;
  const total = room ? room.basePrice * nights : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    if (!checkIn || !checkOut) {
      showToast('warning', 'Vui lòng chọn ngày nhận và ngày trả phòng');
      return;
    }
    if (adults === '' || adults < 1) {
      showToast('warning', 'Vui lòng nhập số lượng người lớn (tối thiểu 1)');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: Number(adults),
        children: Number(children || 0),
        roomTypeId: room.id,
        nights,
        voucherCode: voucher || undefined,
      } as any;

      const booking = await createBooking(bookingData);
      showToast('success', `Đặt phòng thành công! Mã: ${booking.bookingCode}`);
      navigate(`/booking-success/${booking.bookingCode}`);
    } catch (error: any) {
      console.error("Booking error:", error);
      let errorMsg = "Không thể đặt phòng";
      if (error.response) {
        try {
          const data = await error.response.json();
          errorMsg = data.message || error.response.statusText;
        } catch {
          errorMsg = `Lỗi ${error.response.status}`;
        }
      } else if (error.request) {
        errorMsg = "Không nhận được phản hồi từ server";
      } else {
        errorMsg = error.message;
      }
      showToast('danger', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!room) return <div>Đang tải...</div>;

  return (
    <Row>
      <Col md={7}>
        <Card className="shadow-sm">
          <Card.Body>
            <h4>Đặt phòng {room.name}</h4>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Họ tên</Form.Label>
                  <Form.Control required value={guestName} onChange={e => setGuestName(e.target.value)} />
                </Col>
                <Col md={6}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
                </Col>
                <Col md={6}>
                  <Form.Label>SĐT</Form.Label>
                  <Form.Control required value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
                </Col>
                <Col md={6}>
                  <Form.Label>Mã voucher</Form.Label>
                  <Form.Control value={voucher} onChange={e => setVoucher(e.target.value)} />
                </Col>
                <Col md={4}>
                  <Form.Label>Ngày nhận</Form.Label>
                  <Form.Control type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required />
                </Col>
                <Col md={4}>
                  <Form.Label>Ngày trả</Form.Label>
                  <Form.Control type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required />
                </Col>
                <Col md={2}>
                  <Form.Label>Người lớn</Form.Label>
                  <Form.Control type="number" min={1} value={adults} onChange={e => setAdults(e.target.value === '' ? '' : Number(e.target.value))} />
                </Col>
                <Col md={2}>
                  <Form.Label>Trẻ em</Form.Label>
                  <Form.Control type="number" min={0} value={children} onChange={e => setChildren(e.target.value === '' ? '' : Number(e.target.value))} />
                </Col>
              </Row>
              <Button type="submit" variant="dark" className="mt-3" disabled={loading || !checkIn || !checkOut}>
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
      <Col md={5}>
        <Card className="shadow-sm">
          <Card.Body>
            <h5>Tóm tắt</h5>
            <div>Loại phòng: {room.name}</div>
            <div>Số đêm: {nights}</div>
            <div>Tạm tính: {total.toLocaleString()} VND</div>
            <Alert variant="info" className="mt-3">Giá {room.basePrice.toLocaleString()} VND/đêm</Alert>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default BookingPage;