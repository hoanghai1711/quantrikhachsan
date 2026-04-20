import React, { useState } from 'react';
import { Row, Col, Card, Button, ListGroup, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { FaBroom, FaChartPie, FaExclamationTriangle, FaTh, FaCheck } from 'react-icons/fa';

// Mock data
const mockRoomsToClean = [
  { id: 1, number: '101', floor: '1', type: 'Standard', priority: 'Normal' },
  { id: 2, number: '205', floor: '2', type: 'Deluxe', priority: 'Urgent' },
  { id: 3, number: '312', floor: '3', type: 'Suite', priority: 'Normal' },
  { id: 4, number: '108', floor: '1', type: 'Standard', priority: 'Normal' },
];
const mockCleaningProgress = { completed: 12, total: 15, percentage: 80 };
const mockUrgentRequests = [
  { id: 1, room: '205', request: 'Khách yêu cầu thêm khăn tắm gấp', time: '10:30' },
  { id: 2, room: '312', request: 'Dọn phòng trước 14:00', time: '11:15' },
];
const mockRoomStatuses = [
  { floor: 1, rooms: [
    { number: '101', status: 'cleaning' },
    { number: '102', status: 'available' },
    { number: '103', status: 'occupied' },
    { number: '104', status: 'maintenance' },
    { number: '105', status: 'available' },
  ]},
  { floor: 2, rooms: [
    { number: '201', status: 'occupied' },
    { number: '202', status: 'available' },
    { number: '203', status: 'cleaning' },
    { number: '204', status: 'occupied' },
    { number: '205', status: 'cleaning' },
  ]},
  { floor: 3, rooms: [
    { number: '301', status: 'available' },
    { number: '302', status: 'occupied' },
    { number: '303', status: 'maintenance' },
    { number: '304', status: 'available' },
    { number: '305', status: 'cleaning' },
  ]},
];

const HousekeepingDashboard: React.FC = () => {
  const [roomsToClean, setRoomsToClean] = useState(mockRoomsToClean);

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
    // Mock API call to update room status
    console.log(`Updating room ${roomId} status to available`);
    setRoomsToClean(prev => prev.filter(room => room.id !== roomId));
    // In real app: call updateRoomStatus(roomId, 'available')
  };

  const getPriorityBadge = (priority: string) => {
    return priority === 'Urgent' ? <Badge bg="danger">Gấp</Badge> : <Badge bg="secondary">Bình thường</Badge>;
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
                <h2 className="text-primary">{mockCleaningProgress.completed}/{mockCleaningProgress.total}</h2>
                <p>phòng đã dọn</p>
              </div>
              <ProgressBar now={mockCleaningProgress.percentage} label={`${mockCleaningProgress.percentage}%`} />
              <small className="text-muted mt-2 d-block">
                Mục tiêu: Hoàn thành trước 18:00
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Urgent Requests */}
      {mockUrgentRequests.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card border="warning">
              <Card.Header>
                <FaExclamationTriangle className="me-2 text-warning" />
                Yêu cầu gấp từ khách ({mockUrgentRequests.length})
              </Card.Header>
              <Card.Body>
                {mockUrgentRequests.map(request => (
                  <Alert key={request.id} variant="warning" className="mb-2">
                    <strong>Phòng {request.room}:</strong> {request.request}
                    <br />
                    <small className="text-muted">{request.time}</small>
                  </Alert>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Room Status Grid */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <FaTh className="me-2" />
              Trạng thái phòng theo tầng
            </Card.Header>
            <Card.Body>
              {mockRoomStatuses.map(floor => (
                <div key={floor.floor} className="mb-4">
                  <h5>Tầng {floor.floor}</h5>
                  <Row className="g-2">
                    {floor.rooms.map(room => (
                      <Col key={room.number} xs={6} sm={4} md={2}>
                        <div
                          className={`p-2 text-center border rounded bg-${getStatusColor(room.status)} text-white`}
                          style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <div>
                            <strong>{room.number}</strong>
                            <br />
                            <small>{getStatusText(room.status)}</small>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
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
