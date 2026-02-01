import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationsAPI } from '../../services/api';
import { FiHome, FiUsers, FiMessageSquare, FiBook, FiBell, FiSettings, FiLogOut, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadNotificationCount, setUnreadCount } = useSocket();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);

  // Fetch unread count on mount
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationsAPI.getUnreadCount();
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    if (user) {
      fetchUnreadCount();
    }
  }, [user, setUnreadCount]);

  // Fetch recent notifications for dropdown
  const fetchRecentNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications({ limit: 5 });
      setRecentNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    if (!showNotificationDropdown) {
      fetchRecentNotifications();
    }
    setShowDropdown(false);
  };

  const handleUserMenuClick = () => {
    setShowDropdown(!showDropdown);
    setShowNotificationDropdown(false);
  };

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
            placeholder="Search users, posts, hashtags..."
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
          <div className="nav-item-wrapper">
            <button 
              className="nav-item notification-btn" 
              title="Notifications"
              onClick={handleNotificationClick}
            >
              <FiBell />
              {unreadNotificationCount > 0 && (
                <span className="notification-badge">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {showNotificationDropdown && (
              <div className="notification-dropdown show">
                <div className="notification-dropdown-header">
                  <h4>Notifications</h4>
                  <Link to="/notifications" onClick={() => setShowNotificationDropdown(false)}>
                    See all
                  </Link>
                </div>
                <div className="notification-dropdown-list">
                  {recentNotifications.length === 0 ? (
                    <div className="notification-empty">No new notifications</div>
                  ) : (
                    recentNotifications.map(notification => (
                      <Link
                        key={notification._id}
                        to={notification.link || '/notifications'}
                        className={`notification-dropdown-item ${!notification.isRead ? 'unread' : ''}`}
                        onClick={() => setShowNotificationDropdown(false)}
                      >
                        {notification.sender?.avatar ? (
                          <img src={notification.sender.avatar} alt="" className="notification-avatar" />
                        ) : (
                          <div className="notification-avatar placeholder">
                            {notification.sender?.firstName?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="notification-content">
                          <span className="notification-text">
                            <strong>{notification.sender?.firstName || 'Someone'}</strong>{' '}
                            {notification.message}
                          </span>
                        </div>
                        {!notification.isRead && <span className="unread-indicator" />}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          <button
            className="user-menu-btn"
            onClick={handleUserMenuClick}
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
                to="/search"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <FiSearch /> Search
              </Link>
              <Link
                to="/notifications"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <FiBell /> Notifications
                {unreadNotificationCount > 0 && (
                  <span className="menu-badge">{unreadNotificationCount}</span>
                )}
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
          <Link to="/search" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
            <FiSearch /> Search
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
          <Link to="/notifications" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
            <FiBell /> Notifications
            {unreadNotificationCount > 0 && (
              <span className="mobile-badge">{unreadNotificationCount}</span>
            )}
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
