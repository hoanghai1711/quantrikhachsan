import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navbar, Container, Button } from 'react-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';
import { showToast } from '../common/ToastNotification';

export const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    showToast('info', 'Đã đăng xuất thành công');
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm mb-3">
      <Container fluid>
        <div>
          <Navbar.Brand className="fw-bold mb-1">Hệ thống quản lý khách sạn</Navbar.Brand>
          <div className="text-muted small">Chào mừng {user?.fullName || 'khách'}</div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button variant="dark" size="sm" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />Đăng xuất
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};
