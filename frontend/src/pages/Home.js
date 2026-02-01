import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNewsFeed, createPost } from '../redux/slices/postSlice';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch();
  const { posts, isLoading } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);
  
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    dispatch(getNewsFeed());
  }, [dispatch]);

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (postContent.trim()) {
      dispatch(createPost({ content: postContent }));
      setPostContent('');
    }
  };

  return (
    <div className="container">
      <div className="home-layout">
        <div className="main-content">
          {/* Create Post */}
          <div className="card create-post">
            <h3>What's on your mind, {user?.firstName}?</h3>
            <form onSubmit={handleSubmitPost}>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows="3"
              />
              <button type="submit" className="btn btn-primary">
                Post
              </button>
            </form>
          </div>

          {/* News Feed */}
          <div className="news-feed">
            <h2>News Feed</h2>
            {isLoading ? (
              <p>Loading...</p>
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id} className="card post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <img
                        src={post.author?.avatar || '/default-avatar.png'}
                        alt={post.author?.username}
                        className="avatar"
                      />
                      <div>
                        <h4>
                          {post.author?.firstName} {post.author?.lastName}
                        </h4>
                        <p className="post-time">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="post-content">
                    <p>{post.content}</p>
                  </div>
                  <div className="post-actions">
                    <button className="btn btn-secondary">
                      👍 Like ({post.likes?.length || 0})
                    </button>
                    <button className="btn btn-secondary">
                      💬 Comment ({post.comments?.length || 0})
                    </button>
                    <button className="btn btn-secondary">
                      🔗 Share
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No posts yet. Be the first to share something!</p>
            )}
          </div>
        </div>

        <div className="sidebar">
          <div className="card">
            <h3>Your Courses</h3>
            <p>Sync with Moodle to see your courses here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
