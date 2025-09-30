/**
 * Dashboard Route Guard
 * Protects dashboard routes and redirects unauthenticated users
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface DashboardRouteGuardProps {
  children: React.ReactNode;
}

const DashboardRouteGuard: React.FC<DashboardRouteGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default DashboardRouteGuard;
