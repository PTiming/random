import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  FiHome, FiUser, FiMessageCircle, FiBell, FiUsers, 
  FiBook, FiSettings, FiLogOut, FiMenu, FiX, FiSearch
} from 'react-icons/fi';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    { path: '/', icon: FiHome, label: 'Feed' },
    { path: '/messages', icon: FiMessageCircle, label: 'Messages' },
    { path: '/notifications', icon: FiBell, label: 'Notifications', badge: unreadCount },
    { path: '/groups', icon: FiUsers, label: 'Groups' },
    { path: '/moodle', icon: FiBook, label: 'Moodle' },
  ];

  return (
    <div className="layout">
      {/* Top Navigation */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
            <NavLink to="/" className="logo">
              <span className="logo-icon">📚</span>
              <span className="logo-text">EduConnect</span>
            </NavLink>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>

          <nav className="header-nav">
            {navItems.map(item => (
              <NavLink 
                key={item.path}
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
              >
                <item.icon />
                {item.badge > 0 && (
                  <span className="nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="header-right">
            <NavLink to={`/profile/${user?._id}`} className="user-menu">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="avatar avatar-sm" />
              ) : (
                <div className="avatar avatar-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
              <span className="user-name">{user?.firstName}</span>
            </NavLink>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <FiLogOut />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        {navItems.map(item => (
          <NavLink 
            key={item.path}
            to={item.path} 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
            end={item.path === '/'}
          >
            <item.icon />
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span className="mobile-nav-badge">{item.badge}</span>
            )}
          </NavLink>
        ))}
        <NavLink 
          to={`/profile/${user?._id}`}
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <FiUser />
          <span>Profile</span>
        </NavLink>
        <NavLink 
          to="/settings"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <FiSettings />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
