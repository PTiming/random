import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed } from '../store/postsSlice';
import PostCreate from '../components/PostCreate';
import PostCard from '../components/PostCard';
import './Feed.css';

function Feed() {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector(state => state.posts);

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  return (
    <div className="feed-container container">
      <div className="feed-main">
        <PostCreate />
        
        {loading && <div className="loading">Loading posts...</div>}
        
        {!loading && posts.length === 0 && (
          <div className="no-posts card">
            <p>No posts yet. Create the first post!</p>
          </div>
        )}

        {posts.map(post => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Feed;
