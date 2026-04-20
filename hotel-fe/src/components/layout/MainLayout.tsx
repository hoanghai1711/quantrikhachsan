import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => setSidebarCollapsed((value) => !value);
  const handleToggleMobileSidebar = () => setMobileSidebarOpen((value) => !value);
  const handleCloseMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className={styles.layoutRoot}>
      <Sidebar
        collapsed={sidebarCollapsed}
        showMobile={mobileSidebarOpen}
        onToggle={handleToggleSidebar}
        onCloseMobile={handleCloseMobileSidebar}
      />
      <div className={`${styles.pageContent} ${sidebarCollapsed ? styles.contentCollapsed : ''}`}>
        <TopBar title={title} onToggleSidebar={handleToggleMobileSidebar} />
        <Container fluid className="py-4 px-4">
          {children}
        </Container>
      </div>
    </div>
  );
};

export default MainLayout;