import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            social
          </Link>
          <input type="text" placeholder="Search Social" className="navbar-search" />
        </div>

        <div className="navbar-center">
          <button className="navbar-icon active">🏠 Home</button>
          <button className="navbar-icon">👥 Friends</button>
          <button className="navbar-icon">📚 Moodle</button>
        </div>

        <div className="navbar-right">
          <button className="navbar-btn">+</button>
          <button className="navbar-btn">💬</button>
          <button className="navbar-btn">🔔</button>
          <button className="navbar-profile" onClick={handleLogout}>
            <img
              src={user?.avatar || 'https://via.placeholder.com/32'}
              alt="Profile"
              className="navbar-avatar"
            />
            <span className="navbar-username">{user?.username}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
