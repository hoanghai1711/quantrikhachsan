import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Pagination } from 'react-bootstrap';
import { FaSearch, FaSave, FaToggleOn, FaToggleOff, FaUserCog } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { User, Role } from '../../types/auth';
import { showToast } from '../../components/common/ToastNotification';

interface Staff extends User {
  status?: 'active' | 'inactive';
  joinDate?: string;
  lastLogin?: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser, updateUser } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadStaff();
  }, []);

 const loadStaff = async () => {
  try {
    const users = await userService.getStaffUsers();
    // Đảm bảo users là mảng
  const usersArray = (users as any).$values || users;
if (!Array.isArray(usersArray)) {
  setStaff([]);
  return;
}
    const enriched = usersArray.map((u: any) => ({
      ...u,
      status: Math.random() > 0.2 ? 'active' as const : 'inactive' as const,
      joinDate: '2025-01-15',
      lastLogin: new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleString('vi-VN'),
    }));
    setStaff(enriched);
  } catch (error) {
    showToast('danger', 'Không thể tải danh sách nhân viên');
  } finally {
    setLoading(false);
  }
};

  const handleRoleChange = async (id: number, newRole: Role) => {
    try {
      const updated = await userService.updateUserRole(id, newRole);
      setStaff(prev => prev.map(s => s.id === id ? { ...s, role: updated.role } : s));
      if (currentUser?.id === id) updateUser(updated);
      showToast('success', 'Cập nhật vai trò thành công');
    } catch {
      showToast('danger', 'Lỗi cập nhật vai trò');
    }
  };

  const toggleStatus = (id: number) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
    showToast('success', 'Đã thay đổi trạng thái');
  };

  const filtered = staff.filter(s =>
    (roleFilter === 'all' || s.role === roleFilter) &&
    (s.fullName.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) return <div className="text-center py-5">Đang tải...</div>;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h4 className="mb-1">Quản lý nhân sự</h4>
              <p className="text-muted">Gán vai trò và quản lý trạng thái nhân viên</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={5}>
          <InputGroup>
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control placeholder="Tìm theo tên hoặc email" value={search} onChange={e => setSearch(e.target.value)} />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">Tất cả vai trò</option>
            <option value="receptionist">Lễ tân</option>
            <option value="housekeeping">Buồng phòng</option>
            <option value="manager">Quản lý</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Nhân viên</th><th>Email</th><th>Vai trò hiện tại</th><th>Vai trò mới</th><th>Trạng thái</th><th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(s => (
                <tr key={s.id}>
                  <td><FaUserCog className="me-2 text-primary" />{s.fullName}</td>
                  <td>{s.email}</td>
                  <td><Badge bg="secondary">{s.role}</Badge></td>
                  <td>
                    <Form.Select size="sm" value={s.role} onChange={e => handleRoleChange(s.id, e.target.value as Role)} style={{ width: 130 }}>
                      <option value="receptionist">Lễ tân</option><option value="housekeeping">Buồng phòng</option>
                      <option value="manager">Quản lý</option><option value="admin">Admin</option>
                    </Form.Select>
                  </td>
                  <td><Badge bg={s.status === 'active' ? 'success' : 'secondary'}>{s.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</Badge></td>
                  <td className="d-flex gap-2">
                    <Button size="sm" variant="dark" onClick={() => handleRoleChange(s.id, s.role)}><FaSave /> Lưu</Button>
                    <Button size="sm" variant={s.status === 'active' ? 'outline-danger' : 'outline-success'} onClick={() => toggleStatus(s.id)}>
                      {s.status === 'active' ? <FaToggleOff /> : <FaToggleOn />} {s.status === 'active' ? 'Vô hiệu' : 'Kích hoạt'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {totalPages > 1 && (
            <div className="d-flex justify-content-center p-3">
              <Pagination>
                <Pagination.Prev disabled={page === 1} onClick={() => setPage(p => p - 1)} />
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item key={i} active={i + 1 === page} onClick={() => setPage(i + 1)}>{i + 1}</Pagination.Item>
                ))}
                <Pagination.Next disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserManagement;