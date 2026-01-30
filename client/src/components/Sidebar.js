import React from 'react';

function Sidebar({ user }) {
  return (
    <div className="sidebar">
      <a href="/" className="sidebar-item">
        <img
          src={user?.avatar || 'https://via.placeholder.com/36'}
          alt="Profile"
          style={{ width: '36px', height: '36px', borderRadius: '50%' }}
        />
        <span className="sidebar-text">{user?.username}</span>
      </a>
      
      <div className="sidebar-item">
        <div className="sidebar-icon">👥</div>
        <span className="sidebar-text">Friends</span>
      </div>
      
      <div className="sidebar-item">
        <div className="sidebar-icon">⏰</div>
        <span className="sidebar-text">Memories</span>
      </div>
      
      <div className="sidebar-item">
        <div className="sidebar-icon">💾</div>
        <span className="sidebar-text">Saved</span>
      </div>
      
      <div className="sidebar-item">
        <div className="sidebar-icon">👥</div>
        <span className="sidebar-text">Groups</span>
      </div>
      
      <div className="sidebar-item">
        <div className="sidebar-icon">📺</div>
        <span className="sidebar-text">Videos</span>
      </div>
      
      <div className="sidebar-divider"></div>
      
      <div className="sidebar-item">
        <div className="sidebar-icon">📚</div>
        <span className="sidebar-text">Moodle Courses</span>
      </div>
      
      <div className="sidebar-item">
        <div className="sidebar-icon">📊</div>
        <span className="sidebar-text">My Grades</span>
      </div>
    </div>
  );
}

export default Sidebar;
