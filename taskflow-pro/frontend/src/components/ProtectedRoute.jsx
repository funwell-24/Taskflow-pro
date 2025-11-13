import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute component that checks authentication before rendering children
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If authentication is required and user is not logged in, redirect to login
  if (requireAuth && !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If route requires no authentication (like login/register) but user is logged in, redirect to dashboard
  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated or no authentication required, render children
  return children;
};

export default ProtectedRoute;