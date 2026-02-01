import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messagesAPI, usersAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { FiSend, FiArrowLeft, FiMoreVertical, FiSearch } from 'react-icons/fi';
import './Messages.css';

const Messages = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { socket, on, off } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle URL userId parameter
  useEffect(() => {
    if (userId) {
      loadChat(userId);
    }
  }, [userId]);

  // Socket listeners
  useEffect(() => {
    if (socket) {
      on('receiveMessage', handleNewMessage);
      on('userTyping', handleTyping);
    }

    return () => {
      if (socket) {
        off('receiveMessage', handleNewMessage);
        off('userTyping', handleTyping);
      }
    };
  }, [socket, activeChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoading(false);
  };

  const loadChat = async (chatUserId) => {
    try {
      setLoading(true);
      const [userRes, messagesRes] = await Promise.all([
        usersAPI.getProfile(chatUserId),
        messagesAPI.getConversation(chatUserId)
      ]);

      setActiveChat(userRes.data);
      setMessages(messagesRes.data.messages);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
    setLoading(false);
  };

  const handleNewMessage = (message) => {
    if (activeChat && (message.sender._id === activeChat._id || message.receiver._id === activeChat._id)) {
      setMessages(prev => [...prev, message]);
    }
    // Update conversation list
    fetchConversations();
  };

  const handleTyping = (data) => {
    if (activeChat && data.senderId === activeChat._id) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const response = await messagesAPI.sendMessage({
        receiverId: activeChat._id,
        content: newMessage.trim()
      });

      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    // Emit typing event
    if (socket && activeChat) {
      socket.emit('typing', {
        senderId: currentUser.id,
        receiverId: activeChat._id
      });
    }
  };

  return (
    <div className="messages-page">
      {/* Conversations List */}
      <div className={`conversations-panel ${activeChat ? 'hide-mobile' : ''}`}>
        <div className="panel-header">
          <h2>Messages</h2>
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search messages..." />
          </div>
        </div>

        <div className="conversations-list">
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
            </div>
          ) : conversations.length > 0 ? (
            conversations.map(conv => (
              <div
                key={conv.user._id}
                className={`conversation-item ${activeChat?._id === conv.user._id ? 'active' : ''}`}
                onClick={() => loadChat(conv.user._id)}
              >
                {conv.user.avatar ? (
                  <img src={conv.user.avatar} alt={conv.user.username} className="conv-avatar" />
                ) : (
                  <div className="conv-avatar avatar-placeholder">
                    {conv.user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="conv-info">
                  <div className="conv-header">
                    <h4>{conv.user.firstName && conv.user.lastName
                      ? `${conv.user.firstName} ${conv.user.lastName}`
                      : conv.user.username}</h4>
                    <span className="conv-time">
                      {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                    </span>
                  </div>
                  <p className="conv-preview">
                    {conv.lastMessage.sender === currentUser.id ? 'You: ' : ''}
                    {conv.lastMessage.content}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="unread-badge">{conv.unreadCount}</span>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No conversations yet</p>
              <p className="text-sm text-muted">Start chatting with your friends!</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`chat-panel ${!activeChat ? 'hide-mobile' : ''}`}>
        {activeChat ? (
          <>
            <div className="chat-header">
              <button className="back-btn hide-desktop" onClick={() => setActiveChat(null)}>
                <FiArrowLeft />
              </button>
              <Link to={`/profile/${activeChat._id}`} className="chat-user">
                {activeChat.avatar ? (
                  <img src={activeChat.avatar} alt={activeChat.username} className="chat-avatar" />
                ) : (
                  <div className="chat-avatar avatar-placeholder">
                    {activeChat.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="chat-user-info">
                  <h3>{activeChat.firstName && activeChat.lastName
                    ? `${activeChat.firstName} ${activeChat.lastName}`
                    : activeChat.username}</h3>
                  <span className={`status ${activeChat.isOnline ? 'online' : 'offline'}`}>
                    {activeChat.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </Link>
              <button className="menu-btn">
                <FiMoreVertical />
              </button>
            </div>

            <div className="messages-container">
              {messages.map((message, index) => {
                const isOwn = message.sender._id === currentUser.id || message.sender === currentUser.id;
                return (
                  <div key={message._id || index} className={`message ${isOwn ? 'own' : 'other'}`}>
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: false })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input" onSubmit={sendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleInputChange}
              />
              <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                <FiSend />
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a friend from the list to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
