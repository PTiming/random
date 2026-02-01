import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect to socket server
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        // Join user's room
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      // Listen for notifications
      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadNotificationCount(prev => prev + 1);
      });

      // Listen for online status changes
      newSocket.on('userOnline', ({ userId, isOnline }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (isOnline) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      });

      // Friend request events
      newSocket.on('friendRequestReceived', (data) => {
        console.log('Friend request received:', data);
      });

      newSocket.on('friendRequestWasAccepted', (data) => {
        console.log('Friend request was accepted:', data);
      });

      // New follower event
      newSocket.on('newFollower', (data) => {
        console.log('New follower:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  // Emit events
  const emit = useCallback((event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  }, [socket, connected]);

  // Subscribe to events
  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  // Unsubscribe from events
  const off = useCallback((event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

  // Join a post room for real-time comments
  const joinPost = useCallback((postId) => {
    if (socket && connected) {
      socket.emit('joinPost', postId);
    }
  }, [socket, connected]);

  // Leave a post room
  const leavePost = useCallback((postId) => {
    if (socket && connected) {
      socket.emit('leavePost', postId);
    }
  }, [socket, connected]);

  // Check if user is online
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  // Clear notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
    setUnreadNotificationCount(prev => Math.max(0, prev - 1));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadNotificationCount(0);
  }, []);

  // Set unread count (from API)
  const setUnreadCount = useCallback((count) => {
    setUnreadNotificationCount(count);
  }, []);

  const value = {
    socket,
    connected,
    notifications,
    unreadNotificationCount,
    onlineUsers,
    emit,
    on,
    off,
    joinPost,
    leavePost,
    isUserOnline,
    clearNotification,
    clearAllNotifications,
    setUnreadCount
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
