import React, { useRef } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { Printer, X } from 'react-feather';
import { Invoice, Booking } from '../../types';
import './InvoicePrint.css';

interface InvoicePrintProps {
  invoice: Invoice;
  booking: Booking;
  onClose?: () => void;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ invoice, booking, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printRef.current.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const nights = Math.ceil(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="invoice-print-container">
      <div className="invoice-controls mb-3 d-print-none">
        <Button variant="primary" onClick={handlePrint} className="me-2">
          <Printer size={18} className="me-2" />
          In hóa đơn
        </Button>
        {onClose && (
          <Button variant="outline-secondary" onClick={onClose}>
            <X size={18} className="me-2" />
            Đóng
          </Button>
        )}
      </div>

      <div ref={printRef} className="invoice-document">
        <style>{`
          @media print {
            body { margin: 0; padding: 0; }
            .invoice-document { margin: 0; padding: 20px; }
            .no-print { display: none !important; }
          }
        `}</style>

        <div className="invoice-content">
          {/* Header */}
          <div className="invoice-header text-center mb-4">
            <h2 className="mb-1">KHÁCH SẠN LUMEA</h2>
            <p className="mb-1" style={{ fontSize: '14px' }}>
              123 Đường ABC, Quận 1, TP. Hồ Chí Minh
            </p>
            <p style={{ fontSize: '14px' }}>
              Tel: (028) 1234 5678 | Email: info@lumea.com
            </p>
            <hr style={{ margin: '15px 0' }} />
          </div>

          {/* Invoice Title */}
          <div className="text-center mb-3">
            <h3 className="mb-2">HÓA ĐƠN THANH TOÁN</h3>
            <Row className="justify-content-center">
              <Col xs={8}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13px' }}>
                  <div>
                    <strong>Số:</strong> INV-{invoice.id.toString().padStart(6, '0')}
                  </div>
                  <div>
                    <strong>Ngày:</strong> {formatDate(invoice.createdAt)}
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <hr style={{ margin: '15px 0' }} />

          {/* Guest Information */}
          <div className="mb-4">
            <h5 className="mb-2" style={{ fontWeight: 'bold', fontSize: '14px' }}>
              Thông tin khách hàng:
            </h5>
            <hr style={{ margin: '8px 0' }} />
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '40%', paddingBottom: '5px' }}>
                    <strong>Mã booking:</strong>
                  </td>
                  <td style={{ paddingBottom: '5px' }}>{booking.bookingCode}</td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '5px' }}>
                    <strong>Họ tên:</strong>
                  </td>
                  <td style={{ paddingBottom: '5px' }}>{booking.guestName}</td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '5px' }}>
                    <strong>SĐT:</strong>
                  </td>
                  <td style={{ paddingBottom: '5px' }}>{booking.guestPhone}</td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '5px' }}>
                    <strong>Email:</strong>
                  </td>
                  <td style={{ paddingBottom: '5px' }}>{booking.guestEmail}</td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '5px' }}>
                    <strong>Nhận phòng:</strong>
                  </td>
                  <td style={{ paddingBottom: '5px' }}>{formatDate(booking.checkInDate)}</td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '5px' }}>
                    <strong>Trả phòng:</strong>
                  </td>
                  <td style={{ paddingBottom: '5px' }}>{formatDate(booking.checkOutDate)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr style={{ margin: '15px 0' }} />

          {/* Booking Details */}
          <div className="mb-4">
            <h5 className="mb-2" style={{ fontWeight: 'bold', fontSize: '14px' }}>
              Chi tiết dịch vụ:
            </h5>
            <hr style={{ margin: '8px 0' }} />
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <tbody>
                {booking.roomTypeName && (
                  <tr>
                    <td style={{ paddingBottom: '8px', width: '60%' }}>
                      1. Phòng {booking.roomTypeName} - {nights} đêm
                    </td>
                    <td style={{ paddingBottom: '8px', textAlign: 'right' }}>
                      {formatCurrency(invoice.totalRoomAmount)}
                    </td>
                  </tr>
                )}
                {invoice.totalServiceAmount > 0 && (
                  <tr>
                    <td style={{ paddingBottom: '8px' }}>
                      2. Dịch vụ bổ sung
                    </td>
                    <td style={{ paddingBottom: '8px', textAlign: 'right' }}>
                      {formatCurrency(invoice.totalServiceAmount)}
                    </td>
                  </tr>
                )}
                {invoice.totalDamageAmount && invoice.totalDamageAmount > 0 && (
                  <tr>
                    <td style={{ paddingBottom: '8px' }}>
                      3. Phụ thu thiệt hại
                    </td>
                    <td style={{ paddingBottom: '8px', textAlign: 'right' }}>
                      {formatCurrency(invoice.totalDamageAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <hr style={{ margin: '15px 0', borderTop: '2px solid #333' }} />

          {/* Summary */}
          <div className="mb-4">
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ paddingBottom: '8px', textAlign: 'right', width: '60%' }}>
                    Tạm tính:
                  </td>
                  <td style={{ paddingBottom: '8px', textAlign: 'right', paddingLeft: '20px' }}>
                    {formatCurrency(
                      invoice.totalRoomAmount + 
                      invoice.totalServiceAmount + 
                      (invoice.totalDamageAmount || 0)
                    )}
                  </td>
                </tr>
                {invoice.discountAmount > 0 && (
                  <tr>
                    <td style={{ paddingBottom: '8px', textAlign: 'right', color: 'green' }}>
                      Giảm giá:
                    </td>
                    <td style={{ paddingBottom: '8px', textAlign: 'right', paddingLeft: '20px', color: 'green' }}>
                      -{formatCurrency(invoice.discountAmount)}
                    </td>
                  </tr>
                )}
                {invoice.taxAmount > 0 && (
                  <tr>
                    <td style={{ paddingBottom: '8px', textAlign: 'right' }}>
                      Thuế VAT (10%):
                    </td>
                    <td style={{ paddingBottom: '8px', textAlign: 'right', paddingLeft: '20px' }}>
                      {formatCurrency(invoice.taxAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <hr style={{ margin: '15px 0', borderTop: '2px solid #333' }} />

          {/* Total */}
          <div className="mb-4">
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ paddingBottom: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                    TỔNG CỘNG:
                  </td>
                  <td style={{ paddingBottom: '8px', textAlign: 'right', paddingLeft: '20px', fontWeight: 'bold' }}>
                    {formatCurrency(invoice.finalTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr style={{ margin: '15px 0' }} />

          {/* Payment Status */}
          <div className="mb-4">
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ paddingBottom: '8px', width: '60%' }}>
                    Trạng thái:
                  </td>
                  <td style={{ paddingBottom: '8px' }}>
                    {invoice.status === 'Paid' ? '✓ Đã thanh toán' : '⊗ Chưa thanh toán'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr style={{ margin: '15px 0' }} />

          {/* Footer */}
          <div className="text-center mt-4" style={{ fontSize: '13px' }}>
            <p className="mb-2">Cảm ơn quý khách. Hẹn gặp lại!</p>
            <p style={{ fontSize: '12px', color: '#666' }}>
              Hóa đơn này được tạo lúc {new Date(invoice.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;
