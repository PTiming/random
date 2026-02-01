import { useEffect, useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { useMessageStore } from '../store/messageStore';
import { getSocket } from '../utils/socket';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Send, Search, ArrowLeft } from 'lucide-react';

function Messages() {
  const { user } = useAuthStore();
  const { 
    conversations, 
    currentConversation, 
    activeChat, 
    loading,
    fetchConversations, 
    fetchConversation, 
    sendMessage,
    addMessage,
    clearActiveChat
  } = useMessageStore();
  
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();

    const socket = getSocket();
    if (socket) {
      socket.on('newMessage', (msg) => {
        if (msg.sender._id === activeChat || msg.receiver._id === activeChat) {
          addMessage(msg);
        }
        fetchConversations();
      });

      socket.on('userTyping', ({ userId, username }) => {
        // Could show typing indicator
      });

      return () => {
        socket.off('newMessage');
        socket.off('userTyping');
      };
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await api.get(`/auth/search/${query}`);
      setSearchResults(res.data.filter(u => u._id !== user._id));
    } catch (error) {
      console.error('Error searching users:', error);
    }
    setSearching(false);
  };

  const selectConversation = async (userId, userData = null) => {
    setSelectedUser(userData || conversations.find(c => c._id === userId)?.user);
    await fetchConversation(userId);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    const socket = getSocket();
    const result = await sendMessage(activeChat, message);
    
    if (result.success) {
      setMessage('');
      socket?.emit('sendMessage', {
        receiverId: activeChat,
        message: result.message
      });
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
    clearActiveChat();
  };

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <div className="messages-container">
          {/* Conversations List */}
          <div className={`conversations-panel ${activeChat ? 'hidden-mobile' : ''}`}>
            <div className="panel-header">
              <h2>Messages</h2>
            </div>

            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {searchQuery && (
              <div className="search-results">
                {searching ? (
                  <div className="loading-mini">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(u => (
                    <div 
                      key={u._id} 
                      className="conversation-item"
                      onClick={() => selectConversation(u._id, u)}
                    >
                      <div className="avatar">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.username} />
                        ) : (
                          <span>{u.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="conversation-info">
                        <span className="username">{u.username}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No users found</div>
                )}
              </div>
            )}

            {!searchQuery && (
              <div className="conversations-list">
                {conversations.length > 0 ? (
                  conversations.map(conv => (
                    <div
                      key={conv._id}
                      className={`conversation-item ${activeChat === conv._id ? 'active' : ''}`}
                      onClick={() => selectConversation(conv._id, conv.user)}
                    >
                      <div className="avatar">
                        {conv.user?.avatar ? (
                          <img src={conv.user.avatar} alt={conv.user.username} />
                        ) : (
                          <span>{conv.user?.username?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="conversation-info">
                        <span className="username">{conv.user?.username}</span>
                        <span className="last-message">
                          {conv.lastMessage?.content?.substring(0, 30)}...
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No conversations yet.</p>
                    <p>Search for users to start chatting!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div className={`chat-panel ${!activeChat ? 'hidden-mobile' : ''}`}>
            {activeChat ? (
              <>
                <div className="chat-header">
                  <button className="back-btn mobile-only" onClick={handleBack}>
                    <ArrowLeft size={20} />
                  </button>
                  <div className="avatar">
                    {selectedUser?.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.username} />
                    ) : (
                      <span>{selectedUser?.username?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="username">{selectedUser?.username}</span>
                </div>

                <div className="messages-list">
                  {loading ? (
                    <div className="loading-container">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <>
                      {currentConversation.map(msg => (
                        <div
                          key={msg._id}
                          className={`message ${msg.sender._id === user._id ? 'sent' : 'received'}`}
                        >
                          <div className="message-content">
                            <p>{msg.content}</p>
                            <span className="timestamp">
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                <form onSubmit={handleSend} className="message-input">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button type="submit" disabled={!message.trim()}>
                    <Send size={20} />
                  </button>
                </form>
              </>
            ) : (
              <div className="no-chat-selected">
                <p>Select a conversation or search for users to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Messages;
