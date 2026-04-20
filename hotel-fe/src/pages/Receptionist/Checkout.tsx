import React, { useState } from 'react';
import { Row, Col, Card, Button, Form, Spinner, Alert, Modal, Badge, InputGroup, Table } from 'react-bootstrap';
import { getBookingByIdentifier, checkOut, getInvoice, createPayment, createMomoPayment } from '../../api/booking';
import { showToast } from '../../components/common/ToastNotification';
import { Search, User, Calendar, LogOut, FileText } from 'react-feather';

const Checkout: React.FC = () => {
  const [searchType, setSearchType] = useState<'code' | 'phone'>('code');
  const [searchValue, setSearchValue] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const searchBooking = async () => {
    if (!searchValue.trim()) return;
    setLoading(true);
    setNotFound(false);
    setBooking(null);
    setInvoice(null);

    const data = await getBookingByIdentifier(searchValue.trim(), searchType);
    if (!data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setBooking(data);
    // Get invoice
    try {
      const inv = await getInvoice(data.id);
      setInvoice(inv);
    } catch (error) {
      console.error('Error getting invoice:', error);
    }
    setLoading(false);
  };

  const handleCheckout = () => {
    if (!booking) return;
    setShowConfirm(true);
  };

  const handlePayment = () => {
    if (!invoice) return;
    setPaymentAmount(invoice.finalTotal);
    setShowPaymentModal(true);
  };

  const performPayment = async () => {
    if (!invoice || paymentAmount <= 0) return;
    
    setLoading(true);
    try {
      if (paymentMethod === 'MoMo') {
        // Lưu invoiceId và bookingId vào localStorage trước khi redirect
        localStorage.setItem('momo_invoice_id', invoice.id);
        localStorage.setItem('momo_booking_id', booking.id);

        const momoResponse = await createMomoPayment(booking.id, {
          amount: paymentAmount,
          orderInfo: `Thanh toan hoa don ${invoice.id}`
        });

        if (!momoResponse?.payUrl) {
          throw new Error('Khong lay duoc duong dan thanh toan MoMo');
        }

        // Chuyển hướng đến payUrl
        window.location.href = momoResponse.payUrl;
        return;
      }

      await createPayment({
        invoiceId: invoice.id,
        paymentMethod: paymentMethod,
        amount: paymentAmount,
        transactionId: paymentMethod === 'BankTransfer' ? `TXN${Date.now()}` : undefined
      });
      
      showToast('success', 'Thanh toán thành công');
      setShowPaymentModal(false);
      
      // Reload invoice
      const updatedInv = await getInvoice(booking.id);
      setInvoice(updatedInv);
    } catch (error) {
      showToast('danger', 'Thanh toán thất bại');
    } finally {
      setLoading(false);
    }
  };

  const performCheckout = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      // Gọi API checkout
      await checkOut(booking.id);
      setShowConfirm(false);
      showToast('success', 'Check-out thành công');
      
      // Reload booking và invoice
      const updatedBooking = await getBookingByIdentifier(booking.bookingCode, 'code');
      if (updatedBooking) {
        setBooking(updatedBooking);
        const updatedInv = await getInvoice(updatedBooking.id);
        setInvoice(updatedInv);
      }
      
      // Reset form sau 2 giây
      setTimeout(() => {
        setBooking(null);
        setInvoice(null);
        setSearchValue('');
      }, 2000);
    } catch (error) {
      showToast('danger', 'Check-out thất bại');
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="p-3" style={{ background: '#f4f7fc', minHeight: '100vh' }}>
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
        <Card.Body className="p-4">
          {/* Header */}
          <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom">
            <div className="bg-danger bg-opacity-10 p-2 rounded-3">
              <LogOut size={28} className="text-danger" />
            </div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e466e' }}>Check-out khách hàng</h3>
            <Badge bg="danger" className="ms-2 px-3 py-2">Quầy lễ tân</Badge>
          </div>

          {/* Search */}
          <Row className="g-3 mb-4">
            <Col md={3}>
              <Form.Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="rounded-pill border-0 bg-light shadow-sm"
              >
                <option value="code">Mã booking</option>
                <option value="phone">Số điện thoại</option>
              </Form.Select>
            </Col>
            <Col md={7}>
              <InputGroup className="shadow-sm">
                <InputGroup.Text className="bg-white border-end-0">
                  <Search size={18} className="text-secondary" />
                </InputGroup.Text>
                <Form.Control
                  placeholder={searchType === 'code' ? 'Nhập mã booking...' : 'Nhập số điện thoại khách hàng...'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchBooking()}
                  className="border-start-0 py-2"
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Button
                onClick={searchBooking}
                disabled={loading}
                className="w-100 rounded-pill"
                variant="primary"
              >
                {loading ? <Spinner size="sm" /> : 'Tìm kiếm'}
              </Button>
            </Col>
          </Row>

          {notFound && (
            <Alert variant="warning" className="mb-4">
              Không tìm thấy booking với thông tin đã nhập.
            </Alert>
          )}

          {booking && (
            <Row className="g-4">
              <Col md={6}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0 d-flex align-items-center gap-2">
                      <User size={20} />
                      Thông tin khách hàng
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Tên:</strong> {booking.guestName}</p>
                    <p><strong>Email:</strong> {booking.guestEmail}</p>
                    <p><strong>Điện thoại:</strong> {booking.guestPhone}</p>
                    <p><strong>Mã booking:</strong> {booking.bookingCode}</p>
                    <p><strong>Trạng thái:</strong>
                      <Badge bg={booking.status === 'CheckedIn' ? 'success' : 'secondary'} className="ms-2">
                        {booking.status}
                      </Badge>
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0 d-flex align-items-center gap-2">
                      <Calendar size={20} />
                      Chi tiết đặt phòng
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Loại phòng:</strong> {booking.roomTypeName}</p>
                    <p><strong>Check-in:</strong> {formatDate(booking.checkInDate)}</p>
                    <p><strong>Check-out:</strong> {formatDate(booking.checkOutDate)}</p>
                    <p><strong>Số đêm:</strong> {booking.nights}</p>
                  </Card.Body>
                </Card>
              </Col>

              {invoice && (
                <Col md={12}>
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0 d-flex align-items-center gap-2">
                        <FileText size={20} />
                        Chi tiết hóa đơn - Mã: {invoice.id}
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Table striped bordered hover className="mb-0">
                        <tbody>
                          {/* Tiền phòng */}
                          <tr>
                            <td className="fw-semibold">Tiền phòng ({booking?.nights} đêm):</td>
                            <td className="text-end">{formatCurrency(invoice.totalRoomAmount || 0)}</td>
                          </tr>

                          {/* Dịch vụ */}
                          {(invoice.totalServiceAmount || 0) > 0 && (
                            <tr>
                              <td className="fw-semibold">Phí dịch vụ:</td>
                              <td className="text-end">{formatCurrency(invoice.totalServiceAmount || 0)}</td>
                            </tr>
                          )}

                          {/* Phí hư hỏng/mất mát */}
                          {(invoice.lossAndDamageCost || 0) > 0 && (
                            <tr>
                              <td className="fw-semibold" style={{ color: '#dc3545' }}>
                                Phí hư hỏng/mất vật tư:
                              </td>
                              <td className="text-end text-danger">{formatCurrency(invoice.lossAndDamageCost || 0)}</td>
                            </tr>
                          )}

                          {/* Giảm giá */}
                          {(invoice.discountAmount || 0) > 0 && (
                            <tr>
                              <td className="fw-semibold text-success">Giảm giá:</td>
                              <td className="text-end text-success">-{formatCurrency(invoice.discountAmount || 0)}</td>
                            </tr>
                          )}

                          {/* Thuế */}
                          {(invoice.taxAmount || 0) > 0 && (
                            <tr>
                              <td className="fw-semibold">Thuế (10%):</td>
                              <td className="text-end">{formatCurrency(invoice.taxAmount || 0)}</td>
                            </tr>
                          )}

                          {/* Đã thanh toán */}
                          {(invoice.totalPaid || 0) > 0 && (
                            <tr style={{ backgroundColor: '#e8f5e9' }}>
                              <td className="fw-semibold text-success">Đã thanh toán:</td>
                              <td className="text-end text-success fw-bold">
                                -{formatCurrency(invoice.totalPaid || 0)}
                              </td>
                            </tr>
                          )}

                          {/* Tổng cộng */}
                          <tr className="fw-bold" style={{ backgroundColor: '#e3f2fd', fontSize: '16px' }}>
                            <td>
                              <span className="text-primary">TỔNG CỘNG:</span>
                              {(invoice.finalTotal || 0) <= (invoice.totalPaid || 0) && (
                                <Badge bg="success" className="ms-2">ĐÃ THANH TOÁN</Badge>
                              )}
                              {(invoice.finalTotal || 0) > (invoice.totalPaid || 0) && (
                                <Badge bg="warning" className="ms-2">CÒN NỢ</Badge>
                              )}
                            </td>
                            <td className="text-end" style={{ color: '#1976d2' }}>
                              {formatCurrency(invoice.finalTotal || 0)}
                            </td>
                          </tr>

                          {/* Còn lại */}
                          {(invoice.finalTotal || 0) > (invoice.totalPaid || 0) && (
                            <tr style={{ backgroundColor: '#fff3e0' }}>
                              <td className="fw-semibold" style={{ color: '#f57c00' }}>Còn lại phải thanh toán:</td>
                              <td className="text-end fw-bold" style={{ color: '#f57c00' }}>
                                {formatCurrency(Math.max(0, (invoice.finalTotal || 0) - (invoice.totalPaid || 0)))}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>

                      {/* Thông tin thanh toán */}
                      <div className="mt-4 pt-3 border-top">
                        <p className="mb-1">
                          <strong>Trạng thái:</strong>{' '}
                          <Badge bg={invoice.status === 'Paid' ? 'success' : invoice.status === 'Pending' ? 'warning' : 'secondary'}>
                            {invoice.status === 'Paid' ? 'Đã thanh toán' : invoice.status === 'Pending' ? 'Chờ thanh toán' : 'Khác'}
                          </Badge>
                        </p>
                        <p className="mb-0">
                          <strong>Ngày tạo:</strong> {formatDate(invoice.createdAt)}
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )}

              <Col md={12} className="text-center">
                <div className="d-flex gap-3 justify-content-center">
                  <Button
                    onClick={handlePayment}
                    disabled={loading || !invoice || invoice.status === 'Paid'}
                    size="lg"
                    variant="success"
                    className="px-4"
                  >
                    {loading ? <Spinner size="sm" /> : 'Thanh toán'}
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    disabled={loading || booking.status !== 'CheckedIn'}
                    size="lg"
                    variant="danger"
                    className="px-4"
                  >
                    {loading ? <Spinner size="sm" /> : 'Check-out'}
                  </Button>
                </div>
              </Col>
            </Row>
          )}

          {/* Confirm Modal */}
          <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Xác nhận check-out</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Bạn có chắc chắn muốn check-out cho booking <strong>{booking?.bookingCode}</strong>?</p>
              {invoice && (
                <p className="text-primary fw-bold">
                  Tổng tiền: {formatCurrency(invoice.finalTotal)}
                </p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                Hủy
              </Button>
              <Button variant="danger" onClick={performCheckout} disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Xác nhận check-out'}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Payment Modal */}
          <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Thanh toán</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Phương thức thanh toán</Form.Label>
                <Form.Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="Cash">Tiền mặt</option>
                  <option value="BankTransfer">Chuyển khoản</option>
                  <option value="MoMo">MoMo</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Số tiền</Form.Label>
                <Form.Control
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  min="0"
                />
              </Form.Group>
              {invoice && (
                <div className="alert alert-info">
                  <strong>Tổng hóa đơn:</strong> {formatCurrency(invoice.finalTotal)}<br />
                  <strong>Còn lại:</strong> {formatCurrency(Math.max(0, invoice.finalTotal - (invoice.totalPaid || 0)))}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                Hủy
              </Button>
              <Button variant="success" onClick={performPayment} disabled={loading || paymentAmount <= 0}>
                {loading ? <Spinner size="sm" /> : 'Thanh toán'}
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Checkout;