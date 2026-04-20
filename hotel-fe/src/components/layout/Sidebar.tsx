import React from 'react';
import { Nav, Offcanvas } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  FaHome, FaSearch, FaClipboardCheck, FaStore, FaFileAlt, FaChartLine,
  FaTicketAlt, FaStar, FaBed, FaConciergeBell, FaBoxes, FaHistory,
  FaUsers, FaShieldAlt, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';
import styles from './MainLayout.module.css';

interface SidebarProps {
  collapsed: boolean;
  showMobile: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: IconType;
  permission: string;
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: FaHome, permission: 'VIEW_DASHBOARD' },
  { path: '/search-room', label: 'Tìm phòng', icon: FaSearch, permission: 'VIEW_ROOMS' },
  { path: '/room-cleaning', label: 'Dọn phòng', icon: FaBed, permission: 'CLEAN_ROOMS' },
  { path: '/check-in', label: 'Check-in', icon: FaClipboardCheck, permission: 'CHECK_IN' },
  { path: '/pos', label: 'POS dịch vụ', icon: FaStore, permission: 'MANAGE_POS' },
  { path: '/orders', label: 'Danh sách đơn', icon: FaFileAlt, permission: 'VIEW_BOOKINGS' },
  { path: '/reports', label: 'Báo cáo doanh thu', icon: FaChartLine, permission: 'VIEW_REPORTS' },
  { path: '/vouchers', label: 'Quản lý voucher', icon: FaTicketAlt, permission: 'MANAGE_VOUCHERS' },
  { path: '/reviews', label: 'Duyệt đánh giá', icon: FaStar, permission: 'REVIEW_MODERATION' },
  { path: '/room-types', label: 'Quản lý loại phòng', icon: FaBed, permission: 'MANAGE_ROOM_TYPES' },
  { path: '/services', label: 'Quản lý dịch vụ', icon: FaConciergeBell, permission: 'MANAGE_SERVICES' },
  { path: '/inventory', label: 'Quản lý vật tư', icon: FaBoxes, permission: 'MANAGE_SUPPLIES' },
  { path: '/activity-log', label: 'Nhật ký hoạt động', icon: FaHistory, permission: 'VIEW_AUDIT_LOG' },
  { path: '/user-management', label: 'Quản lý nhân sự', icon: FaUsers, permission: 'MANAGE_STAFF' },
  { path: '/permissions', label: 'Phân quyền vai trò', icon: FaShieldAlt, permission: 'MANAGE_ROLES' },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, showMobile, onToggle, onCloseMobile }) => {
  const { user } = useAuth();

  const filteredItems = menuItems.filter(item => 
    !item.permission || hasPermission(user, item.permission)
  );

  const renderMenu = () => (
    <Nav className="flex-column p-2">
      {filteredItems.map((item) => {
        const Icon = item.icon;
        return (
          <Nav.Item key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `d-flex align-items-center gap-3 py-2 px-3 rounded mb-1 text-decoration-none ${
                  isActive ? 'bg-light fw-bold' : 'text-dark'
                }`
              }
              style={{ color: 'inherit' }}
              onClick={onCloseMobile}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </Nav.Item>
        );
      })}
    </Nav>
  );

  return (
    <>
      <div className={`bg-white shadow-sm h-100 position-fixed start-0 top-0 border-end ${styles.sidebarContainer} ${collapsed ? styles.sidebarCollapsed : ''}`}
           style={{ zIndex: 1000 }}>
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          {!collapsed && <h5 className="mb-0 text-primary">Hotel ERP</h5>}
          <button className="btn btn-sm btn-light rounded-circle" onClick={onToggle}>
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>
        {renderMenu()}
      </div>

      <Offcanvas show={showMobile} onHide={onCloseMobile} backdrop scroll={false}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Hotel ERP</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{renderMenu()}</Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;