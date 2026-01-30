import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to socket server
      const newSocket = io(window.location.origin, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
      });

      // Handle sync responses
      newSocket.on('sync:response', (data) => {
        console.log('Sync response received:', data.type);
        setLastSync(new Date());
      });

      // Handle data changes
      newSocket.on('data:changed', (data) => {
        console.log('Data changed:', data);
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('lms:dataChanged', { detail: data }));
      });

      // Handle notifications
      newSocket.on('notification', (notification) => {
        console.log('Notification:', notification);
        window.dispatchEvent(new CustomEvent('lms:notification', { detail: notification }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, token]);

  // Join a course room
  const joinCourse = useCallback((courseId) => {
    if (socket && isConnected) {
      socket.emit('join:course', courseId);
    }
  }, [socket, isConnected]);

  // Leave a course room
  const leaveCourse = useCallback((courseId) => {
    if (socket && isConnected) {
      socket.emit('leave:course', courseId);
    }
  }, [socket, isConnected]);

  // Request sync
  const requestSync = useCallback((type, lastSyncVersion = 0) => {
    if (socket && isConnected) {
      socket.emit('sync:request', { type, lastSyncVersion });
    }
  }, [socket, isConnected]);

  // Emit data update
  const emitUpdate = useCallback((type, action, data) => {
    if (socket && isConnected) {
      socket.emit('data:update', { type, action, data });
    }
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    lastSync,
    joinCourse,
    leaveCourse,
    requestSync,
    emitUpdate
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;
