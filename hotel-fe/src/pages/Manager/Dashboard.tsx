import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { FaMoneyBillWave, FaBed, FaSignInAlt, FaSignOutAlt, FaExclamationTriangle, FaTags, FaChartLine, FaCog, FaGift } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getRevenueReport } from '../../api/report';
import { RevenuePoint } from '../../types';

const ManagerDashboard: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [occupancyRate, setOccupancyRate] = useState(78);
  const [occupancyTrend, setOccupancyTrend] = useState('+5%');
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [checkOuts, setCheckOuts] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [popularVouchers, setPopularVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRevenueReport();
        setRevenueData(data);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setRevenueData([
          { label: 'T2', room: 1250000, service: 420000, damage: 0, total: 1670000 },
          { label: 'T3', room: 1450000, service: 300000, damage: 0, total: 1750000 },
          { label: 'T4', room: 1180000, service: 520000, damage: 0, total: 1700000 },
          { label: 'T5', room: 1600000, service: 380000, damage: 0, total: 1980000 },
          { label: 'T6', room: 1720000, service: 410000, damage: 0, total: 2130000 },
          { label: 'T7', room: 1950000, service: 520000, damage: 0, total: 2470000 },
          { label: 'CN', room: 1820000, service: 460000, damage: 0, total: 2280000 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const todayRevenue = revenueData.length > 0 ? revenueData[revenueData.length - 1].total : 0;

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4">Manager Dashboard - Quản lý khách sạn</h3>

      {/* KPI Cards */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="text-center p-3 border-primary">
            <FaMoneyBillWave size={40} className="text-primary mb-2" />
            <h5>Doanh thu hôm nay</h5>
            <h3 className="text-primary">{todayRevenue.toLocaleString()} VND</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center p-3 border-success">
            <FaBed size={40} className="text-success mb-2" />
            <h5>Công suất phòng</h5>
            <h3 className="text-success">{occupancyRate}%</h3>
            <small className="text-success">Xu hướng: {occupancyTrend}</small>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center p-3 border-warning">
            <FaExclamationTriangle size={40} className="text-warning mb-2" />
            <h5>Vật tư sắp hết</h5>
            <h3 className="text-warning">{lowStockItems.length}</h3>
            <small>mặt hàng</small>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* Check-ins Today */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <FaSignInAlt className="me-2" />
              Khách check-in hôm nay ({checkIns.length})
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {checkIns.map(checkin => (
                  <ListGroup.Item key={checkin.id}>
                    <strong>{checkin.guestName}</strong> - Phòng {checkin.room}
                    <br />
                    <small className="text-muted">Thời gian: {checkin.time}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Check-outs Today */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <FaSignOutAlt className="me-2" />
              Khách trả phòng hôm nay ({checkOuts.length})
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {checkOuts.map(checkout => (
                  <ListGroup.Item key={checkout.id}>
                    <strong>{checkout.guestName}</strong> - Phòng {checkout.room}
                    <br />
                    <small className="text-muted">Thời gian: {checkout.time}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* Low Stock Alert */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <FaExclamationTriangle className="me-2 text-warning" />
              Cảnh báo vật tư sắp hết
            </Card.Header>
            <Card.Body>
              {lowStockItems.map((item, index) => (
                <Alert key={index} variant="warning" className="mb-2">
                  <strong>{item.item}</strong>: Còn {item.current} (tối thiểu {item.min})
                </Alert>
              ))}
              <Link to="/admin/supplies" className="btn btn-outline-warning btn-sm">
                Quản lý vật tư
              </Link>
            </Card.Body>
          </Card>
        </Col>

        {/* Popular Vouchers */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <FaTags className="me-2" />
              Voucher phổ biến
            </Card.Header>
            <Card.Body>
              {popularVouchers.map((voucher, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                  <span><FaGift className="me-1" />{voucher.code}</span>
                  <Badge bg="info">{voucher.usage} lần</Badge>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Navigation */}
      <Row>
        <Col>
          <h5>Điều hướng nhanh</h5>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/admin/services" className="btn btn-outline-primary me-2">
              <FaCog className="me-1" /> Quản lý dịch vụ
            </Link>
            <Link to="/admin/vouchers" className="btn btn-outline-secondary me-2">
              <FaTags className="me-1" /> Quản lý voucher
            </Link>
            <Link to="/admin/reports" className="btn btn-outline-success">
              <FaChartLine className="me-1" /> Báo cáo
            </Link>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerDashboard;
