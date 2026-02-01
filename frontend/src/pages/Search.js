import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchAPI, usersAPI, friendsAPI } from '../services/api';
import PostCard from '../components/Post/PostCard';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState(searchParams.get('type') || 'all');
  const [results, setResults] = useState({ users: null, posts: null, hashtags: null });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trending, setTrending] = useState([]);

  // Fetch trending hashtags on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await searchAPI.getTrending({ limit: 10 });
        setTrending(response.data.trending || []);
      } catch (error) {
        console.error('Error fetching trending:', error);
      }
    };
    fetchTrending();
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery, type) => {
    if (!searchQuery.trim()) {
      setResults({ users: null, posts: null, hashtags: null });
      return;
    }

    setLoading(true);
    try {
      const response = await searchAPI.globalSearch(searchQuery, type);
      setResults(response.data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search when params change
  useEffect(() => {
    const q = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    if (q) {
      setQuery(q);
      setSearchType(type);
      performSearch(q, type);
    }
  }, [searchParams, performSearch]);

  // Get suggestions as user types
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length >= 2) {
      try {
        const response = await searchAPI.getSuggestions(value);
        setSuggestions(response.data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Suggestions error:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query, type: searchType });
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'user') {
      window.location.href = `/profile/${suggestion.id}`;
    } else if (suggestion.type === 'hashtag') {
      setSearchParams({ q: suggestion.tag, type: 'hashtags' });
    }
    setShowSuggestions(false);
  };

  // Handle follow user
  const handleFollow = async (userId) => {
    try {
      await usersAPI.followUser(userId);
      // Update results
      setResults(prev => ({
        ...prev,
        users: {
          ...prev.users,
          items: prev.users.items.map(user =>
            user._id === userId ? { ...user, isFollowing: true } : user
          )
        }
      }));
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  // Handle friend request
  const handleFriendRequest = async (userId) => {
    try {
      await friendsAPI.sendRequest(userId);
      // Update results
      setResults(prev => ({
        ...prev,
        users: {
          ...prev.users,
          items: prev.users.items.map(user =>
            user._id === userId ? { ...user, requestSent: true } : user
          )
        }
      }));
    } catch (error) {
      console.error('Friend request error:', error);
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search users, posts, hashtags..."
              value={query}
              onChange={handleInputChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍 Search
            </button>

            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.type === 'user' ? (
                      <>
                        <img
                          src={suggestion.avatar || '/default-avatar.png'}
                          alt=""
                          className="suggestion-avatar"
                        />
                        <div className="suggestion-info">
                          <span className="suggestion-name">{suggestion.text}</span>
                          <span className="suggestion-username">@{suggestion.username}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="hashtag-icon">#</span>
                        <div className="suggestion-info">
                          <span className="suggestion-name">{suggestion.text}</span>
                          <span className="suggestion-count">{suggestion.count} posts</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="search-filters">
            <button
              type="button"
              className={`filter-btn ${searchType === 'all' ? 'active' : ''}`}
              onClick={() => { setSearchType('all'); if (query) setSearchParams({ q: query, type: 'all' }); }}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-btn ${searchType === 'users' ? 'active' : ''}`}
              onClick={() => { setSearchType('users'); if (query) setSearchParams({ q: query, type: 'users' }); }}
            >
              Users
            </button>
            <button
              type="button"
              className={`filter-btn ${searchType === 'posts' ? 'active' : ''}`}
              onClick={() => { setSearchType('posts'); if (query) setSearchParams({ q: query, type: 'posts' }); }}
            >
              Posts
            </button>
            <button
              type="button"
              className={`filter-btn ${searchType === 'hashtags' ? 'active' : ''}`}
              onClick={() => { setSearchType('hashtags'); if (query) setSearchParams({ q: query, type: 'hashtags' }); }}
            >
              Hashtags
            </button>
          </div>
        </form>
      </div>

      <div className="search-content">
        <div className="search-results">
          {loading ? (
            <div className="loading">Searching...</div>
          ) : (
            <>
              {/* Users Results */}
              {results.users && results.users.items.length > 0 && (
                <div className="results-section">
                  <h3>👥 Users ({results.users.total})</h3>
                  <div className="users-grid">
                    {results.users.items.map(user => (
                      <div key={user._id} className="user-card">
                        <Link to={`/profile/${user._id}`}>
                          <img
                            src={user.avatar || '/default-avatar.png'}
                            alt={user.username}
                            className="user-avatar"
                          />
                        </Link>
                        <div className="user-info">
                          <Link to={`/profile/${user._id}`} className="user-name">
                            {user.firstName} {user.lastName}
                          </Link>
                          <span className="user-username">@{user.username}</span>
                          {user.bio && <p className="user-bio">{user.bio}</p>}
                        </div>
                        <div className="user-actions">
                          {!user.isFollowing && !user.requestSent && (
                            <>
                              <button
                                onClick={() => handleFollow(user._id)}
                                className="follow-btn"
                              >
                                Follow
                              </button>
                              <button
                                onClick={() => handleFriendRequest(user._id)}
                                className="friend-btn"
                              >
                                Add Friend
                              </button>
                            </>
                          )}
                          {user.isFollowing && (
                            <span className="following-badge">Following</span>
                          )}
                          {user.requestSent && (
                            <span className="pending-badge">Request Sent</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Results */}
              {results.posts && results.posts.items.length > 0 && (
                <div className="results-section">
                  <h3>📝 Posts ({results.posts.total})</h3>
                  <div className="posts-list">
                    {results.posts.items.map(post => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags Results */}
              {results.hashtags && results.hashtags.items.length > 0 && (
                <div className="results-section">
                  <h3># Hashtags</h3>
                  <div className="hashtags-list">
                    {results.hashtags.items.map((hashtag, index) => (
                      <Link
                        key={index}
                        to={`/search?q=${hashtag.tag}&type=posts`}
                        className="hashtag-card"
                      >
                        <span className="hashtag-name">#{hashtag.tag}</span>
                        <span className="hashtag-count">{hashtag.count} posts</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {query && !loading &&
                (!results.users?.items.length && !results.posts?.items.length && !results.hashtags?.items.length) && (
                <div className="no-results">
                  <p>No results found for "{query}"</p>
                  <p>Try different keywords or check your spelling</p>
                </div>
              )}

              {/* Initial State - Show Trending */}
              {!query && (
                <div className="trending-section">
                  <h3>🔥 Trending Hashtags</h3>
                  <div className="trending-list">
                    {trending.map((item, index) => (
                      <Link
                        key={index}
                        to={`/search?q=${item.tag}&type=posts`}
                        className="trending-item"
                      >
                        <span className="trending-rank">#{index + 1}</span>
                        <div className="trending-info">
                          <span className="trending-tag">#{item.tag}</span>
                          <span className="trending-count">{item.count} posts</span>
                        </div>
                      </Link>
                    ))}
                    {trending.length === 0 && (
                      <p className="no-trending">No trending hashtags yet</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
