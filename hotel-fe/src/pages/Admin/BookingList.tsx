import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { getBookings } from '../../api/booking';
import { Booking } from '../../types';

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getBookings();
        setBookings(data);
      } catch (error) {
        console.error('Load bookings error:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <Row><Col><Card className="shadow-sm mb-4"><Card.Body><h4>Danh sách đơn</h4><p className="text-muted">Hiển thị các booking đã tạo</p></Card.Body></Card></Col></Row>
      <Card className="shadow-sm"><Card.Body className="p-0">
        <Table hover responsive>
          <thead className="table-light"><tr>
            <th>Mã đơn</th>
            <th>Khách</th>
            <th>Điện thoại</th>
            <th>Loại phòng</th>
            <th>Nhận</th>
            <th>Trả</th>
            <th>Trạng thái</th>
            <th>Tổng</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-4">Đang tải...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-4">Chưa có booking</td></tr>
            ) : bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.code}</td>
                <td>{booking.guestName}</td>
                <td>{booking.guestPhone}</td>
                <td>{booking.roomTypeName || booking.roomTypeId}</td>
                <td>{booking.checkIn}</td>
                <td>{booking.checkOut}</td>
                <td><Badge bg={booking.status === 'CheckedIn' ? 'success' : booking.status === 'Cancelled' ? 'danger' : 'secondary'}>{booking.status}</Badge></td>
                <td>{booking.totalAmount?.toLocaleString?.() ?? 0} VND</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body></Card>
    </div>
  );
};

export default BookingList;
