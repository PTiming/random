import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/helpers';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">SocialMoodle</span>
        </Link>

        {isAuthenticated && (
          <div className="navbar-search">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
            />
          </div>
        )}

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/feed" className="nav-link">
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Feed</span>
              </Link>
              <Link to="/courses" className="nav-link">
                <span className="nav-icon">📖</span>
                <span className="nav-text">Courses</span>
              </Link>
              <div className="nav-profile">
                <button
                  className="profile-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <img
                    src={getAvatarUrl(user?.avatar, user?.name)}
                    alt={user?.name}
                    className="avatar avatar-sm"
                  />
                  <span className="profile-name">{user?.name}</span>
                </button>
                
                {showDropdown && (
                  <div className="dropdown-menu">
                    <Link
                      to={`/profile/${user?._id}`}
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      to="/profile/edit"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      ⚙️ Settings
                    </Link>
                    <Link
                      to="/moodle/connect"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      🔗 Moodle Connection
                    </Link>
                    <hr className="dropdown-divider" />
                    <button
                      className="dropdown-item dropdown-item-danger"
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
