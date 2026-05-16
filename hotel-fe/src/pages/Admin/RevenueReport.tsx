import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { getRevenueReport } from '../../api/report';
import { RevenuePoint } from '../../types';
import { showToast } from '../../components/common/ToastNotification';
import { FaChartBar, FaSync, FaExclamationTriangle } from 'react-icons/fa';

const RevenueReport: React.FC = () => {
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRevenueData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRevenueReport();
      
      if (!result || result.length === 0) {
        setError('Không có dữ liệu doanh thu trong khoảng thời gian này');
        setData([]);
        return;
      }
      
      setData(result);
    } catch (err: any) {
      const message = err?.message || 'Không thể lấy báo cáo doanh thu. Vui lòng thử lại.';
      setError(message);
      console.error('Revenue report error:', err);
      showToast('danger', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, []);

  const total = data.reduce((s, i) => s + i.total, 0);
  const roomTotal = data.reduce((s, i) => s + i.room, 0);
  const serviceTotal = data.reduce((s, i) => s + i.service, 0);
  const damageTotal = data.reduce((s, i) => s + i.damage, 0);

  return (
    <div className="p-3" style={{ background: '#f4f7fc', minHeight: '100vh' }}>
      {/* Header */}
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden mb-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom">
            <div className="bg-info bg-opacity-10 p-2 rounded-3">
              <FaChartBar size={28} className="text-info" />
            </div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e466e' }}>Báo cáo doanh thu</h3>
          </div>
          <p className="text-muted mb-0 mt-2">Doanh thu phòng, dịch vụ trong 7 ngày qua</p>
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          <div className="d-flex align-items-center gap-2">
            <FaExclamationTriangle size={20} />
            <div>
              <strong>Lỗi:</strong> {error}
            </div>
          </div>
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Card className="shadow-lg border-0 rounded-4 text-center p-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Đang tải dữ liệu báo cáo...</p>
        </Card>
      ) : data.length === 0 ? (
        <Card className="shadow-lg border-0 rounded-4 text-center p-5">
          <p className="text-muted mb-3">Không có dữ liệu doanh thu</p>
          <Button variant="primary" onClick={loadRevenueData}>
            <FaSync className="me-2" /> Tải lại
          </Button>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <Row className="mb-4 g-3">
            <Col md={3}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Body className="text-center p-3">
                  <h6 className="text-muted mb-2">Doanh thu phòng</h6>
                  <h3 className="text-primary mb-0">{roomTotal.toLocaleString()}</h3>
                  <small className="text-muted">VND</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Body className="text-center p-3">
                  <h6 className="text-muted mb-2">Doanh thu dịch vụ</h6>
                  <h3 className="text-success mb-0">{serviceTotal.toLocaleString()}</h3>
                  <small className="text-muted">VND</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Body className="text-center p-3">
                  <h6 className="text-muted mb-2">Phí hư hỏng/mất</h6>
                  <h3 className="text-danger mb-0">{damageTotal.toLocaleString()}</h3>
                  <small className="text-muted">VND</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm border-0 h-100 bg-dark text-white">
                <Card.Body className="text-center p-3">
                  <h6 className="mb-2" style={{ opacity: 0.8 }}>Tổng doanh thu</h6>
                  <h3 className="mb-0">{total.toLocaleString()}</h3>
                  <small>VND</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Daily Breakdown */}
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Header className="bg-light p-3 border-bottom">
              <h5 className="mb-0 fw-bold">Chi tiết theo ngày</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="fw-bold">Ngày</th>
                      <th className="fw-bold text-end">Phòng</th>
                      <th className="fw-bold text-end">Dịch vụ</th>
                      <th className="fw-bold text-end">Hư hỏng/Mất</th>
                      <th className="fw-bold text-end">Tổng cộng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map(item => (
                      <tr key={item.label}>
                        <td className="fw-medium">{new Date(item.label).toLocaleDateString('vi-VN', { weekday: 'short', month: 'numeric', day: 'numeric' })}</td>
                        <td className="text-end">{item.room.toLocaleString()} VND</td>
                        <td className="text-end">{item.service.toLocaleString()} VND</td>
                        <td className="text-end text-danger">{item.damage.toLocaleString()} VND</td>
                        <td className="text-end fw-bold" style={{ color: '#1e466e' }}>{item.total.toLocaleString()} VND</td>
                      </tr>
                    ))}
                    <tr className="table-active fw-bold" style={{ backgroundColor: 'rgba(30, 70, 110, 0.05)' }}>
                      <td>Tổng cộng</td>
                      <td className="text-end">{roomTotal.toLocaleString()} VND</td>
                      <td className="text-end">{serviceTotal.toLocaleString()} VND</td>
                      <td className="text-end text-danger">{damageTotal.toLocaleString()} VND</td>
                      <td className="text-end" style={{ color: '#1e466e' }}>{total.toLocaleString()} VND</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>

          {/* Refresh Button */}
          <div className="text-center mt-4">
            <Button variant="outline-primary" onClick={loadRevenueData}>
              <FaSync className="me-2" /> Tải lại dữ liệu
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueReport;