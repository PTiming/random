import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { useChat } from '../context/ChatContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ChatArea() {
  const { user, selectedChat, setChats, chats, socket, onlineUsers } = useChat();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages when chat is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      setLoading(true);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          `${API_URL}/api/messages/${selectedChat._id}`,
          config
        );
        setMessages(data);
        
        if (socket) {
          socket.emit('join chat', selectedChat._id);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat, user, socket]);

  // Listen for new messages
  useEffect(() => {
    if (socket) {
      socket.on('message received', (newMessage) => {
        if (selectedChat && selectedChat._id === newMessage.chat._id) {
          setMessages((prev) => [...prev, newMessage]);
        }
      });

      socket.on('typing', (room) => {
        if (selectedChat && selectedChat._id === room) {
          setIsTyping(true);
        }
      });

      socket.on('stop typing', (room) => {
        if (selectedChat && selectedChat._id === room) {
          setIsTyping(false);
        }
      });

      return () => {
        socket.off('message received');
        socket.off('typing');
        socket.off('stop typing');
      };
    }
  }, [socket, selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socket || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop typing', selectedChat._id);
      setTyping(false);
    }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    if (socket) {
      socket.emit('stop typing', selectedChat._id);
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const messageContent = newMessage;
      setNewMessage('');

      const { data } = await axios.post(
        `${API_URL}/api/messages`,
        {
          content: messageContent,
          chatId: selectedChat._id,
        },
        config
      );

      // Add message to local state
      setMessages((prev) => [...prev, data]);

      // Emit socket event
      if (socket) {
        socket.emit('new message', data);
      }

      // Update chat list with latest message
      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          if (chat._id === selectedChat._id) {
            return { ...chat, latestMessage: data };
          }
          return chat;
        });
        // Move the chat to top
        const chatIndex = updatedChats.findIndex((c) => c._id === selectedChat._id);
        if (chatIndex > 0) {
          const [chat] = updatedChats.splice(chatIndex, 1);
          updatedChats.unshift(chat);
        }
        return updatedChats;
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getChatName = () => {
    if (!selectedChat) return '';
    if (selectedChat.isGroupChat) return selectedChat.chatName;
    const otherUser = selectedChat.users.find((u) => u._id !== user._id);
    return otherUser?.name || 'Unknown';
  };

  const isUserOnline = () => {
    if (!selectedChat || selectedChat.isGroupChat) return false;
    const otherUser = selectedChat.users.find((u) => u._id !== user._id);
    return otherUser && onlineUsers.includes(otherUser._id);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString();
  };

  if (!selectedChat) {
    return (
      <div className="chat-main">
        <div className="no-chat-selected">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>💬</div>
            <h3>Welcome to ChatApp</h3>
            <p style={{ marginTop: 10, color: '#666' }}>
              Select a chat or search for users to start messaging
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-main">
      <div className="chat-header">
        <img
          src={
            selectedChat.isGroupChat
              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.chatName)}&background=random`
              : selectedChat.users.find((u) => u._id !== user._id)?.avatar
          }
          alt={getChatName()}
          className="chat-avatar"
          style={{ width: 40, height: 40, marginRight: 15 }}
        />
        <div className="chat-header-info">
          <div className="chat-header-name">{getChatName()}</div>
          {!selectedChat.isGroupChat && (
            <div className={`chat-header-status ${isUserOnline() ? '' : 'offline'}`}>
              {isUserOnline() ? 'Online' : 'Offline'}
            </div>
          )}
          {selectedChat.isGroupChat && (
            <div className="chat-header-status offline">
              {selectedChat.users.length} members
            </div>
          )}
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', marginTop: 50 }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message, index) => {
                const showDate =
                  index === 0 ||
                  formatDate(message.createdAt) !==
                    formatDate(messages[index - 1].createdAt);

                return (
                  <React.Fragment key={message._id}>
                    {showDate && (
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#999',
                          fontSize: 12,
                          margin: '20px 0 10px',
                        }}
                      >
                        {formatDate(message.createdAt)}
                      </div>
                    )}
                    <div
                      className={`message ${
                        message.sender._id === user._id ? 'own' : ''
                      }`}
                    >
                      <div className="message-content">
                        {selectedChat.isGroupChat &&
                          message.sender._id !== user._id && (
                            <div className="message-sender">
                              {message.sender.name}
                            </div>
                          )}
                        <div className="message-text">{message.content}</div>
                        <div className="message-time">
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
            {isTyping && (
              <div className="typing-indicator">
                Someone is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form className="message-input-container" onSubmit={sendMessage}>
        <input
          type="text"
          className="message-input"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleTyping}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!newMessage.trim()}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}

export default ChatArea;
