import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../lib/db/schema';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { state } = useAuth();
  const location = useLocation();

  if (state.loading) {
    return <div>Loading...</div>;
  }

  if (!state.user || !allowedRoles.includes(state.user.role)) {
    return <Navigate to="/staff/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}