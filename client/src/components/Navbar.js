import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    switch(user?.role) {
      case 'admin':
        return '/admin';
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student';
      default:
        return '/dashboard';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={getDashboardLink()}>MERN Social Network</Link>
      </div>
      
      <div className="navbar-menu">
        {user && (
          <>
            <div className="navbar-user">
              <div className="avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '500' }}>{user.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
