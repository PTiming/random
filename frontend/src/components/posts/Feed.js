import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import './Posts.css';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/posts?page=${pageNum}&limit=10`);
      
      if (pageNum === 1) {
        setPosts(res.data.posts);
      } else {
        setPosts(prev => [...prev, ...res.data.posts]);
      }
      
      setHasMore(res.data.pagination.page < res.data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  return (
    <div className="two-column-layout">
      <div className="main-column">
        <CreatePost onPostCreated={handlePostCreated} />
        
        <div className="posts-list">
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handlePostDeleted}
              onUpdate={handlePostUpdated}
            />
          ))}
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner spinner-dark"></div>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="empty-state card">
            <div className="empty-state-icon">📝</div>
            <h3 className="empty-state-title">No posts yet</h3>
            <p>Be the first to share something!</p>
          </div>
        )}

        {hasMore && !loading && (
          <button
            onClick={loadMore}
            className="btn btn-secondary btn-block load-more-btn"
          >
            Load More
          </button>
        )}
      </div>

      <div className="sidebar-column">
        <div className="sidebar-card card">
          <h3>Quick Links</h3>
          <ul className="quick-links">
            <li><a href="/courses">📖 My Courses</a></li>
            <li><a href="/moodle/connect">🔗 Moodle Connection</a></li>
            <li><a href="/profile/edit">⚙️ Settings</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Feed;
