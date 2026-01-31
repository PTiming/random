import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const params = filter === 'unread' ? '?unreadOnly=true' : '';
      const response = await api.get(`/api/notifications${params}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/api/notifications');
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      like: '❤️',
      comment: '💬',
      follow: '👤',
      mention: '@',
      event_reminder: '📅',
      announcement: '📢',
      message: '✉️',
      group_invite: '👥',
      assignment_due: '⏰'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return 'bg-gray-50';
    const colors = {
      like: 'bg-red-50 border-l-4 border-red-400',
      comment: 'bg-blue-50 border-l-4 border-blue-400',
      follow: 'bg-purple-50 border-l-4 border-purple-400',
      mention: 'bg-yellow-50 border-l-4 border-yellow-400',
      event_reminder: 'bg-green-50 border-l-4 border-green-400',
      announcement: 'bg-orange-50 border-l-4 border-orange-400',
      message: 'bg-indigo-50 border-l-4 border-indigo-400',
      group_invite: 'bg-pink-50 border-l-4 border-pink-400',
      assignment_due: 'bg-red-50 border-l-4 border-red-400'
    };
    return colors[type] || 'bg-gray-50';
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">🔔 Notifications</h1>
          <p className="mt-2 text-indigo-100">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Actions Bar */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'unread' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition"
              >
                ✓ Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
              >
                🗑️ Clear all
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition hover:shadow-md ${getNotificationColor(notification.type, notification.isRead)}`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {notification.sender && (
                        <span className="font-semibold text-gray-900">
                          {notification.sender.name}
                        </span>
                      )}
                      <span className="text-gray-600">{notification.content}</span>
                    </div>
                    <p className="text-sm text-gray-500">{formatTime(notification.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? "You're all caught up!" 
                : "When you get notifications, they'll appear here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
