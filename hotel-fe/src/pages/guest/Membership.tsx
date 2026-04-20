import React, { useState, useEffect } from 'react';
import { Card, Badge, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Award, Star, TrendingUp } from 'react-feather';
import { getMembership, Membership as MembershipType } from '../../api/membership';

const Membership: React.FC = () => {
  const [membership, setMembership] = useState<MembershipType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const data = await getMembership();
        setMembership(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối');
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, []);

  const getTierColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'bronze': return 'warning';
      case 'silver': return 'secondary';
      case 'gold': return 'warning';
      default: return 'light';
    }
  };

  const getTierIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'bronze': return <Award size={24} className="text-warning" />;
      case 'silver': return <Star size={24} className="text-secondary" />;
      case 'gold': return <TrendingUp size={24} className="text-warning" />;
      default: return <Award size={24} className="text-muted" />;
    }
  };

  const getNextTier = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'bronze': return { name: 'Silver', points: 1000 };
      case 'silver': return { name: 'Gold', points: 5000 };
      case 'gold': return { name: 'Gold (Max)', points: null };
      default: return { name: 'Bronze', points: 0 };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Đang tải thông tin membership...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {error}
      </Alert>
    );
  }

  const nextTier = getNextTier(membership?.level);

  return (
    <div className="p-3" style={{ background: '#f4f7fc', minHeight: '100vh' }}>
      <div className="mb-4">
        <h2 className="fw-bold text-primary mb-4">Chương trình khách hàng thân thiết</h2>
        <p className="text-muted">Tích điểm và nhận ưu đãi đặc biệt khi đặt phòng tại khách sạn của chúng tôi</p>
      </div>

      <Row className="g-4">
        {/* Current Tier */}
        <Col md={6}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden h-100">
            <Card.Header className={`bg-${getTierColor(membership?.level)} text-white py-4`}>
              <div className="d-flex align-items-center gap-3">
                {getTierIcon(membership?.level)}
                <div>
                  <h4 className="mb-1">Hạng hiện tại</h4>
                  <h2 className="mb-0">{membership?.level || 'Chưa có'}</h2>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-3">
                <h5>Điểm tích lũy</h5>
                <h3 className="text-primary">{membership?.points || 0} điểm</h3>
              </div>
              <div className="mb-3">
                <h6>Ngày tham gia</h6>
                <p className="mb-0">
                  {membership?.joinedAt ? new Date(membership.joinedAt).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
              <div>
                <h6>Cập nhật lần cuối</h6>
                <p className="mb-0">
                  {membership?.lastUpdated ? new Date(membership.lastUpdated).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Next Tier Progress */}
        <Col md={6}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden h-100">
            <Card.Header className="bg-light py-4">
              <div className="d-flex align-items-center gap-3">
                <TrendingUp size={24} className="text-success" />
                <div>
                  <h4 className="mb-1">Tiến độ lên hạng</h4>
                  <h5 className="mb-0 text-success">{nextTier.name}</h5>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {nextTier.points ? (
                <>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Điểm hiện tại</span>
                      <span>{membership?.points || 0} / {nextTier.points}</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{
                          width: `${Math.min(((membership?.points || 0) / nextTier.points) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-muted small">
                    Cần thêm {Math.max(0, nextTier.points - (membership?.points || 0))} điểm để lên hạng {nextTier.name}
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <Star size={48} className="text-warning mb-3" />
                  <h5 className="text-success">Chúc mừng!</h5>
                  <p className="text-muted">Bạn đã đạt hạng cao nhất</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Benefits */}
        <Col md={12}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
            <Card.Header className="bg-primary text-white py-4">
              <h4 className="mb-0 d-flex align-items-center gap-2">
                <Award size={24} />
                Quyền lợi theo hạng
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-4">
                <Col md={4}>
                  <div className="text-center">
                    <Badge bg="warning" className="p-2 mb-3">
                      <Award size={20} />
                    </Badge>
                    <h5>Bronze</h5>
                    <ul className="list-unstyled small text-muted">
                      <li>• Tích điểm 1:10.000đ</li>
                      <li>• Giảm 5% cho lần đặt tiếp theo</li>
                      <li>• Ưu tiên check-in</li>
                    </ul>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <Badge bg="secondary" className="p-2 mb-3">
                      <Star size={20} />
                    </Badge>
                    <h5>Silver</h5>
                    <ul className="list-unstyled small text-muted">
                      <li>• Tích điểm 1:10.000đ</li>
                      <li>• Giảm 10% cho lần đặt tiếp theo</li>
                      <li>• Ưu tiên check-in + upgrade phòng</li>
                      <li>• Quà tặng sinh nhật</li>
                    </ul>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <Badge bg="warning" className="p-2 mb-3">
                      <TrendingUp size={20} />
                    </Badge>
                    <h5>Gold</h5>
                    <ul className="list-unstyled small text-muted">
                      <li>• Tích điểm 1:10.000đ</li>
                      <li>• Giảm 15% cho lần đặt tiếp theo</li>
                      <li>• Ưu tiên cao nhất + upgrade phòng</li>
                      <li>• Quà tặng sinh nhật + nghỉ dưỡng</li>
                      <li>• Dịch vụ đưa đón sân bay</li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Membership;