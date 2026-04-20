import React, { useState } from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import { searchAvailableRooms } from '../../api/rooms';
import { Room } from '../../types';
import { useNavigate } from 'react-router-dom';

const SearchRoom: React.FC = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('2026-04-12');
  const [checkOut, setCheckOut] = useState('2026-04-14');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [results, setResults] = useState<Room[]>([]);

  const handleSearch = async () => {
    const data = await searchAvailableRooms({ checkIn, checkOut });
    setResults(Array.isArray(data) ? data : []);
  };

  return (
    <div>
      <Card className="shadow-sm mb-4"><Card.Body>
        <h4>Tìm phòng</h4>
        <Row className="g-3">
          <Col md={3}><Form.Label>Ngày nhận</Form.Label><Form.Control type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} /></Col>
          <Col md={3}><Form.Label>Ngày trả</Form.Label><Form.Control type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} /></Col>
          <Col md={2}><Form.Label>Người lớn</Form.Label><Form.Control type="number" min={1} value={adults} onChange={e => setAdults(Number(e.target.value))} /></Col>
          <Col md={2}><Form.Label>Trẻ em</Form.Label><Form.Control type="number" min={0} value={children} onChange={e => setChildren(Number(e.target.value))} /></Col>
          <Col md={2} className="d-flex align-items-end"><Button variant="dark" className="w-100" onClick={handleSearch}>Tìm kiếm</Button></Col>
        </Row>
      </Card.Body></Card>
      <Row className="g-4">
        {(Array.isArray(results) ? results : []).map(room => (
          <Col md={4} key={room.id}>
            <Card className="h-100 shadow-sm">
              {room.roomType?.roomImages && room.roomType.roomImages.length > 0 && (
                <Card.Img variant="top" src={room.roomType.roomImages[0].imageUrl} />
              )}
              <Card.Body>
                <Card.Title>{room.roomType?.name || `Phòng ${room.roomNumber}`}</Card.Title>
                <Card.Text>{room.roomType?.description || `Phòng số ${room.roomNumber}`}</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <strong>{room.roomType?.basePrice?.toLocaleString() ?? 0} VND/đêm</strong>
                  <Button variant="primary" onClick={() => navigate(`/book/${room.roomTypeId}`)}>Đặt ngay</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SearchRoom;