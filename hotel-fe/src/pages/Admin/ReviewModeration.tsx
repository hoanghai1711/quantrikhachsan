import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Badge, Alert, Spinner, Form, Table } from 'react-bootstrap';
import { FaStar, FaCheck, FaTimes, FaEye, FaSpinner } from 'react-icons/fa';
import { 
  getPendingReviews, 
  getReviews, 
  approveReview, 
  rejectReview,
  getReviewStats,
  ReviewStats 
} from '../../api/review';
import { Review } from '../../types';
import { showToast } from '../../components/common/ToastNotification';

const ReviewModeration: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats[]>([]);
  const [selected, setSelected] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');

  useEffect(() => {
    load();
    loadStats();
  }, [statusFilter]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = statusFilter === 'Pending' ? await getPendingReviews() : await getReviews(statusFilter);
      setReviews(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi tải đánh giá';
      setError(message);
      showToast('danger', message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getReviewStats();
      setStats(data || []);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleApproveClick = (review: Review) => {
    setSelected(review);
    setActionType('approve');
    setShowActionModal(true);
  };

  const handleRejectClick = (review: Review) => {
    setSelected(review);
    setActionType('reject');
    setRejectionReason('');
    setShowActionModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      await approveReview(selected.id);
      showToast('success', 'Đã duyệt đánh giá');
      setShowActionModal(false);
      await load();
      await loadStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi duyệt đánh giá';
      showToast('danger', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selected || !rejectionReason.trim()) {
      showToast('warning', 'Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      setSubmitting(true);
      await rejectReview(selected.id, rejectionReason.trim());
      showToast('success', 'Đã từ chối đánh giá');
      setShowActionModal(false);
      await load();
      await loadStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi từ chối đánh giá';
      showToast('danger', message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 3) return 'warning';
    return 'danger';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'Pending': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h4>Duyệt đánh giá</h4>
              <p className="text-muted mb-0">Xem và duyệt các đánh giá từ khách hàng</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats */}
      <Row className="mb-4">
        {stats.map((stat) => (
          <Col md={4} key={stat.status}>
            <Card className="bg-light shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">{stat.status === 'Pending' ? 'Chờ duyệt' : stat.status === 'Approved' ? 'Đã duyệt' : 'Đã từ chối'}</h6>
                <h3 className="mb-2">{stat.count}</h3>
                <small>Đánh giá trung bình: {stat.avg_rating?.toFixed(1) || 'N/A'} ⭐</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Các nút lọc */}
      <Row className="mb-3">
        <Col>
          <div className="btn-group" role="group">
            {(['Pending', 'Approved', 'Rejected'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline-primary'}
                onClick={() => setStatusFilter(status)}
                disabled={loading}
              >
                {status === 'Pending' ? 'Chờ duyệt' : status === 'Approved' ? 'Đã duyệt' : 'Đã từ chối'}
              </Button>
            ))}
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {/* Reviews Table / Loading / Empty */}
      {loading ? (
        <Card className="text-center p-5">
          <Spinner animation="border" className="mb-3" />
          <p className="text-muted">Đang tải...</p>
        </Card>
      ) : reviews.length === 0 ? (
        <Card className="text-center p-5 bg-light">
          <p>Không có đánh giá {statusFilter === 'Pending' ? 'chờ duyệt' : statusFilter === 'Approved' ? 'đã duyệt' : 'đã từ chối'}.</p>
        </Card>
      ) : (
        <div className="table-responsive">
          <Table striped hover>
            <thead className="bg-light">
              <tr>
                <th>ID</th>
                <th>Khách</th>
                <th>Đánh giá</th>
                <th>Nhận xét</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id}>
                  <td className="small">{r.id}</td>
                  <td>
                    <strong>{r.guest_name || 'Ẩn danh'}</strong><br />
                    <small className="text-muted">{r.guest_email || 'N/A'}</small>
                  </td>
                  <td>
                    <Badge bg={getRatingColor(r.rating)}>
                      {r.rating} ⭐
                    </Badge>
                  </td>
                  <td className="text-truncate" style={{ maxWidth: '200px' }}>
                    {r.comment || 'Không có nhận xét'}
                  </td>
                  <td>
                    <Badge bg={getStatusVariant(r.status)}>
                      {r.status === 'Pending' ? 'Chờ' : r.status}
                    </Badge>
                  </td>
                  <td className="small">{formatDate(r.created_at)}</td>
                  <td>
                    <Button 
                      variant="sm" 
                      className="me-2"
                      onClick={() => { setSelected(r); setShowModal(true); }}
                    >
                      <FaEye /> Chi tiết
                    </Button>
                    {r.status === 'Pending' && (
                      <>
                        <Button 
                          variant="success" 
                          size="sm"
                          className="me-2"
                          onClick={() => handleApproveClick(r)}
                          disabled={submitting}
                        >
                          <FaCheck /> Duyệt
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleRejectClick(r)}
                          disabled={submitting}
                        >
                          <FaTimes /> Từ chối
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đánh giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted small">Khách hàng</Form.Label>
                <div>{selected.guest_name || 'Ẩn danh'}</div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted small">Email</Form.Label>
                <div>{selected.guest_email || 'N/A'}</div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted small">Đánh giá</Form.Label>
                <div>
                  <Badge bg={getRatingColor(selected.rating)}>
                    {selected.rating} ⭐
                  </Badge>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted small">Nhận xét</Form.Label>
                <div className="bg-light p-3 rounded">{selected.comment || 'Không có nhận xét'}</div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted small">Trạng thái</Form.Label>
                <div>
                  <Badge bg={getStatusVariant(selected.status)}>
                    {selected.status}
                  </Badge>
                </div>
              </Form.Group>
              {selected.rejection_reason && (
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small">Lý do từ chối</Form.Label>
                  <div className="bg-danger bg-opacity-10 p-3 rounded text-danger">{selected.rejection_reason}</div>
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Action Modal */}
      <Modal show={showActionModal} onHide={() => setShowActionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'approve' ? 'Duyệt đánh giá' : 'Từ chối đánh giá'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <p><strong>Khách:</strong> {selected.guest_name || 'Ẩn danh'}</p>
              <p><strong>Đánh giá:</strong> {selected.rating} ⭐</p>
              <p><strong>Nhận xét:</strong> {selected.comment}</p>
              {actionType === 'reject' && (
                <Form.Group>
                  <Form.Label>Lý do từ chối <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Nhập lý do từ chối (tối đa 1000 ký tự)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    maxLength={1000}
                    disabled={submitting}
                  />
                  <small className="text-muted">{rejectionReason.length}/1000</small>
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActionModal(false)} disabled={submitting}>
            Hủy
          </Button>
          {actionType === 'approve' ? (
            <Button 
              variant="success" 
              onClick={handleApproveConfirm}
              disabled={submitting}
            >
              {submitting && <FaSpinner className="fa-spin me-2" />}
              Duyệt
            </Button>
          ) : (
            <Button 
              variant="danger" 
              onClick={handleRejectConfirm}
              disabled={submitting}
            >
              {submitting && <FaSpinner className="fa-spin me-2" />}
              Từ chối
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReviewModeration;