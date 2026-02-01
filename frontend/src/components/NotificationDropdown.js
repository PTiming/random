import React from 'react';
import { useChat } from '../context/ChatContext';

function NotificationDropdown({ onClose }) {
  const { notifications, setNotifications, setSelectedChat, removeNotification, socket } = useChat();

  const handleNotificationClick = (notification) => {
    setSelectedChat(notification.chat);
    removeNotification(notification.chat._id);
    if (socket) {
      socket.emit('join chat', notification.chat._id);
    }
    onClose();
  };

  const markAllAsRead = () => {
    setNotifications([]);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getSenderName = (notification) => {
    if (notification.message?.sender?.name) {
      return notification.message.sender.name;
    }
    return 'Someone';
  };

  const getChatName = (notification) => {
    if (notification.chat?.isGroupChat) {
      return notification.chat.chatName;
    }
    return getSenderName(notification);
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h4>Notifications</h4>
        {notifications.length > 0 && (
          <span className="mark-all-read" onClick={markAllAsRead}>
            Clear all
          </span>
        )}
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔔</div>
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <img
                src={
                  notification.message?.sender?.avatar ||
                  `https://ui-avatars.com/api/?name=U&background=random`
                }
                alt="User"
                className="notification-avatar"
              />
              <div className="notification-content">
                <div className="notification-text">
                  <strong>{getSenderName(notification)}</strong>
                  {notification.chat?.isGroupChat && (
                    <span> in {notification.chat.chatName}</span>
                  )}
                  <br />
                  {notification.message?.content?.substring(0, 50)}
                  {notification.message?.content?.length > 50 ? '...' : ''}
                </div>
                <div className="notification-time">
                  {formatTime(notification.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
