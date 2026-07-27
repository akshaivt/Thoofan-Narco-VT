import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Route protection wrapper that queries AuthContext.
 * Redirects unauthorized requests to appropriate landing layouts.
 * @param {React.ReactNode} children 
 * @param {Array<string>} allowedRoles Roles authorized to access this page
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, role } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gov-navy border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if role is authorized
  const hasAccess = allowedRoles.includes(role) || 
                    (role === 'superadmin' && allowedRoles.includes('admin'));

  if (!hasAccess) {
    // Unauthorized -> Redirect to role's dashboard
    if (role === 'citizen') {
      return <Navigate to="/citizen/dashboard" replace />;
    } else if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
