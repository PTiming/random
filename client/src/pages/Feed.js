import React, { useState, useEffect, useCallback } from 'react';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/feed/PostCard';
import CreatePost from '../components/feed/CreatePost';
import { FiRefreshCw } from 'react-icons/fi';
import './Feed.css';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum = 1, filterType = filter) => {
    try {
      setLoading(pageNum === 1);
      const response = await postsAPI.getFeed({ 
        page: pageNum, 
        limit: 10,
        filter: filterType === 'all' ? undefined : filterType
      });
      
      const { posts: newPosts, pagination } = response.data.data;
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(pageNum < pagination.pages);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts(1, filter);
    setPage(1);
  }, [filter, fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, filter);
  };

  const refresh = () => {
    setPage(1);
    fetchPosts(1, filter);
  };

  return (
    <div className="feed-page">
      <div className="feed-main">
        <div className="feed-header">
          <h1>News Feed</h1>
          <button onClick={refresh} className="btn btn-outline btn-sm" disabled={loading}>
            <FiRefreshCw className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="feed-filters">
          {['all', 'connections', 'following', 'mine'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Posts' : 
               f === 'mine' ? 'My Posts' : 
               f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <CreatePost onPostCreated={handlePostCreated} />

        <div className="posts-list">
          {loading && posts.length === 0 ? (
            <div className="loading-posts">
              <div className="spinner"></div>
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-icon">📝</p>
              <h3>No posts yet</h3>
              <p>Be the first to share something!</p>
            </div>
          ) : (
            <>
              {posts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post}
                  currentUserId={user?._id}
                  onDelete={handlePostDeleted}
                  onUpdate={handlePostUpdated}
                />
              ))}
              
              {hasMore && (
                <button 
                  onClick={loadMore} 
                  className="btn btn-secondary load-more-btn"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <aside className="feed-sidebar">
        <div className="card">
          <h3>Quick Links</h3>
          <ul className="quick-links">
            <li><a href="/moodle">📚 My Courses</a></li>
            <li><a href="/groups">👥 My Groups</a></li>
            <li><a href="/messages">💬 Messages</a></li>
            <li><a href={`/profile/${user?._id}`}>👤 My Profile</a></li>
          </ul>
        </div>

        <div className="card">
          <h3>Upcoming Deadlines</h3>
          <p className="text-muted text-sm">
            Connect your Moodle account to see deadlines here.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default Feed;
