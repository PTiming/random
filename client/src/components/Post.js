import React, { useState } from 'react';
import { likePost, addComment } from '../services/api';

function Post({ post, onUpdate }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localPost, setLocalPost] = useState(post);

  const handleLike = async () => {
    try {
      const { data } = await likePost(localPost._id);
      setLocalPost(data);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const { data } = await addComment(localPost._id, commentText);
      setLocalPost(data);
      setCommentText('');
      setShowComments(true);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const currentUserId = localStorage.getItem('userId');
  const isLiked = localPost.likes?.includes(currentUserId);

  return (
    <div className="post">
      <div className="post-header">
        <img
          src={localPost.user?.avatar || 'https://via.placeholder.com/40'}
          alt={localPost.user?.username}
          className="post-avatar"
        />
        <div className="post-info">
          <div className="post-author">{localPost.user?.username}</div>
          <div className="post-time">{timeAgo(localPost.createdAt)}</div>
        </div>
      </div>

      <div className="post-content">{localPost.content}</div>

      {localPost.image && (
        <img src={localPost.image} alt="Post" className="post-image" />
      )}

      <div className="post-stats">
        <span className="post-stats-item">
          {localPost.likes?.length || 0} {localPost.likes?.length === 1 ? 'Like' : 'Likes'}
        </span>
        <span className="post-stats-item" onClick={() => setShowComments(!showComments)}>
          {localPost.comments?.length || 0} {localPost.comments?.length === 1 ? 'Comment' : 'Comments'}
        </span>
      </div>

      <div className="post-actions">
        <button
          className={`post-action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          👍 Like
        </button>
        <button
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 Comment
        </button>
        <button className="post-action-btn">↗️ Share</button>
      </div>

      {showComments && (
        <div className="post-comments">
          {localPost.comments?.map((comment, index) => (
            <div key={index} className="post-comment">
              <img
                src={comment.user?.avatar || 'https://via.placeholder.com/32'}
                alt={comment.user?.username}
                className="comment-avatar"
              />
              <div className="comment-content">
                <div className="comment-author">{comment.user?.username}</div>
                <div className="comment-text">{comment.text}</div>
              </div>
            </div>
          ))}

          <form onSubmit={handleComment} className="comment-input-wrapper">
            <img
              src="https://via.placeholder.com/32"
              alt="Your avatar"
              className="comment-avatar"
            />
            <input
              type="text"
              placeholder="Write a comment..."
              className="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </form>
        </div>
      )}
    </div>
  );
}

export default Post;
