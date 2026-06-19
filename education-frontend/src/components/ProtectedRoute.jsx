// ============================================================
// components/ProtectedRoute.jsx
// Route guard that redirects unauthenticated users to login
// ============================================================

import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // If no token found, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
