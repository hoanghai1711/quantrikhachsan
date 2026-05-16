import React, { useState } from 'react';
import { Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { searchAvailableRooms } from '../../api/rooms';
import { Room } from '../../types';
import { useNavigate } from 'react-router-dom';

interface RoomTypeGroup {
  roomTypeId: number;
  typeName: string;
  description: string;
  price: number;
  image: string;
  availableCount: number;
}

const SearchRoom: React.FC = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('2026-04-12');
  const [checkOut, setCheckOut] = useState('2026-04-14');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [results, setResults] = useState<Room[]>([]);
  const [groupedResults, setGroupedResults] = useState<RoomTypeGroup[]>([]);

  const handleSearch = async () => {
    const data = await searchAvailableRooms({ checkIn, checkOut });
    const rooms = Array.isArray(data) ? data : [];
    setResults(rooms);

    // Group by roomTypeId
    const grouped = rooms.reduce((acc, room) => {
      const tid = room.roomTypeId;
      if (!tid) return acc;

      if (!acc[tid]) {
        const rt = room.roomType;
        acc[tid] = {
          roomTypeId: tid,
          typeName: rt?.name || `Hạng phòng ${tid}`,
          description: rt?.description || `Chi tiết hạng phòng ${tid}`,
          price: rt?.basePrice || 0,
          image: rt?.slug 
            ? (rt.slug.startsWith('http://') || rt.slug.startsWith('https://') 
                ? rt.slug 
                : `/images/rooms/${rt.slug}.jpg`) 
            : rt?.roomImages?.[0]?.imageUrl || '',
          availableCount: 0
        };
      }
      
      // Chỉ đếm nếu trạng thái là available
      if (room.status && room.status.toLowerCase() === 'available') {
        acc[tid].availableCount += 1;
      }
      return acc;
    }, {} as Record<number, RoomTypeGroup>);

    setGroupedResults(Object.values(grouped));
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
        {groupedResults.map(roomType => (
          <Col md={4} key={roomType.roomTypeId}>
            <Card className="h-100 shadow-sm">
              {roomType.image && (
                <Card.Img variant="top" src={roomType.image} />
              )}
              <Card.Body>
                <Card.Title>{roomType.typeName}</Card.Title>
                <Card.Text>{roomType.description}</Card.Text>
                <div className="mb-2">
                  <Badge bg="success" className="me-2">{roomType.availableCount} phòng trống</Badge>
                  {roomType.availableCount <= 3 && (
                    <Badge bg="warning" text="dark">
                      ⚠️ Chỉ còn {roomType.availableCount} phòng
                    </Badge>
                  )}
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <strong>{roomType.price.toLocaleString()} VND/đêm</strong>
                  <Button variant="primary" onClick={() => navigate(`/book/${roomType.roomTypeId}`)}>Đặt ngay</Button>
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