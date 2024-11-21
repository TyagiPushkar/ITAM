import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));

  // Check if user is authenticated
  const isAuthenticated = userDetails && userDetails.EmpId && userDetails.Role;

  // Check if the route is admin-only and if the user is an admin
  const isAdmin = userDetails?.Role === 'Admin';

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the route is admin-only and the user is not an admin, redirect to dashboard
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, allow access
  return children;
};

export default ProtectedRoute;
