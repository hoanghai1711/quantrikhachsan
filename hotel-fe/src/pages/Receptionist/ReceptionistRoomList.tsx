// src/pages/receptionist/ReceptionistRoomList.tsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Form, Button, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaBed, FaSearch, FaCheckCircle, FaUser } from 'react-icons/fa';
import { getRooms, getRoomTypes, searchAvailableRooms } from '../../api/rooms';
import { getBookings, checkIn } from '../../api/booking';
import { Room, RoomType, Booking } from '../../types';
import { showToast } from '../../components/common/ToastNotification';

const ReceptionistRoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFloor, setFilterFloor] = useState<number | ''>('');
  const [filterRoomType, setFilterRoomType] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // State cho modal check-in
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingAvailableRooms, setLoadingAvailableRooms] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const loadAvailableRooms = async () => {
      if (!selectedBookingId) {
        setAvailableRooms([]);
        return;
      }

      const booking = pendingBookings.find(b => b.id === selectedBookingId);
      if (!booking?.checkInDate || !booking?.checkOutDate) {
        setAvailableRooms([]);
        return;
      }

      setLoadingAvailableRooms(true);
      try {
        const roomsData = await searchAvailableRooms({
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          ...(booking.roomTypeId ? { roomTypeId: booking.roomTypeId } : {})
        });
        setAvailableRooms(roomsData);

        if (selectedRoomId && !roomsData.some(r => r.id === selectedRoomId)) {
          setSelectedRoomId(null);
        }
      } catch (error) {
        console.error('Load available rooms error:', error);
        setAvailableRooms([]);
      } finally {
        setLoadingAvailableRooms(false);
      }
    };

    loadAvailableRooms();
  }, [selectedBookingId, pendingBookings, selectedRoomId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData, roomTypesData, bookingsData] = await Promise.all([
        getRooms(),
        getRoomTypes(),
        getBookings(),
      ]);
      setRooms(roomsData);
      setRoomTypes(roomTypesData.filter(rt => rt.isActive));
      // Lọc các booking có trạng thái Pending hoặc Confirmed (chưa check-in)
      const pending = bookingsData.filter(
        b => b.status === 'Pending' || b.status === 'Confirmed'
      );
      setPendingBookings(pending);
    } catch (error) {
      console.error('Load data error:', error);
      showToast('danger', 'Không thể tải dữ liệu phòng');
    } finally {
      setLoading(false);
    }
  };

  const getRoomTypeName = (typeId: number) => {
    const rt = roomTypes.find(t => t.id === typeId);
    return rt?.name || 'N/A';
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <Badge bg="success">Trống</Badge>;
      case 'occupied':
        return <Badge bg="danger">Đang ở</Badge>;
      case 'cleaning':
        return <Badge bg="warning" text="dark">Đang dọn</Badge>;
      case 'maintenance':
        return <Badge bg="secondary">Bảo trì</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (filterFloor !== '' && room.floor !== filterFloor) return false;
    if (filterRoomType !== '' && room.roomTypeId !== filterRoomType) return false;
    if (filterStatus && room.status?.toLowerCase() !== filterStatus.toLowerCase()) return false;
    return true;
  });

  const handleRoomClick = (room: Room) => {
    if (room.status?.toLowerCase() !== 'available') {
      showToast('warning', 'Phòng không trống, không thể check-in');
      return;
    }
    setSelectedRoomId(room.id);
    setSelectedBookingId(null);
    setAvailableRooms([]);
    setShowCheckinModal(true);
  };

  const handleCheckin = async () => {
    if (!selectedRoomId || !selectedBookingId) {
      showToast('warning', 'Vui lòng chọn booking và phòng trống');
      return;
    }
    setCheckingIn(true);
    try {
      await checkIn(selectedBookingId, [selectedRoomId]);
      const room = availableRooms.find(r => r.id === selectedRoomId) || rooms.find(r => r.id === selectedRoomId);
      showToast('success', `Check-in thành công: Phòng ${room?.roomNumber ?? selectedRoomId}`);
      setShowCheckinModal(false);
      // Reload dữ liệu
      await loadData();
    } catch (error: any) {
      showToast('danger', error.message || 'Check-in thất bại');
    } finally {
      setCheckingIn(false);
    }
  };

  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort();

  return (
    <div className="p-3" style={{ background: '#f4f7fc', minHeight: '100vh' }}>
      <Card className="shadow-lg border-0 rounded-4 mb-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3">
              <FaBed size={28} className="text-primary" />
            </div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e466e' }}>
              Quản lý phòng - Lễ tân
            </h3>
            <Badge bg="primary" className="ms-2 px-3 py-2">
              {filteredRooms.length} phòng
            </Badge>
          </div>

          {/* Bộ lọc */}
          <Row className="g-3 mb-4">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tầng</Form.Label>
                <Form.Select value={filterFloor} onChange={e => setFilterFloor(e.target.value === '' ? '' : Number(e.target.value))}>
                  <option value="">Tất cả</option>
                  {floors.map(floor => (
                    <option key={floor} value={floor}>Tầng {floor}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Loại phòng</Form.Label>
                <Form.Select value={filterRoomType} onChange={e => setFilterRoomType(e.target.value === '' ? '' : Number(e.target.value))}>
                  <option value="">Tất cả</option>
                  {roomTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="available">Trống</option>
                  <option value="occupied">Đang ở</option>
                  <option value="cleaning">Đang dọn</option>
                  <option value="maintenance">Bảo trì</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={loadData}>
                <FaSearch className="me-1" /> Làm mới
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p>Đang tải danh sách phòng...</p>
        </div>
      ) : (
        <Row className="g-4">
          {filteredRooms.map(room => (
            <Col key={room.id} md={4} lg={3}>
              <Card
                className={`h-100 shadow-sm border-0 rounded-4 overflow-hidden hover-effect ${
                  room.status?.toLowerCase() === 'available' ? 'cursor-pointer' : ''
                }`}
                onClick={() => handleRoomClick(room)}
                style={room.status?.toLowerCase() === 'available' ? { cursor: 'pointer' } : {}}
              >
                <Card.Body className="text-center p-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <FaBed size={28} className="text-primary" />
                  </div>
                  <h5 className="mb-1">Phòng {room.roomNumber}</h5>
                  <p className="text-muted mb-2 small">Tầng {room.floor} - {getRoomTypeName(room.roomTypeId)}</p>
                  <div className="mb-2">{getStatusBadge(room.status || 'Unknown')}</div>
                  {room.status?.toLowerCase() === 'available' && (
                    <Button variant="success" size="sm" className="mt-2">
                      <FaCheckCircle className="me-1" /> Check-in
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal chọn booking để check-in */}
      <Modal show={showCheckinModal} onHide={() => setShowCheckinModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Check-in phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pendingBookings.length === 0 ? (
            <Alert variant="info">Hiện không có booking chờ check-in nào.</Alert>
          ) : (
            <>
              <p>Chọn booking cần check-in:</p>
              <Form.Group>
                <Form.Select value={selectedBookingId || ''} onChange={e => setSelectedBookingId(Number(e.target.value))}>
                  <option value="">-- Chọn booking --</option>
                  {pendingBookings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bookingCode} - {b.guestName} ({b.checkInDate} → {b.checkOutDate})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="mt-3">
                <p>Chọn phòng trống:</p>
                {loadingAvailableRooms ? (
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <Spinner size="sm" /> Đang tải danh sách phòng trống...
                  </div>
                ) : availableRooms.length === 0 ? (
                  <Alert variant="warning" className="mb-0">
                    Không có phòng trống cho booking này.
                  </Alert>
                ) : (
                  <Form.Group>
                    <Form.Select value={selectedRoomId || ''} onChange={e => setSelectedRoomId(Number(e.target.value))}>
                      <option value="">-- Chọn phòng --</option>
                      {availableRooms.map(room => (
                        <option key={room.id} value={room.id}>
                          Phòng {room.roomNumber} - Tầng {room.floor}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckinModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleCheckin} disabled={!selectedBookingId || checkingIn}>
            {checkingIn ? <Spinner size="sm" /> : 'Xác nhận check-in'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReceptionistRoomList;