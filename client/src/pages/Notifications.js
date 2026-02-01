import React, { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiBell, FiCheck, FiCheckCircle, FiTrash2, FiFilter,
  FiMessageCircle, FiHeart, FiUserPlus, FiUsers, FiBook, FiAlertCircle
} from 'react-icons/fi';
import './Notifications.css';

const Notifications = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchMore, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    requestPermission
  } = useNotifications();
  
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const getIcon = (type) => {
    const icons = {
      'new_comment': FiMessageCircle,
      'new_reaction': FiHeart,
      'new_mention': FiBell,
      'new_reply': FiMessageCircle,
      'new_follower': FiUserPlus,
      'connection_request': FiUserPlus,
      'connection_accepted': FiCheckCircle,
      'new_message': FiMessageCircle,
      'new_group_message': FiUsers,
      'group_invitation': FiUsers,
      'moodle_assignment': FiBook,
      'moodle_deadline': FiAlertCircle,
      'moodle_grade': FiBook,
      'moodle_announcement': FiBell
    };
    return icons[type] || FiBell;
  };

  const getIconClass = (type) => {
    if (type.startsWith('moodle_')) return 'moodle';
    if (type.includes('message')) return 'message';
    if (type.includes('connection') || type.includes('follower')) return 'connection';
    return 'default';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.channels?.inApp?.read;
    if (filter === 'moodle') return n.source === 'moodle';
    if (filter === 'social') return ['new_comment', 'new_reaction', 'new_follower', 'connection_request', 'connection_accepted'].includes(n.type);
    if (filter === 'messages') return n.type.includes('message');
    return true;
  });

  const handleNotificationClick = async (notification) => {
    if (!notification.channels?.inApp?.read) {
      await markAsRead(notification._id);
    }
    // Navigate to action URL if present
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    await fetchMore(nextPage);
    setPage(nextPage);
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-left">
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <FiCheckCircle /> Mark all as read
        </button>
      </div>

      <div className="notifications-filters">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'moodle', label: 'Moodle' },
          { key: 'social', label: 'Social' },
          { key: 'messages', label: 'Messages' }
        ].map(f => (
          <button
            key={f.key}
            className={`filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="notifications-list">
        {loading && notifications.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <FiBell className="empty-state-icon" />
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <>
            {filteredNotifications.map(notification => {
              const Icon = getIcon(notification.type);
              const isRead = notification.channels?.inApp?.read;
              
              return (
                <div 
                  key={notification._id}
                  className={`notification-item ${!isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`notification-icon ${getIconClass(notification.type)}`}>
                    <Icon />
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="notification-actions">
                    {!isRead && (
                      <button 
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        title="Mark as read"
                      >
                        <FiCheck />
                      </button>
                    )}
                    <button 
                      className="action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  {notification.source === 'moodle' && (
                    <span className="source-badge moodle">Moodle</span>
                  )}
                </div>
              );
            })}
            
            <button className="btn btn-secondary load-more-btn" onClick={loadMore}>
              Load More
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
