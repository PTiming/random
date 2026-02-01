import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    if (user) {
      // Connect to socket server
      const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        transports: ['websocket'],
        autoConnect: true
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        // Register user with socket
        socket.emit('register', user._id);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socketRef.current = socket;

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [user]);

  const subscribe = useCallback((event, callback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(event, callback);
    
    // Track listener for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
      const listeners = listenersRef.current.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const joinRoom = useCallback((roomType, roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(`join_${roomType}`, roomId);
    }
  }, []);

  const leaveRoom = useCallback((roomType, roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(`leave_${roomType}`, roomId);
    }
  }, []);

  const startTyping = useCallback((conversationId) => {
    if (socketRef.current?.connected && user) {
      socketRef.current.emit('typing_start', {
        conversationId,
        userId: user._id,
        username: user.username
      });
    }
  }, [user]);

  const stopTyping = useCallback((conversationId) => {
    if (socketRef.current?.connected && user) {
      socketRef.current.emit('typing_stop', {
        conversationId,
        userId: user._id
      });
    }
  }, [user]);

  const value = {
    socket: socketRef.current,
    subscribe,
    emit,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    isConnected: socketRef.current?.connected || false
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
