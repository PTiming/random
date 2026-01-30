import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route Component
 * Restricts access based on authentication and roles
 */
export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * Role-Based Component
 * Shows content only for specific roles
 */
export function RoleBasedContent({ roles, children, fallback = null }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return fallback;
  }

  return children;
}

/**
 * Admin Only Component
 */
export function AdminOnly({ children, fallback = null }) {
  return (
    <RoleBasedContent roles={['admin']} fallback={fallback}>
      {children}
    </RoleBasedContent>
  );
}

/**
 * Teacher Only Component
 */
export function TeacherOnly({ children, fallback = null }) {
  return (
    <RoleBasedContent roles={['teacher']} fallback={fallback}>
      {children}
    </RoleBasedContent>
  );
}

/**
 * Student Only Component
 */
export function StudentOnly({ children, fallback = null }) {
  return (
    <RoleBasedContent roles={['student']} fallback={fallback}>
      {children}
    </RoleBasedContent>
  );
}

/**
 * Teacher or Admin Component
 */
export function TeacherOrAdmin({ children, fallback = null }) {
  return (
    <RoleBasedContent roles={['teacher', 'admin']} fallback={fallback}>
      {children}
    </RoleBasedContent>
  );
}

export default ProtectedRoute;
