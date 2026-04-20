import React, { useState } from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';
import { showToast } from '../../components/common/ToastNotification';

const roles = ['receptionist', 'housekeeping', 'manager', 'admin'];
const permissions = ['view_rooms', 'check_in', 'manage_pos', 'view_reports', 'manage_vouchers', 'manage_staff'];

const PermissionsManagement: React.FC = () => {
  const [rolePerms, setRolePerms] = useState<Record<string, string[]>>({
    receptionist: ['view_rooms', 'check_in', 'manage_pos'],
    housekeeping: ['view_rooms'],
    manager: ['view_rooms', 'check_in', 'view_reports', 'manage_vouchers', 'manage_staff'],
    admin: permissions,
  });
  const [selectedRole, setSelectedRole] = useState('receptionist');

  const togglePerm = (perm: string) => {
    setRolePerms(prev => ({
      ...prev,
      [selectedRole]: prev[selectedRole].includes(perm) ? prev[selectedRole].filter(p => p !== perm) : [...prev[selectedRole], perm]
    }));
  };

  const handleSave = () => {
    // Gọi API lưu (mock)
    showToast('success', 'Đã lưu phân quyền');
  };

  return (
    <div>
      <Row><Col><Card className="shadow-sm mb-4"><Card.Body><h4>Phân quyền vai trò</h4><p className="text-muted">Quản lý quyền hạn cho từng loại tài khoản</p></Card.Body></Card></Col></Row>
      <Row className="mb-3"><Col md={4}>
        <Form.Select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
          {roles.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
        </Form.Select>
      </Col></Row>
      <Card className="shadow-sm"><Card.Body>
        <h5>Quyền hạn cho: {selectedRole}</h5>
        <div className="d-flex flex-wrap gap-3 mt-3">
          {permissions.map(p => (
            <Form.Check key={p} type="checkbox" label={p} checked={rolePerms[selectedRole]?.includes(p)} onChange={() => togglePerm(p)} />
          ))}
        </div>
        <Button variant="primary" className="mt-4" onClick={handleSave}><FaSave /> Lưu thay đổi</Button>
      </Card.Body></Card>
    </div>
  );
};

export default PermissionsManagement;