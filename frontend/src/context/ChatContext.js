import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const ChatContext = createContext();

const ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  // Initialize socket connection when user logs in
  useEffect(() => {
    if (user) {
      const newSocket = io(ENDPOINT);
      setSocket(newSocket);

      newSocket.emit('setup', user);
      newSocket.on('connected', () => {
        console.log('Socket connected');
      });

      newSocket.on('user status', ({ userId, isOnline }) => {
        setOnlineUsers((prev) => {
          if (isOnline) {
            return [...new Set([...prev, userId])];
          } else {
            return prev.filter((id) => id !== userId);
          }
        });
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  // Listen for new messages and notifications
  useEffect(() => {
    if (socket) {
      socket.on('message received', (newMessage) => {
        // If the message is not from the currently selected chat, add notification
        if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
          // Add notification only if not already exists
          setNotifications((prev) => {
            const exists = prev.find(
              (n) => n.message._id === newMessage._id
            );
            if (!exists) {
              return [{
                _id: Date.now(),
                message: newMessage,
                chat: newMessage.chat,
                isRead: false,
                createdAt: new Date().toISOString(),
              }, ...prev];
            }
            return prev;
          });
        }
      });

      socket.on('notification received', (notification) => {
        // Only add if not viewing that chat
        if (!selectedChat || selectedChat._id !== notification.chat._id) {
          setNotifications((prev) => {
            const exists = prev.find(
              (n) => n.message._id === notification.message._id
            );
            if (!exists) {
              return [{
                _id: Date.now(),
                ...notification,
                isRead: false,
                createdAt: new Date().toISOString(),
              }, ...prev];
            }
            return prev;
          });
        }
      });

      return () => {
        socket.off('message received');
        socket.off('notification received');
      };
    }
  }, [socket, selectedChat]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const logout = () => {
    if (socket) {
      socket.emit('user offline', user._id);
      socket.disconnect();
    }
    setUser(null);
    setSelectedChat(null);
    setChats([]);
    setNotifications([]);
    localStorage.removeItem('userInfo');
  };

  const removeNotification = (chatId) => {
    setNotifications((prev) => 
      prev.filter((n) => n.chat._id !== chatId)
    );
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    notifications,
    setNotifications,
    removeNotification,
    socket,
    onlineUsers,
    setOnlineUsers,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
