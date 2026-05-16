import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Form, InputGroup, Pagination, Button } from 'react-bootstrap';
import { FaSearch, FaFilter } from 'react-icons/fa';

interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  table_name: string;
  record_id: number;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: itemsPerPage.toString(),
      });
      if (tableFilter) params.append('filter', tableFilter);
      if (actionFilter) params.append('action', actionFilter);

      const response = await fetch(`/api/audit-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load logs');

      const data = await response.json();
      // Xử lý cả mảng trực tiếp hoặc { $values: [...] }
      const normalized = Array.isArray(data) ? data : (data?.$values || []);
      setLogs(normalized);
    } catch (error) {
      console.error('Load logs error:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, tableFilter, actionFilter]);

  const getActionBadgeVariant = (action: string) => {
    switch (action?.toUpperCase()) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'primary';
      case 'DELETE': return 'danger';
      default: return 'secondary';
    }
  };

  const formatTableName = (tableName: string) => {
    const tableMap: { [key: string]: string } = {
      'Rooms': 'Phòng',
      'RoomTypes': 'Loại phòng',
      'Users': 'Người dùng',
      'Bookings': 'Đặt phòng',
      'Payments': 'Thanh toán',
      'Services': 'Dịch vụ',
    };
    return tableMap[tableName] || tableName;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const filtered = logs.filter(log => {
    if (!search) return true;
    return (
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.table_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.record_id?.toString().includes(search)
    );
  });

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading && logs.length === 0) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <Card className="shadow-lg border-0 rounded-4 mb-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom">
            <div className="bg-info bg-opacity-10 p-2 rounded-3">
              <FaSearch size={28} className="text-info" />
            </div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e466e' }}>
              Nhật ký hoạt động
            </h3>
            <Badge bg="info" className="ms-2 px-3 py-2">
              {filtered.length} bản ghi
            </Badge>
          </div>

          {/* Filters */}
          <Row className="mb-3 g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={tableFilter} onChange={e => setTableFilter(e.target.value)}>
                <option value="">Tất cả bảng</option>
                <option value="Rooms">Phòng</option>
                <option value="RoomTypes">Loại phòng</option>
                <option value="Users">Người dùng</option>
                <option value="Bookings">Đặt phòng</option>
                <option value="Payments">Thanh toán</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
                <option value="">Tất cả hành động</option>
                <option value="CREATE">Tạo mới</option>
                <option value="UPDATE">Cập nhật</option>
                <option value="DELETE">Xóa</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-primary" onClick={loadLogs} className="w-100">
                <FaFilter className="me-1" /> Lọc
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-lg border-0 rounded-4">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-bold">Hành động</th>
                <th className="fw-bold">Bảng</th>
                <th className="fw-bold">ID bản ghi</th>
                <th className="fw-bold">Người dùng</th>
                <th className="fw-bold">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    Không có dữ liệu nhật ký
                  </td>
                </tr>
              ) : (
                paginated.map(log => (
                  <tr key={log.id}>
                    <td>
                      <Badge bg={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </td>
                    <td>{formatTableName(log.table_name)}</td>
                    <td><code>{log.record_id}</code></td>
                    <td>{log.user_id ? `User ${log.user_id}` : 'Hệ thống'}</td>
                    <td>{formatTimestamp(log.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {filtered.length > itemsPerPage && (
            <div className="d-flex justify-content-center p-3">
              <Pagination>
                <Pagination.Prev disabled={page === 1} onClick={() => setPage(p => p - 1)} />
                {[...Array(Math.ceil(filtered.length / itemsPerPage))].map((_, i) => (
                  <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next disabled={page === Math.ceil(filtered.length / itemsPerPage)} onClick={() => setPage(p => p + 1)} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ActivityLog;