import React, { useState } from 'react';
import api from '../utils/api';

function Post({ post, onUpdate }) {
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState('');

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${post._id}/like`);
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) return;

    try {
      const response = await api.post(`/posts/${post._id}/comment`, { text: comment });
      setComment('');
      setCommenting(false);
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Failed to comment:', error);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  return (
    <div className="post">
      <div className="post-header">
        <div className="avatar">
          {post.author?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="post-author">{post.author?.name}</div>
          <div className="post-time">{formatDate(post.createdAt)}</div>
        </div>
      </div>
      
      <div className="post-content">{post.content}</div>
      
      {post.image && (
        <img 
          src={post.image} 
          alt="Post" 
          style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '15px' }} 
        />
      )}
      
      <div className="post-actions">
        <button className="post-action-btn" onClick={handleLike}>
          👍 Like ({post.likes?.length || 0})
        </button>
        <button className="post-action-btn" onClick={() => setCommenting(!commenting)}>
          💬 Comment ({post.comments?.length || 0})
        </button>
      </div>
      
      {post.comments?.length > 0 && (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e4e6eb' }}>
          {post.comments.map((comment, index) => (
            <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
              <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                {comment.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, backgroundColor: '#f0f2f5', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontWeight: '500', fontSize: '13px' }}>{comment.user?.name}</div>
                <div style={{ fontSize: '14px' }}>{comment.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {commenting && (
        <form onSubmit={handleComment} style={{ marginTop: '15px' }}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginRight: '10px' }}>
            Post Comment
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setCommenting(false)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default Post;
