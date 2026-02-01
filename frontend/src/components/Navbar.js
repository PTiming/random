import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  nav: {
    backgroundColor: '#1a73e8',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  logo: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  userName: {
    color: 'white',
    fontSize: '0.9rem'
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    textTransform: 'uppercase'
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid white',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  }
};

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        MERN LMS
      </Link>
      
      <div style={styles.navLinks}>
        <Link to="/courses" style={styles.link}>Courses</Link>
        
        {isAuthenticated ? (
          <>
            {user?.role === 'admin' && (
              <>
                <Link to="/users" style={styles.link}>Users</Link>
                <Link to="/moodle" style={styles.link}>Moodle Sync</Link>
              </>
            )}
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <Link to="/my-courses" style={styles.link}>My Courses</Link>
            )}
            <Link to="/grades" style={styles.link}>Grades</Link>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.firstName} {user?.lastName}</span>
              <span style={styles.badge}>{user?.role}</span>
              {user?.syncedWithMoodle && (
                <span style={styles.badge}>Moodle ✓</span>
              )}
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
