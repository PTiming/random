import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import api from '../services/api';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { subscribe } = useSocket();

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await api.get('/notifications', { params: { limit: 20 } });
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    const unsubscribe = subscribe('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo192.png'
        });
      }
    });

    const unsubscribeUpdate = subscribe('notification_updated', (notification) => {
      setNotifications(prev => 
        prev.map(n => n._id === notification._id ? notification : n)
      );
    });

    return () => {
      unsubscribe();
      unsubscribeUpdate();
    };
  }, [subscribe]);

  const fetchMore = async (page = 1) => {
    try {
      const response = await api.get('/notifications', { params: { page, limit: 20 } });
      if (page === 1) {
        setNotifications(response.data.data.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.data.data.notifications]);
      }
      setUnreadCount(response.data.data.unreadCount);
      return response.data.data;
    } catch (err) {
      console.error('Failed to fetch more notifications:', err);
      throw err;
    }
  };

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, channels: { ...n.channels, inApp: { ...n.channels.inApp, read: true } } }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({
          ...n,
          channels: { ...n.channels, inApp: { ...n.channels.inApp, read: true } }
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      const notification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (!notification?.channels?.inApp?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [notifications]);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
