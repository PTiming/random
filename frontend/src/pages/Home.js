import React, { useState, useEffect, useCallback } from 'react';
import { postsAPI } from '../services/api';
import CreatePost from '../components/Post/CreatePost';
import PostCard from '../components/Post/PostCard';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await postsAPI.getFeed({ page: pageNum, limit: 10 });
      const { posts: newPosts, pagination } = response.data;

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(pagination.current < pagination.pages);
      setError('');
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      console.error('Error fetching posts:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  return (
    <div className="home-page">
      <div className="feed-container">
        <CreatePost onPostCreated={handlePostCreated} />

        {error && <div className="alert alert-error">{error}</div>}

        <div className="posts-feed">
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handlePostDeleted}
            />
          ))}

          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading posts...</p>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3 className="empty-state-title">No posts yet</h3>
              <p className="empty-state-text">
                Be the first to share something! Or connect with friends to see their posts.
              </p>
            </div>
          )}

          {!loading && hasMore && posts.length > 0 && (
            <button className="btn btn-secondary btn-block" onClick={loadMore}>
              Load More
            </button>
          )}
        </div>
      </div>

      <div className="sidebar-right">
        <div className="card">
          <div className="card-header">
            <h3>Suggested Friends</h3>
          </div>
          <div className="card-body">
            <p className="text-muted text-sm">
              Connect with classmates and colleagues to expand your network.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Trending Topics</h3>
          </div>
          <div className="card-body">
            <div className="trending-list">
              <div className="trending-item">
                <span className="trending-tag">#StudyTips</span>
                <span className="trending-count">128 posts</span>
              </div>
              <div className="trending-item">
                <span className="trending-tag">#ExamPrep</span>
                <span className="trending-count">95 posts</span>
              </div>
              <div className="trending-item">
                <span className="trending-tag">#Programming</span>
                <span className="trending-count">76 posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
