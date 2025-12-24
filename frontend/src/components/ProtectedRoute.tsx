import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, token } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check authentication status
  const isUserAuthenticated = isAuthenticated || !!token;
  if (!isUserAuthenticated) {
    // Check localStorage directly as final fallback
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};
