import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { getRevenueReport } from '../../api/report';
import { RevenuePoint } from '../../types';

const RevenueReport: React.FC = () => {
  const [data, setData] = useState<RevenuePoint[]>([]);
  useEffect(() => { getRevenueReport().then(setData); }, []);

  const total = data.reduce((s, i) => s + i.total, 0);

  return (
    <div>
      <Card className="shadow-sm mb-4"><Card.Body><h4>Báo cáo doanh thu</h4><p className="text-muted">Doanh thu phòng, dịch vụ theo tuần</p></Card.Body></Card>
      <Row className="mb-4"><Col><Card className="bg-dark text-white"><Card.Body><h5>Tổng doanh thu</h5><h2>{total.toLocaleString()} VND</h2></Card.Body></Card></Col></Row>
      <Row className="g-3">
        {data.map(item => (
          <Col md={6} key={item.label}>
            <Card><Card.Body><h5>{item.label}</h5>
              <div>Phòng: {item.room.toLocaleString()} VND</div><div>Dịch vụ: {item.service.toLocaleString()} VND</div>
              <div className="mt-2"><strong>Tổng: {item.total.toLocaleString()} VND</strong></div>
            </Card.Body></Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RevenueReport;