import { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/api';
import Post from '../components/Post';
import './Explore.css';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await postService.getExplorePosts(pageNum);
      if (pageNum === 1) {
        setPosts(response.data.posts);
      } else {
        setPosts(prev => [...prev, ...response.data.posts]);
      }
      setHasMore(pageNum < response.data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  return (
    <div className="explore-page">
      <div className="explore-container">
        <h1>Explore</h1>
        <p className="explore-subtitle">Discover posts from all users</p>

        {loading && posts.length === 0 ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet. Be the first to create one!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <Post 
                key={post._id} 
                post={post} 
                onDelete={handlePostDeleted}
              />
            ))}
            {hasMore && (
              <button 
                className="load-more-btn" 
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
