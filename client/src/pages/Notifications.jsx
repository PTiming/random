import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore } from '../store/notificationStore';
import { getSocket } from '../utils/socket';
import Navbar from '../components/Navbar';
import { Heart, MessageCircle, UserPlus, Mail, Check, CheckCheck } from 'lucide-react';

function Notifications() {
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead, addNotification } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    if (socket) {
      socket.on('notification', (notification) => {
        addNotification(notification);
      });

      return () => {
        socket.off('notification');
      };
    }
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={20} className="icon-like" />;
      case 'comment':
        return <MessageCircle size={20} className="icon-comment" />;
      case 'follow':
        return <UserPlus size={20} className="icon-follow" />;
      case 'message':
        return <Mail size={20} className="icon-message" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'message':
        return 'sent you a message';
      default:
        return '';
    }
  };

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <div className="notifications-container">
          <div className="notifications-header">
            <h1>Notifications</h1>
            <button onClick={markAllAsRead} className="btn btn-secondary">
              <CheckCheck size={16} /> Mark all as read
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => !notification.read && markAsRead(notification._id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <Link to={`/profile/${notification.sender?._id}`} className="sender-name">
                      {notification.sender?.username}
                    </Link>
                    <span>{getNotificationText(notification)}</span>
                    <span className="timestamp">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {!notification.read && (
                    <button className="mark-read-btn" title="Mark as read">
                      <Check size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No notifications yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Notifications;
