import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/auth';
import AdminDashboard from '../pages/Admin/Dashboard';
import ManagerDashboard from '../pages/Manager/Dashboard';
import ReceptionistDashboard from '../pages/Receptionist/Dashboard';
import HousekeepingDashboard from '../pages/Housekeeping/Dashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case Role.ADMIN:
      return <AdminDashboard />;
    case Role.MANAGER:
      return <ManagerDashboard />;
    case Role.RECEPTIONIST:
      return <ReceptionistDashboard />;
    case Role.HOUSEKEEPING:
      return <HousekeepingDashboard />;
    default:
      return <Navigate to="/" />;
  }
};

export default Dashboard;