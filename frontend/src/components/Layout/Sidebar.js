import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiUsers, FiMessageSquare, FiBook, FiSettings, FiCalendar, FiAward } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/friends', icon: FiUsers, label: 'Friends' },
    { path: '/messages', icon: FiMessageSquare, label: 'Messages' },
    { path: '/moodle', icon: FiBook, label: 'Moodle' },
    { path: '/settings', icon: FiSettings, label: 'Settings' }
  ];

  return (
    <aside className="sidebar">
      {/* User Profile Card */}
      <div className="sidebar-profile">
        <NavLink to={`/profile/${user?.id}`} className="profile-link">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.username} className="profile-avatar" />
          ) : (
            <div className="profile-avatar avatar-placeholder">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="profile-info">
            <h4 className="profile-name">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username}
            </h4>
            <p className="profile-username">@{user?.username}</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            end={path === '/'}
          >
            <Icon className="sidebar-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Moodle Status */}
      {user?.moodleConnected && (
        <div className="sidebar-moodle">
          <div className="moodle-status">
            <FiBook className="moodle-icon" />
            <span>Moodle Connected</span>
          </div>
          <div className="moodle-quick-links">
            <NavLink to="/moodle?tab=courses" className="quick-link">
              <FiBook /> Courses
            </NavLink>
            <NavLink to="/moodle?tab=assignments" className="quick-link">
              <FiCalendar /> Assignments
            </NavLink>
            <NavLink to="/moodle?tab=grades" className="quick-link">
              <FiAward /> Grades
            </NavLink>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        <p className="copyright">© 2024 EduConnect</p>
        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
