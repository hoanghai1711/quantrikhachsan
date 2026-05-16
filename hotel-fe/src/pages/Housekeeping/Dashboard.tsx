import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, ListGroup, Badge, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import { FaBroom, FaChartPie, FaExclamationTriangle, FaTh, FaCheck } from 'react-icons/fa';
import { fetchCleaningRooms, getRooms } from '../../api/rooms';
import { showToast } from '../../components/common/ToastNotification';

const HousekeepingDashboard: React.FC = () => {
  const [roomsToClean, setRoomsToClean] = useState<any[]>([]);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cleaningRooms = await fetchCleaningRooms();
      setRoomsToClean(cleaningRooms);
      const rooms = await getRooms();
      setAllRooms(rooms);
    } catch (error) {
      console.error('Error loading housekeeping data:', error);
      showToast('danger', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'cleaning': return 'warning';
      case 'occupied': return 'danger';
      case 'maintenance': return 'secondary';
      default: return 'light';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Trống';
      case 'cleaning': return 'Đang dọn';
      case 'occupied': return 'Đang ở';
      case 'maintenance': return 'Bảo trì';
      default: return status;
    }
  };

  const handleCompleteCleaning = (roomId: number) => {
    setRoomsToClean(prev => prev.filter(room => room.id !== roomId));
    showToast('success', 'Đã hoàn tất dọn phòng');
  };

  const getCleaningProgress = () => {
    const total = allRooms.length;
    const cleaned = allRooms.filter(r => r.status !== 'Cleaning' && r.status !== 'Reserved').length;
    return {
      completed: cleaned,
      total: total,
      percentage: total > 0 ? Math.round((cleaned / total) * 100) : 0
    };
  };

  const getPriorityBadge = (priority: string) => {
    return priority === 'Urgent' ? <Badge bg="danger">Gấp</Badge> : <Badge bg="secondary">Bình thường</Badge>;
  };

  const getRoomsByFloor = () => {
    const grouped: any = {};
    allRooms.forEach(room => {
      const floor = room.floor || 1;
      if (!grouped[floor]) grouped[floor] = [];
      grouped[floor].push(room);
    });
    return Object.keys(grouped).map(floor => ({
      floor: parseInt(floor),
      rooms: grouped[floor]
    })).sort((a, b) => a.floor - b.floor);
  };

  return (
    <div>
      <h3 className="mb-4">Housekeeping Dashboard - Buồng phòng</h3>

      <Row className="g-4 mb-4">
        {/* Rooms to Clean */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <FaBroom className="me-2" />
              Phòng cần dọn ({roomsToClean.length})
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {roomsToClean.map(room => (
                  <ListGroup.Item key={room.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Phòng {room.number}</strong> - Tầng {room.floor}
                      <br />
                      <small className="text-muted">{room.type}</small>
                      {getPriorityBadge(room.priority)}
                    </div>
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handleCompleteCleaning(room.id)}
                    >
                      <FaCheck className="me-1" /> Hoàn tất
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Cleaning Progress */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <FaChartPie className="me-2" />
              Tiến độ dọn dẹp hôm nay
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <h2 className="text-primary">{getCleaningProgress().completed}/{getCleaningProgress().total}</h2>
                <p>phòng đã dọn</p>
              </div>
              <ProgressBar now={getCleaningProgress().percentage} label={`${getCleaningProgress().percentage}%`} />
              <small className="text-muted mt-2 d-block">
                Mục tiêu: Hoàn thành trước 18:00
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Room Status Grid */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <FaTh className="me-2" />
              Trạng thái phòng theo tầng
            </Card.Header>
            <Card.Body>
              {getRoomsByFloor().map(floorData => (
                <div key={floorData.floor} className="mb-4">
                  <h5>Tầng {floorData.floor}</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {floorData.rooms.map(room => (
                      <Badge
                        key={room.id}
                        bg={getStatusColor(room.status)}
                        className="p-2"
                        style={{ minWidth: '60px' }}
                      >
                        {room.roomNumber}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HousekeepingDashboard;
