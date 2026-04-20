import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { showToast } from '../../components/common/ToastNotification';
import { getInvoice } from '../../api/booking';
import { Check, X } from 'react-feather';

const MoMoCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
  const [invoice, setInvoice] = useState<any>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Lấy từ localStorage
        const savedBookingId = localStorage.getItem('momo_booking_id');

        if (!savedBookingId) {
          setStatus('failure');
          showToast('danger', 'Không tìm thấy thông tin booking');
          return;
        }

        const bookId = Number(savedBookingId);
        setBookingId(bookId);

        // Từ URL params của MoMo
        const resultCode = searchParams.get('resultCode');
        const transId = searchParams.get('transId');
        const message = searchParams.get('message');

        console.log('MoMo Callback:', { resultCode, transId, message });

        // resultCode = 0: thành công, khác 0: thất bại
        if (resultCode === '0') {
          // Thanh toán thành công - reload invoice
          const updatedInvoice = await getInvoice(bookId);
          setInvoice(updatedInvoice);
          setStatus('success');
          showToast('success', 'Thanh toán MoMo thành công');

          // Xóa localStorage
          localStorage.removeItem('momo_invoice_id');
          localStorage.removeItem('momo_booking_id');
        } else {
          setStatus('failure');
          showToast('danger', `Thanh toán thất bại: ${message || resultCode}`);
        }
      } catch (error) {
        console.error('MoMo Callback error:', error);
        setStatus('failure');
        showToast('danger', 'Lỗi xử lý callback thanh toán');
      }
    };

    handleCallback();
  }, [searchParams]);

  const handleReturnCheckout = () => {
    if (bookingId) {
      navigate(`/checkout?booking=${bookingId}`);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="p-4" style={{ background: '#f4f7fc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '500px', width: '100%' }}>
        <Card.Body className="p-5 text-center">
          {status === 'loading' && (
            <>
              <Spinner animation="border" role="status" variant="primary" className="mb-3">
                <span className="visually-hidden">Đang xử lý...</span>
              </Spinner>
              <h4 className="mt-3">Đang xử lý thanh toán MoMo...</h4>
              <p className="text-muted">Vui lòng chờ trong giây lát</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '80px', height: '80px' }}>
                <Check size={48} className="text-success" />
              </div>
              <h4 className="mt-3 text-success fw-bold">Thanh toán thành công!</h4>
              <p className="text-muted mt-3">Thanh toán MoMo của bạn đã được xử lý thành công.</p>
              {invoice && (
                <div className="alert alert-info mt-4">
                  <p className="mb-1"><strong>Mã hóa đơn:</strong> {invoice.id}</p>
                  <p className="mb-1"><strong>Tổng tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.finalTotal)}</p>
                  <p className="mb-0"><strong>Trạng thái:</strong> {invoice.status}</p>
                </div>
              )}
              <Button variant="primary" size="lg" onClick={handleReturnCheckout} className="mt-4 w-100">
                Quay lại trang thanh toán
              </Button>
            </>
          )}

          {status === 'failure' && (
            <>
              <div className="bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '80px', height: '80px' }}>
                <X size={48} className="text-danger" />
              </div>
              <h4 className="mt-3 text-danger fw-bold">Thanh toán thất bại!</h4>
              <p className="text-muted mt-3">Thanh toán MoMo không thành công. Vui lòng thử lại.</p>
              <Alert variant="warning" className="mt-3">
                Hãy kiểm tra lại tài khoản MoMo của bạn và thử thanh toán lại.
              </Alert>
              <div className="d-flex gap-2 mt-4">
                <Button variant="secondary" size="lg" onClick={handleReturnCheckout} className="flex-grow-1">
                  Quay lại
                </Button>
                <Button variant="danger" size="lg" onClick={() => window.location.href = '/'} className="flex-grow-1">
                  Trang chủ
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MoMoCallback;
