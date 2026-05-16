import React from 'react';
import { Nav, Offcanvas } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  FaHome, FaSearch, FaClipboardCheck, FaStore, FaFileAlt, FaChartLine,
  FaTicketAlt, FaStar, FaBed, FaConciergeBell, FaBoxes, FaHistory,
  FaUsers, FaShieldAlt, FaChevronLeft, FaChevronRight, FaPlus, FaClipboardList,
  FaSignOutAlt
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
  { path: '/receptionist/create-booking', label: 'Tạo đơn đặt phòng', icon: FaPlus, permission: 'CHECK_IN' },
  { path: '/check-out', label: 'Check-out khách', icon: FaSignOutAlt, permission: 'CHECK_IN' },
  { path: '/orders', label: 'Danh sách đơn', icon: FaClipboardList, permission: 'VIEW_BOOKINGS' },
  { path: '/pos', label: 'POS dịch vụ', icon: FaStore, permission: 'MANAGE_POS' },
  { path: '/reports', label: 'Báo cáo doanh thu', icon: FaChartLine, permission: 'VIEW_REPORTS' },
  { path: '/vouchers', label: 'Quản lý voucher', icon: FaTicketAlt, permission: 'MANAGE_VOUCHERS' },
  { path: '/reviews', label: 'Duyệt đánh giá', icon: FaStar, permission: 'REVIEW_MODERATION' },
  { path: '/room-types', label: 'Quản lý loại phòng', icon: FaBed, permission: 'MANAGE_ROOM_TYPES' },
  { path: '/services', label: 'Quản lý dịch vụ', icon: FaConciergeBell, permission: 'MANAGE_SERVICES' },
  { path: '/inventory', label: 'Quản lý vật tư', icon: FaBoxes, permission: 'MANAGE_SUPPLIES' },
  { path: '/activity-log', label: 'Nhật ký hoạt động', icon: FaHistory, permission: 'VIEW_AUDIT_LOG' },
  { path: '/user-management', label: 'Quản lý nhân sự', icon: FaUsers, permission: 'MANAGE_STAFF' },
  { path: '/permissions', label: 'Phân quyền vai trò', icon: FaShieldAlt, permission: 'MANAGE_ROLES' },
  { path: '/receptionist/rooms', label: 'Quản lý phòng', icon: FaBed, permission: 'VIEW_ROOMS' }
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, showMobile, onToggle, onCloseMobile }) => {
  const { user } = useAuth();

  const filteredItems = menuItems.filter(item => 
    !item.permission || hasPermission(user, item.permission)
  );

  const renderMenu = () => (
    <Nav className="flex-column px-2 py-3">
      {filteredItems.map((item) => {
        const Icon = item.icon;
        return (
          <Nav.Item key={item.path} className="mb-1">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none transition-all ${
                  isActive ? styles.active : ''
                }`
              }
              onClick={onCloseMobile}
            >
              <Icon className={styles.icon} size={20} />
              {!collapsed && <span className={styles.label}>{item.label}</span>}
            </NavLink>
          </Nav.Item>
        );
      })}
    </Nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={`bg-dark text-white h-100 position-fixed start-0 top-0 ${styles.sidebarContainer} ${collapsed ? styles.sidebarCollapsed : ''}`}
        style={{ zIndex: 1000 }}
      >
        <div className={`d-flex align-items-center justify-content-between p-3 border-bottom border-secondary ${styles.header}`}>
          {!collapsed && <h5 className="mb-0 fw-bold text-gradient">🏨 Hotel ERP</h5>}
          <button 
            className={`btn btn-sm rounded-circle ${styles.toggleBtn}`} 
            onClick={onToggle}
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>
        {renderMenu()}
      </div>

      {/* Mobile Offcanvas */}
      <Offcanvas 
        show={showMobile} 
        onHide={onCloseMobile} 
        backdrop 
        scroll={false}
        className={styles.mobileOffcanvas}
      >
        <Offcanvas.Header closeButton className="border-bottom border-secondary bg-dark text-white">
          <Offcanvas.Title className="fw-bold">🏨 Hotel ERP</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="bg-dark p-0">
          {renderMenu()}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;