import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { formatDistanceToNow } from '../utils/helpers';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const { on, off, setUnreadCount } = useSocket();

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await notificationsAPI.getNotifications({
        page,
        limit: 20,
        unreadOnly: filter === 'unread'
      });
      
      if (page === 1) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.data.notifications]);
      }
      
      setPagination(response.data.pagination);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, setUnreadCount]);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  // Listen for new notifications
  useEffect(() => {
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    on('notification', handleNewNotification);
    return () => off('notification', handleNewNotification);
  }, [on, off]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return;
    
    try {
      await notificationsAPI.deleteAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const icons = {
      post_like: '❤️',
      post_comment: '💬',
      friend_request: '👋',
      friend_accepted: '🤝',
      new_follower: '➕',
      mention: '@',
      share: '🔄',
      moodle_grade: '📊',
      moodle_assignment: '📝',
      moodle_deadline: '⏰'
    };
    return icons[type] || '🔔';
  };

  // Load more notifications
  const loadMore = () => {
    if (pagination.current < pagination.pages) {
      fetchNotifications(pagination.current + 1);
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>🔔 Notifications</h1>
        <div className="notifications-actions">
          <button onClick={markAllAsRead} className="action-btn">
            ✓ Mark all read
          </button>
          <button onClick={deleteAllNotifications} className="action-btn danger">
            🗑️ Clear all
          </button>
        </div>
      </div>

      <div className="notifications-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread
        </button>
      </div>

      <div className="notifications-list">
        {loading && notifications.length === 0 ? (
          <div className="loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔔</span>
            <p>No notifications yet</p>
            <span className="empty-subtext">
              When you get notifications, they'll appear here
            </span>
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <Link
                    to={notification.link || '#'}
                    className="notification-link"
                  >
                    {notification.sender && (
                      <img
                        src={notification.sender.avatar || '/default-avatar.png'}
                        alt=""
                        className="sender-avatar"
                      />
                    )}
                    <div className="notification-text">
                      <span className="sender-name">
                        {notification.sender
                          ? `${notification.sender.firstName} ${notification.sender.lastName}`
                          : 'Someone'}
                      </span>
                      <span className="notification-message">
                        {notification.message}
                      </span>
                    </div>
                  </Link>
                  <span className="notification-time">
                    {formatDistanceToNow(notification.createdAt)}
                  </span>
                </div>

                <button
                  className="delete-notification-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                >
                  ×
                </button>

                {!notification.isRead && <span className="unread-dot" />}
              </div>
            ))}

            {pagination.current < pagination.pages && (
              <button
                className="load-more-btn"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
