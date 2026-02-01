import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl, formatRelativeTime } from '../../utils/helpers';
import api from '../../utils/api';
import './Posts.css';

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(
    post.likes?.some(like => like.user === user?._id || like.user?._id === user?._id)
  );
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const isOwner = user?._id === post.user?._id;

  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/${post._id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/posts/${post._id}/comments`, {
        content: newComment
      });
      setComments([...comments, res.data.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      const res = await api.put(`/posts/${post._id}`, {
        content: editContent
      });
      setIsEditing(false);
      if (onUpdate) onUpdate(res.data.post);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <div className="post-card card">
      <div className="post-header">
        <Link to={`/profile/${post.user?._id}`} className="post-author">
          <img
            src={getAvatarUrl(post.user?.avatar, post.user?.name)}
            alt={post.user?.name}
            className="avatar"
          />
          <div className="author-info">
            <span className="author-name">{post.user?.name}</span>
            <span className="post-time">
              {formatRelativeTime(post.createdAt)}
              {post.isEdited && ' · Edited'}
            </span>
          </div>
        </Link>

        {isOwner && (
          <div className="post-menu">
            <button
              className="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              ⋮
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                  ✏️ Edit
                </button>
                <button onClick={handleDelete} className="danger">
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-content">
        {isEditing ? (
          <div className="edit-form">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="form-input form-textarea"
            />
            <div className="edit-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setIsEditing(false); setEditContent(post.content); }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleEdit}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p>{post.content}</p>
        )}

        {post.images && post.images.length > 0 && (
          <div className="post-images">
            {post.images.map((image, index) => (
              <img key={index} src={image} alt="Post" />
            ))}
          </div>
        )}
      </div>

      {post.course && (
        <Link to={`/courses/${post.course._id}`} className="post-course-tag">
          📖 {post.course.title || post.course.shortName}
        </Link>
      )}

      <div className="post-stats">
        {likeCount > 0 && (
          <span className="stat">👍 {likeCount}</span>
        )}
        {comments.length > 0 && (
          <span className="stat">{comments.length} comments</span>
        )}
      </div>

      <div className="post-actions">
        <button
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {liked ? '👍' : '👍'} Like
        </button>
        <button
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 Comment
        </button>
        <button className="action-btn">
          ↗️ Share
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {comments.map((comment, index) => (
            <div key={comment._id || index} className="comment">
              <img
                src={getAvatarUrl(comment.user?.avatar, comment.user?.name)}
                alt={comment.user?.name}
                className="avatar avatar-sm"
              />
              <div className="comment-content">
                <div className="comment-bubble">
                  <Link to={`/profile/${comment.user?._id}`} className="comment-author">
                    {comment.user?.name}
                  </Link>
                  <p>{comment.content}</p>
                </div>
                <span className="comment-time">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
            </div>
          ))}

          <form onSubmit={handleComment} className="comment-form">
            <img
              src={getAvatarUrl(user?.avatar, user?.name)}
              alt={user?.name}
              className="avatar avatar-sm"
            />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
            />
            <button type="submit" className="comment-submit" disabled={!newComment.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
