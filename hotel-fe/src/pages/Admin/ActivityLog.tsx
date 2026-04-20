import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Form, InputGroup, Pagination } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

interface Log {
  id: number;
  action: string;
  user: string;
  resource: string;
  details: string;
  timestamp: string;
}

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/audit-logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Load logs error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  }

  const filtered = logs.filter(l => l.action.includes(search) || l.user.includes(search) || l.details.includes(search));
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div>
      <Row><Col><Card className="shadow-sm mb-4"><Card.Body><h4>Nhật ký hoạt động</h4><p className="text-muted">Xem chi tiết các thay đổi trong hệ thống</p></Card.Body></Card></Col></Row>
      <Row className="mb-3"><Col md={6}><InputGroup><InputGroup.Text><FaSearch /></InputGroup.Text><Form.Control placeholder="Tìm kiếm" value={search} onChange={e => setSearch(e.target.value)} /></InputGroup></Col></Row>
      <Card className="shadow-sm"><Card.Body className="p-0">
        <Table hover responsive><thead><tr><th>Hành động</th><th>Người dùng</th><th>Chi tiết</th><th>Thời gian</th></tr></thead>
        <tbody>
          {paginated.map(log => (
            <tr key={log.id}>
              <td><Badge bg="dark">{log.action}</Badge></td><td>{log.user}</td><td>{log.details}</td><td>{log.timestamp}</td>
            </tr>
          ))}
        </tbody></Table>
        {filtered.length > itemsPerPage && <div className="d-flex justify-content-center p-3"><Pagination><Pagination.Prev disabled={page===1} onClick={()=>setPage(p=>p-1)}/><Pagination.Next disabled={page===Math.ceil(filtered.length/itemsPerPage)} onClick={()=>setPage(p=>p+1)}/></Pagination></div>}
      </Card.Body></Card>
    </div>
  );
};

export default ActivityLog;