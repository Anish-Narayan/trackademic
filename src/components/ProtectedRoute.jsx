import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // You can use a more sophisticated spinner here, but a basic centered text works.
    return <div className="flex justify-center items-center h-screen text-xl text-blue-600">Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirects to the home page if the user isn't logged in or doesn't have the correct role.
    return <Navigate to="/" replace />;
  }

  // Renders the protected content if the user is authorized.
  return children;
};

export default ProtectedRoute;