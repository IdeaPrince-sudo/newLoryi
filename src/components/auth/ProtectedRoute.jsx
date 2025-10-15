import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// ProtectedRoute component to guard routes that require authentication
// Can also protect routes based on module access
const ProtectedRoute = ({ children, requiredModule = null }) => {
  const { currentUser, canAccessModule } = useAuth();
  const location = useLocation();
  
  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If module is specified but user doesn't have access, redirect to dashboard
  if (requiredModule && !canAccessModule(requiredModule)) {
    return <Navigate to="/" replace />;
  }
  
  // If all checks pass, render the children
  return children;
};

export default ProtectedRoute;