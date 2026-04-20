import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { getRoomTypeById, createRoomHold, confirmBookingFromHold } from '../../api/booking';
import { showToast } from '../../components/common/ToastNotification';
import { RoomType } from '../../types';

const BookingPage: React.FC = () => {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [checkIn, setCheckIn] = useState('2026-04-12');
  const [checkOut, setCheckOut] = useState('2026-04-14');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [voucher, setVoucher] = useState('');
  const [holdId, setHoldId] = useState<number | null>(null);
  const [holdTimeout, setHoldTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeId) {
      getRoomTypeById(Number(typeId)).then(setRoom);
    }
  }, [typeId]);

  useEffect(() => {
    if (room && checkIn && checkOut) {
      // Create room hold on mount
      createRoomHold({
        roomTypeId: room.id,
        checkIn,
        checkOut,
      }).then((hold) => {
        setHoldId(hold.id);
        // Set 15-minute timeout to release hold
        const timeout = setTimeout(() => {
          // Note: In a real app, you'd call a release API here
          console.log('Hold expired');
          setHoldId(null);
        }, 15 * 60 * 1000); // 15 minutes
        setHoldTimeout(timeout);
      }).catch((error) => {
        showToast('error', 'Không thể giữ phòng: ' + error.message);
      });
    }

    return () => {
      if (holdTimeout) {
        clearTimeout(holdTimeout);
      }
    };
  }, [room, checkIn, checkOut]);

  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
  const total = room ? room.basePrice * nights : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !holdId) return;

    try {
      const booking = await confirmBookingFromHold(holdId, {
        guestName, guestEmail, guestPhone, checkIn, checkOut, adults, children,
        roomTypeId: room.id, nights, voucherCode: voucher,
      });
      showToast('success', `Đặt phòng thành công! Mã: ${booking.code}`);
      navigate(`/booking-success/${booking.code}`);
    } catch (error: any) {
      showToast('error', 'Không thể đặt phòng: ' + error.message);
    }
  };

  if (!room) return <div>Đang tải...</div>;

  return (
    <Row>
      <Col md={7}>
        <Card className="shadow-sm"><Card.Body>
          <h4>Đặt phòng {room.name}</h4>
          {holdId && <Alert variant="success">Phòng đã được giữ trong 15 phút</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}><Form.Label>Họ tên</Form.Label><Form.Control required value={guestName} onChange={e => setGuestName(e.target.value)} /></Col>
              <Col md={6}><Form.Label>Email</Form.Label><Form.Control type="email" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)} /></Col>
              <Col md={6}><Form.Label>SĐT</Form.Label><Form.Control required value={guestPhone} onChange={e => setGuestPhone(e.target.value)} /></Col>
              <Col md={6}><Form.Label>Mã voucher</Form.Label><Form.Control value={voucher} onChange={e => setVoucher(e.target.value)} /></Col>
              <Col md={4}><Form.Label>Ngày nhận</Form.Label><Form.Control type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} /></Col>
              <Col md={4}><Form.Label>Ngày trả</Form.Label><Form.Control type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} /></Col>
              <Col md={2}><Form.Label>Người lớn</Form.Label><Form.Control type="number" min={1} value={adults} onChange={e => setAdults(Number(e.target.value))} /></Col>
              <Col md={2}><Form.Label>Trẻ em</Form.Label><Form.Control type="number" min={0} value={children} onChange={e => setChildren(Number(e.target.value))} /></Col>
            </Row>
            <Button type="submit" variant="dark" className="mt-3" disabled={!holdId}>Xác nhận đặt phòng</Button>
          </Form>
        </Card.Body></Card>
      </Col>
      <Col md={5}>
        <Card className="shadow-sm"><Card.Body>
          <h5>Tóm tắt</h5>
          <div>Loại phòng: {room.name}</div><div>Số đêm: {nights}</div><div>Tạm tính: {total.toLocaleString()} VND</div>
          <Alert variant="info" className="mt-3">Giá {room.basePrice.toLocaleString()} VND/đêm</Alert>
        </Card.Body></Card>
      </Col>
    </Row>
  );
};

export default BookingPage;