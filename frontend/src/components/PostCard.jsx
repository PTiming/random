import React from 'react';
import { useDispatch } from 'react-redux';
import { likePost } from '../store/postsSlice';
import './PostCard.css';

function PostCard({ post }) {
  const dispatch = useDispatch();

  const handleLike = () => {
    dispatch(likePost(post._id));
  };

  return (
    <div className="post-card card">
      <div className="post-header">
        <img 
          src={post.author?.profilePicture || '/default-avatar.png'} 
          alt={post.author?.username}
          className="post-avatar"
        />
        <div className="post-author-info">
          <h4>{post.author?.firstName} {post.author?.lastName}</h4>
          <span className="post-time">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
        {post.course && (
          <div className="post-course-tag">
            📚 {post.course.name}
          </div>
        )}
        {post.syncedToMoodle && (
          <div className="moodle-badge">
            ✓ Synced to Moodle
          </div>
        )}
      </div>

      <div className="post-stats">
        <span>{post.likes?.length || 0} likes</span>
        <span>{post.comments?.length || 0} comments</span>
      </div>

      <div className="post-actions">
        <button onClick={handleLike} className="btn btn-secondary">
          👍 Like
        </button>
        <button className="btn btn-secondary">
          💬 Comment
        </button>
        <button className="btn btn-secondary">
          📤 Share
        </button>
      </div>
    </div>
  );
}

export default PostCard;
