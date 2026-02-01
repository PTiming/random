import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { FiHome, FiUsers, FiMessageSquare, FiBook, FiBell, FiSettings, FiLogOut, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">EduConnect</span>
        </Link>

        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users, posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        {/* Desktop Navigation */}
        <div className="navbar-nav hide-mobile">
          <Link to="/" className="nav-item" title="Home">
            <FiHome />
          </Link>
          <Link to="/friends" className="nav-item" title="Friends">
            <FiUsers />
          </Link>
          <Link to="/messages" className="nav-item" title="Messages">
            <FiMessageSquare />
          </Link>
          <Link to="/moodle" className="nav-item" title="Moodle">
            <FiBook />
          </Link>
          <button className="nav-item notification-btn" title="Notifications">
            <FiBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          <button
            className="user-menu-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username} className="user-avatar" />
            ) : (
              <div className="user-avatar avatar-placeholder">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="user-name hide-mobile">{user?.firstName || user?.username}</span>
          </button>

          {showDropdown && (
            <div className="dropdown-menu show">
              <Link
                to={`/profile/${user?.id}`}
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <FiUsers /> Profile
              </Link>
              <Link
                to="/settings"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <FiSettings /> Settings
              </Link>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn hide-desktop"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
            <FiHome /> Home
          </Link>
          <Link to="/friends" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
            <FiUsers /> Friends
          </Link>
          <Link to="/messages" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
            <FiMessageSquare /> Messages
          </Link>
          <Link to="/moodle" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
            <FiBook /> Moodle
          </Link>
          <Link to="/settings" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
            <FiSettings /> Settings
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
