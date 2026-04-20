import React, { useEffect, useState } from 'react';
import { Navbar, Dropdown, Badge } from 'react-bootstrap';
import { FaBell, FaUserCircle, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

interface TopBarProps {
  title: string;
  onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    const className = 'dark-mode';
    document.body.classList.toggle(className, darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const handleToggleNotifications = (isOpen: boolean) => {
    setShowNotifications(isOpen);
    if (isOpen) {
      markAllAsRead();
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timestamp;
    }
  };

  return (
    <Navbar bg="white" className="shadow-sm px-3 py-2 border-bottom">
      <div className="d-flex align-items-center w-100 justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-light d-md-none" onClick={onToggleSidebar}>
            ☰
          </button>
          <h5 className="mb-0 fw-semibold">{title}</h5>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Dropdown align="end" show={showNotifications} onToggle={handleToggleNotifications}>
            <Dropdown.Toggle variant="light" className="position-relative">
              <FaBell />
              {unreadCount > 0 && (
                <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-circle p-1">
                  {unreadCount}
                </Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-0" style={{ minWidth: 320 }}>
              <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                <strong>Thông báo</strong>
                <small className="text-muted">{unreadCount} chưa đọc</small>
              </div>
              {notifications.length === 0 ? (
                <Dropdown.ItemText className="text-muted p-3">Không có thông báo</Dropdown.ItemText>
              ) : (
                notifications.map((notification) => (
                  <Dropdown.ItemText key={notification.id} className="px-3 py-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{notification.title}</strong>
                        <div className="text-muted small">{notification.message}</div>
                      </div>
                      <small className="text-muted ms-3">{formatTime(notification.timestamp)}</small>
                    </div>
                  </Dropdown.ItemText>
                ))
              )}
            </Dropdown.Menu>
          </Dropdown>
          <button
            className="btn btn-light"
            onClick={() => setDarkMode(!darkMode)}
            aria-pressed={darkMode}
            title={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2">
              <FaUserCircle size={24} />
              <span className="d-none d-md-inline">{user?.fullName || 'Admin'}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={logout}>
                <FaSignOutAlt className="me-2" /> Đăng xuất
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </Navbar>
  );
};

export default TopBar;