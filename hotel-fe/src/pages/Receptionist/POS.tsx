import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Form, Button, InputGroup } from 'react-bootstrap';
import { getServiceList, addServiceToBooking } from '../../api/booking';
import { ServiceItem } from '../../types';
import { showToast } from '../../components/common/ToastNotification';

const POS: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [bookingId, setBookingId] = useState('');
  const [quantityByService, setQuantityByService] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getServiceList();
        setServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Load services error:', error);
        setServices([]);
        showToast('danger', 'Không thể tải danh sách dịch vụ');
      }
    };
    load();
  }, []);

  const handleAddService = async (service: ServiceItem) => {
    const quantity = quantityByService[service.id] || 1;
    if (!bookingId || Number(bookingId) <= 0) {
      return showToast('warning', 'Nhập mã booking hợp lệ');
    }
    if (quantity <= 0) {
      return showToast('warning', 'Số lượng phải lớn hơn 0');
    }
    try {
      setLoading(true);
      const result = await addServiceToBooking(Number(bookingId), service.id, quantity);
      showToast('success', `Đã thêm ${quantity} x ${service.name}`);
      setQuantityByService(prev => ({ ...prev, [service.id]: 1 }));
      console.log('Added service', result);
    } catch (error) {
      console.error('Add POS service error:', error);
      showToast('danger', 'Không thể thêm dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Row><Col><Card className="shadow-sm mb-4"><Card.Body>
        <h4>POS dịch vụ</h4>
        <p className="text-muted">Chọn booking và thêm dịch vụ vào đơn hiện tại</p>
        <Form>
          <Form.Group className="mb-3" controlId="bookingId">
            <Form.Label>Mã booking</Form.Label>
            <Form.Control type="number" value={bookingId} onChange={e => setBookingId(e.target.value)} placeholder="Nhập ID booking" />
          </Form.Group>
        </Form>
      </Card.Body></Card></Col></Row>
      <Card className="shadow-sm"><Card.Body className="p-0">
        <Table hover responsive>
          <thead className="table-light"><tr><th>Dịch vụ</th><th>Giá</th><th>Trạng thái</th><th>Số lượng</th><th>Hành động</th></tr></thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id}>
                <td>{service.name}</td>
                <td>{service.price.toLocaleString()} VND</td>
                <td>{service.isActive ? 'Còn hàng' : 'Ngưng'}</td>
                <td>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      min={1}
                      value={quantityByService[service.id] ?? 1}
                      onChange={e => setQuantityByService(prev => ({ ...prev, [service.id]: Number(e.target.value) }))}
                    />
                  </InputGroup>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!service.isActive || loading}
                    onClick={() => handleAddService(service)}
                  >Thêm</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body></Card>
    </div>
  );
};

export default POS;
