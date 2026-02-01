import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const Post = ({ post, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { user } = useContext(AuthContext);

  const handleLike = async () => {
    try {
      const res = await axios.put(`/api/posts/${post._id}/like`);
      onUpdate(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(`/api/posts/${post._id}/comments`, { text: commentText });
      onUpdate(res.data);
      setCommentText('');
      setShowComments(true);
    } catch (err) {
      console.error(err);
    }
  };

  const isLiked = post.likes?.includes(user?.id);
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar">
          {post.user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="post-info">
          <h4>{post.user?.name}</h4>
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </div>
      
      <div className="post-content">
        {post.content}
      </div>
      
      <div className="post-actions">
        <div className={`post-action ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          👍 {post.likes?.length || 0} {isLiked ? 'Liked' : 'Like'}
        </div>
        <div className="post-action" onClick={() => setShowComments(!showComments)}>
          💬 {post.comments?.length || 0} Comment{post.comments?.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {showComments && (
        <div className="comments-section">
          {post.comments?.map((comment, index) => (
            <div key={index} className="comment">
              <div className="comment-avatar">
                {comment.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="comment-content">
                <div className="comment-author">{comment.user?.name}</div>
                <div className="comment-text">{comment.text}</div>
              </div>
            </div>
          ))}
          
          <form onSubmit={handleComment} style={{ marginTop: '10px' }}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Post;
