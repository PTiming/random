import React, { useState } from 'react';
import { FaBell, FaSignOutAlt, FaUsers, FaSearch } from 'react-icons/fa';
import { useChat } from '../context/ChatContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Sidebar({ showNotifications, setShowNotifications }) {
  const { 
    user, 
    logout, 
    chats, 
    setChats,
    selectedChat, 
    setSelectedChat, 
    notifications,
    removeNotification,
    socket 
  } = useChat();
  
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `${API_URL}/api/users?search=${query}`,
        config
      );
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `${API_URL}/api/chats`,
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setSearch('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error accessing chat:', error);
    }
  };

  const selectChat = (chat) => {
    setSelectedChat(chat);
    removeNotification(chat._id);
    if (socket) {
      socket.emit('join chat', chat._id);
    }
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users.find((u) => u._id !== user._id);
    return otherUser?.name || 'Unknown';
  };

  const getChatAvatar = (chat) => {
    if (chat.isGroupChat) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.chatName)}&background=random`;
    }
    const otherUser = chat.users.find((u) => u._id !== user._id);
    return otherUser?.avatar || `https://ui-avatars.com/api/?name=U&background=random`;
  };

  const hasNotification = (chatId) => {
    return notifications.some((n) => n.chat._id === chatId);
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>💬 ChatApp</h3>
        <div className="header-actions">
          <div 
            className="header-icon" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>
          <div 
            className="header-icon" 
            onClick={() => setShowGroupModal(true)}
            title="Create Group Chat"
          >
            <FaUsers />
          </div>
          <div className="header-icon" onClick={logout} title="Logout">
            <FaSignOutAlt />
          </div>
        </div>
      </div>

      <div className="search-container" style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search users to chat..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
        {searchResults.length > 0 && (
          <div className="search-results">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : (
              searchResults.map((result) => (
                <div
                  key={result._id}
                  className="search-result-item"
                  onClick={() => accessChat(result._id)}
                >
                  <img
                    src={result.avatar}
                    alt={result.name}
                    className="search-result-avatar"
                  />
                  <div className="search-result-info">
                    <h4>{result.name}</h4>
                    <p>{result.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="chat-list">
        {chats.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
            Search for users to start chatting
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''} ${
                hasNotification(chat._id) ? 'has-notification' : ''
              }`}
              onClick={() => selectChat(chat)}
            >
              <img
                src={getChatAvatar(chat)}
                alt={getChatName(chat)}
                className="chat-avatar"
              />
              <div className="chat-info">
                <div className="chat-name">{getChatName(chat)}</div>
                <div className="chat-last-message">
                  {chat.latestMessage
                    ? `${chat.latestMessage.sender?.name === user.name ? 'You: ' : ''}${chat.latestMessage.content}`
                    : 'No messages yet'}
                </div>
              </div>
              <div className="chat-meta">
                {chat.latestMessage && (
                  <span className="chat-time">
                    {formatTime(chat.latestMessage.createdAt)}
                  </span>
                )}
                {hasNotification(chat._id) && (
                  <span className="unread-badge">New</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showGroupModal && (
        <GroupChatModal 
          onClose={() => setShowGroupModal(false)}
          user={user}
          setChats={setChats}
          chats={chats}
        />
      )}
    </div>
  );
}

// Group Chat Modal Component
function GroupChatModal({ onClose, user, setChats, chats }) {
  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `${API_URL}/api/users?search=${query}`,
        config
      );
      setSearchResults(data.filter(u => !selectedUsers.find(s => s._id === u._id)));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const addUser = (userToAdd) => {
    if (!selectedUsers.find((u) => u._id === userToAdd._id)) {
      setSelectedUsers([...selectedUsers, userToAdd]);
    }
    setSearch('');
    setSearchResults([]);
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const createGroup = async () => {
    setError('');
    if (!groupName) {
      setError('Please enter a group name');
      return;
    }
    if (selectedUsers.length < 2) {
      setError('Please add at least 2 users to the group');
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `${API_URL}/api/chats/group`,
        {
          name: groupName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]);
      onClose();
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <span className="modal-close" onClick={onClose}>&times;</span>
        <h3>Create Group Chat</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
          />
        </div>

        <div className="form-group">
          <label>Add Users (at least 2)</label>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search users..."
          />
        </div>

        {selectedUsers.length > 0 && (
          <div className="selected-users">
            {selectedUsers.map((u) => (
              <span key={u._id} className="selected-user-tag">
                {u.name}
                <button onClick={() => removeUser(u._id)}>&times;</button>
              </span>
            ))}
          </div>
        )}

        {searchResults.length > 0 && (
          <div style={{ marginTop: 10, maxHeight: 150, overflowY: 'auto' }}>
            {searchResults.map((result) => (
              <div
                key={result._id}
                className="search-result-item"
                onClick={() => addUser(result)}
              >
                <img
                  src={result.avatar}
                  alt={result.name}
                  className="search-result-avatar"
                  style={{ width: 30, height: 30 }}
                />
                <div className="search-result-info">
                  <h4 style={{ fontSize: 13 }}>{result.name}</h4>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          className="auth-btn" 
          onClick={createGroup}
          disabled={loading}
          style={{ marginTop: 20 }}
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
