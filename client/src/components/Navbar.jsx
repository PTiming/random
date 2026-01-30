import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { AdminOnly, TeacherOrAdmin, StudentOnly } from './ProtectedRoute';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🎓 LMS
      </Link>

      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="navbar-link">
              Dashboard
            </Link>

            <AdminOnly>
              <Link to="/admin/users" className="navbar-link">
                Users
              </Link>
            </AdminOnly>

            <TeacherOrAdmin>
              <Link to="/courses/manage" className="navbar-link">
                My Courses
              </Link>
            </TeacherOrAdmin>

            <StudentOnly>
              <Link to="/courses" className="navbar-link">
                Browse Courses
              </Link>
              <Link to="/my-courses" className="navbar-link">
                My Courses
              </Link>
              <Link to="/grades" className="navbar-link">
                Grades
              </Link>
            </StudentOnly>

            <div className="sync-status">
              <span className={`sync-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
              {isConnected ? 'Synced' : 'Offline'}
            </div>

            <div className="user-info">
              <div className="user-avatar">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
              <span className={`badge badge-${user?.role}`}>
                {user?.role}
              </span>
            </div>

            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
