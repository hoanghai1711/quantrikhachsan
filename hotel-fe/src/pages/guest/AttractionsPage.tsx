import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { getAttractions } from '../../api/content';
import { Attraction } from '../../types';

const AttractionsPage: React.FC = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAttractions = async () => {
      try {
        const data = await getAttractions();
        setAttractions(data);
        setSelectedAttraction(data[0] ?? null);
      } catch (err) {
        setError((err as Error).message || 'Không thể tải điểm đến');
      } finally {
        setLoading(false);
      }
    };

    loadAttractions();
  }, []);

  const categories = useMemo(() => {
    const uniq = Array.from(new Set(attractions.map(item => item.category || 'Khác')));
    return ['All', ...uniq];
  }, [attractions]);

  const filteredAttractions = useMemo(() => {
    return attractions.filter(item => {
      const matchesCategory = category === 'All' || (item.category || 'Khác') === category;
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [attractions, category, searchTerm]);

  const activeAttraction = selectedAttraction && filteredAttractions.some(item => item.id === selectedAttraction.id)
    ? selectedAttraction
    : filteredAttractions[0] ?? null;

  return (
    <Container className="py-5">
      <h2 className="mb-4">Điểm đến nổi bật</h2>
      <p className="text-muted">Lọc theo loại, tìm theo tên và xem vị trí trực tiếp trên bản đồ.</p>

      <Card className="mb-4 p-3 border-0 shadow-sm">
        <Row className="g-3 align-items-end">
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Tìm điểm đến</Form.Label>
              <Form.Control
                type="search"
                placeholder="Nhập tên điểm đến hoặc chủ đề"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label>Loại điểm đến</Form.Label>
              <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
          <div className="mt-3">Đang tải điểm đến...</div>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row className="g-4">
          <Col lg={7}>
            <Row xs={1} md={2} className="g-4">
              {filteredAttractions.length === 0 ? (
                <Col>
                  <Alert variant="warning">Không tìm thấy điểm đến phù hợp.</Alert>
                </Col>
              ) : filteredAttractions.map(attraction => (
                <Col key={attraction.id}>
                  <Card className="h-100 shadow-sm border-0 hover-effect" onClick={() => setSelectedAttraction(attraction)} style={{ cursor: 'pointer' }}>
                    {attraction.imageUrl && <Card.Img variant="top" src={attraction.imageUrl} style={{ height: '180px', objectFit: 'cover' }} />}
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="fs-6 mb-1">{attraction.name}</Card.Title>
                        <Badge bg="secondary">{attraction.category || 'Khám phá'}</Badge>
                      </div>
                      <Card.Text className="small text-muted">{attraction.description}</Card.Text>
                      <div className="mt-3 d-flex justify-content-between align-items-center">
                        <div className="small text-muted"><FaMapMarkerAlt className="me-1" />{attraction.distanceFromHotel?.toFixed(1)} km</div>
                        <Button variant="outline-primary" size="sm">Xem bản đồ</Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>

          <Col lg={5}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <h5 className="mb-3">Bản đồ điểm đến</h5>
                {activeAttraction?.latitude && activeAttraction?.longitude ? (
                  <div className="ratio ratio-4x3">
                    <iframe
                      title={activeAttraction.name}
                      src={`https://www.google.com/maps?q=${activeAttraction.latitude},${activeAttraction.longitude}&z=15&output=embed`}
                      style={{ border: 0 }}
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="border rounded-3 p-4 text-center text-muted">
                    <p className="mb-2">Chọn một điểm đến có tọa độ để xem bản đồ.</p>
                    <Button variant="outline-secondary" disabled>
                      Không có dữ liệu vị trí
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {activeAttraction && (
              <Card className="shadow-sm border-0 mt-4">
                <Card.Body>
                  <Card.Title className="fs-5">{activeAttraction.name}</Card.Title>
                  <Card.Text className="text-muted small mb-2">{activeAttraction.address || activeAttraction.location}</Card.Text>
                  <Card.Text>{activeAttraction.description}</Card.Text>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AttractionsPage;
