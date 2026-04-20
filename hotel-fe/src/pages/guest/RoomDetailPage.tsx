import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Badge, Carousel, Alert } from 'react-bootstrap';
import { FaBed, FaUsers, FaRulerCombined, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import { getRoomTypeById } from '../../api/rooms';
import { RoomType } from '../../types';

const RoomDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRoomType = async () => {
      try {
        setLoading(true);
        const data = await getRoomTypeById(Number(id));
        setRoomType(data);
      } catch (err) {
        setError('Không thể tải thông tin phòng');
        console.error('Load room type error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadRoomType();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-2">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  if (error || !roomType) {
    return (
      <div className="container py-5">
        <Alert variant="danger" className="text-center">
          {error || 'Không tìm thấy thông tin phòng'}
        </Alert>
        <div className="text-center mt-3">
          <Button variant="secondary" onClick={() => navigate('/')}>
            <FaArrowLeft className="me-2" />
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <Button variant="outline-secondary" onClick={() => navigate('/')} className="mb-3">
          <FaArrowLeft className="me-2" />
          Quay lại
        </Button>
        <h1 className="display-5">{roomType.name}</h1>
        <p className="text-muted lead">{roomType.description}</p>
      </div>

      <Row>
        {/* Images */}
        <Col lg={8} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              {roomType.roomImages && roomType.roomImages.length > 0 ? (
                <Carousel>
                  {roomType.roomImages.map((image) => (
                    <Carousel.Item key={image.id}>
                      <img
                        className="d-block w-100"
                        src={image.imageUrl}
                        alt={roomType.name}
                        style={{ height: '400px', objectFit: 'cover' }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <div
                  className="bg-light d-flex align-items-center justify-content-center"
                  style={{ height: '400px' }}
                >
                  <div className="text-center text-muted">
                    <FaBed size={48} className="mb-3" />
                    <p>Không có hình ảnh</p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Room Info & Booking */}
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Thông tin phòng</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaUsers className="text-primary me-2" />
                  <span>Sức chứa: <strong>{roomType.maxOccupancy} người</strong></span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <FaRulerCombined className="text-primary me-2" />
                  <span>Diện tích: <strong>{roomType.size} m²</strong></span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <Badge bg={roomType.isActive ? 'success' : 'secondary'} className="me-2">
                    {roomType.isActive ? 'Còn trống' : 'Không khả dụng'}
                  </Badge>
                </div>
              </div>

              <div className="border-top pt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Giá cơ bản:</span>
                  <span className="h4 text-primary mb-0">{formatCurrency(roomType.basePrice)}</span>
                </div>
                <small className="text-muted">* Giá có thể thay đổi tùy theo ngày và chính sách</small>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={() => navigate(`/book/${roomType.id}`)}
                disabled={!roomType.isActive}
              >
                <FaCalendarAlt className="me-2" />
                Đặt phòng ngay
              </Button>
            </Card.Body>
          </Card>

          {/* Amenities */}
          {roomType.roomAmenities && roomType.roomAmenities.length > 0 && (
            <Card className="shadow-sm">
              <Card.Header>
                <h6 className="mb-0">Tiện nghi</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {roomType.roomAmenities.map((amenity) => (
                    <Badge key={amenity.id} bg="light" text="dark" className="p-2">
                      {amenity.name}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Additional Info */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Thông tin chi tiết</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Đặc điểm phòng</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <FaBed className="text-primary me-2" />
                      Loại phòng: {roomType.name}
                    </li>
                    <li className="mb-2">
                      <FaUsers className="text-primary me-2" />
                      Sức chứa tối đa: {roomType.maxOccupancy} người lớn
                    </li>
                    <li className="mb-2">
                      <FaRulerCombined className="text-primary me-2" />
                      Diện tích: {roomType.size} m²
                    </li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Chính sách</h6>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2">• Check-in: 14:00</li>
                    <li className="mb-2">• Check-out: 12:00</li>
                    <li className="mb-2">• Hủy phòng miễn phí 24h trước</li>
                    <li className="mb-2">• Thanh toán khi nhận phòng</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RoomDetailPage;