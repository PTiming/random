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

  // Clear notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    socket,
    connected,
    notifications,
    emit,
    on,
    off,
    clearNotification,
    clearAllNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
