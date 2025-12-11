import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getDashboardPath } from '@/utils/navigation';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

/**
 * Role-Based Route Guard Component
 * Protects routes based on user roles
 * 
 * @param children - The component to render if access is granted
 * @param allowedRoles - Array of roles that can access this route
 * @param fallbackPath - Path to redirect to if access is denied (default: '/dashboard')
 */
export default function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard' 
}: RoleBasedRouteProps) {
  const auth = useAuth();
  const { user, isAuthenticated, hasRole } = auth || {};

  // If not authenticated, redirect to auth
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has required role
  if (!hasRole(...allowedRoles)) {
    // Redirect to user's appropriate dashboard based on their role
    const redirectPath = getDashboardPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

