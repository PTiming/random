import React, { useState, useEffect } from 'react';
import { friendsAPI, usersAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { FiUserPlus, FiUserCheck, FiUserX, FiSearch, FiClock } from 'react-icons/fi';
import './Friends.css';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'friends':
          const friendsRes = await friendsAPI.getFriends();
          setFriends(friendsRes.data);
          break;
        case 'requests':
          const requestsRes = await friendsAPI.getPendingRequests();
          setPendingRequests(requestsRes.data);
          break;
        case 'sent':
          const sentRes = await friendsAPI.getSentRequests();
          setSentRequests(sentRes.data);
          break;
        case 'discover':
          const suggestedRes = await usersAPI.getSuggestedUsers();
          setSuggestedUsers(suggestedRes.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await usersAPI.searchUsers(searchQuery);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await friendsAPI.acceptRequest(userId);
      setPendingRequests(prev => prev.filter(req => req.from._id !== userId));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await friendsAPI.rejectRequest(userId);
      setPendingRequests(prev => prev.filter(req => req.from._id !== userId));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await friendsAPI.sendRequest(userId);
      setSuggestedUsers(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      await friendsAPI.cancelRequest(userId);
      setSentRequests(prev => prev.filter(req => req.to._id !== userId));
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  const handleRemoveFriend = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    try {
      await friendsAPI.removeFriend(userId);
      setFriends(prev => prev.filter(friend => friend._id !== userId));
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const renderUserCard = (user, actions) => (
    <div key={user._id} className="user-card">
      <Link to={`/profile/${user._id}`} className="user-info">
        {user.avatar ? (
          <img src={user.avatar} alt={user.username} className="user-avatar" />
        ) : (
          <div className="user-avatar avatar-placeholder">
            {user.username?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="user-details">
          <h4>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}</h4>
          <p>@{user.username}</p>
          {user.bio && <span className="user-bio">{user.bio}</span>}
        </div>
      </Link>
      <div className="user-actions">
        {actions}
      </div>
    </div>
  );

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1>Friends</h1>
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-primary btn-sm" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <FiUserCheck /> My Friends
        </button>
        <button
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <FiUserPlus /> Requests
          {pendingRequests.length > 0 && (
            <span className="badge badge-primary">{pendingRequests.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <FiClock /> Sent
        </button>
        <button
          className={`tab ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          <FiSearch /> Discover
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <div className="users-list">
            {searchResults.map(user => renderUserCard(user, (
              <button className="btn btn-primary btn-sm" onClick={() => handleSendRequest(user._id)}>
                <FiUserPlus /> Add Friend
              </button>
            )))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <div className="friends-content">
          {/* Friends List */}
          {activeTab === 'friends' && (
            <div className="users-list">
              {friends.length > 0 ? (
                friends.map(friend => renderUserCard(friend, (
                  <>
                    <Link to={`/messages/${friend._id}`} className="btn btn-secondary btn-sm">
                      Message
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveFriend(friend._id)}>
                      <FiUserX />
                    </button>
                  </>
                )))
              ) : (
                <div className="empty-state">
                  <h3>No friends yet</h3>
                  <p>Start connecting with classmates and colleagues!</p>
                </div>
              )}
            </div>
          )}

          {/* Friend Requests */}
          {activeTab === 'requests' && (
            <div className="users-list">
              {pendingRequests.length > 0 ? (
                pendingRequests.map(request => renderUserCard(request.from, (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAcceptRequest(request.from._id)}>
                      Accept
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleRejectRequest(request.from._id)}>
                      Decline
                    </button>
                  </>
                )))
              ) : (
                <div className="empty-state">
                  <h3>No pending requests</h3>
                  <p>You're all caught up!</p>
                </div>
              )}
            </div>
          )}

          {/* Sent Requests */}
          {activeTab === 'sent' && (
            <div className="users-list">
              {sentRequests.length > 0 ? (
                sentRequests.map(request => renderUserCard(request.to, (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCancelRequest(request.to._id)}>
                    Cancel Request
                  </button>
                )))
              ) : (
                <div className="empty-state">
                  <h3>No sent requests</h3>
                  <p>Send friend requests to connect with others!</p>
                </div>
              )}
            </div>
          )}

          {/* Discover */}
          {activeTab === 'discover' && (
            <div className="users-list">
              {suggestedUsers.length > 0 ? (
                suggestedUsers.map(user => renderUserCard(user, (
                  <button className="btn btn-primary btn-sm" onClick={() => handleSendRequest(user._id)}>
                    <FiUserPlus /> Add Friend
                  </button>
                )))
              ) : (
                <div className="empty-state">
                  <h3>No suggestions</h3>
                  <p>Try searching for people you know!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
