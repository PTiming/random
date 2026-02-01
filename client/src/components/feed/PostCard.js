import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal,
  FiEdit2, FiTrash2, FiFlag, FiSend
} from 'react-icons/fi';
import './Feed.css';

const PostCard = ({ post, currentUserId, onDelete, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const [submitting, setSubmitting] = useState(false);

  const isAuthor = currentUserId === localPost.author?._id;

  const handleReaction = async () => {
    try {
      if (localPost.hasReacted) {
        await postsAPI.unreact(localPost._id);
        setLocalPost(prev => ({
          ...prev,
          hasReacted: false,
          reactionsCount: prev.reactionsCount - 1
        }));
      } else {
        await postsAPI.react(localPost._id, 'like');
        setLocalPost(prev => ({
          ...prev,
          hasReacted: true,
          userReaction: 'like',
          reactionsCount: prev.reactionsCount + 1
        }));
      }
    } catch (error) {
      console.error('Reaction error:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await postsAPI.addComment(localPost._id, commentText);
      setLocalPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), response.data.data.comment],
        commentsCount: (prev.commentsCount || 0) + 1
      }));
      setCommentText('');
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await postsAPI.delete(localPost._id);
      onDelete?.(localPost._id);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="post-card card">
      {/* Post Header */}
      <div className="post-header">
        <Link to={`/profile/${localPost.author?._id}`} className="post-author">
          {localPost.author?.avatar ? (
            <img src={localPost.author.avatar} alt="" className="avatar" />
          ) : (
            <div className="avatar">
              {localPost.author?.firstName?.[0]}{localPost.author?.lastName?.[0]}
            </div>
          )}
          <div className="author-info">
            <span className="author-name">
              {localPost.author?.firstName} {localPost.author?.lastName}
            </span>
            <span className="post-time">
              {formatDistanceToNow(new Date(localPost.createdAt), { addSuffix: true })}
              {localPost.isEdited && ' • Edited'}
            </span>
          </div>
        </Link>

        <div className="post-menu-wrapper">
          <button 
            className="menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <FiMoreHorizontal />
          </button>
          {showMenu && (
            <div className="post-menu" onMouseLeave={() => setShowMenu(false)}>
              {isAuthor ? (
                <>
                  <button><FiEdit2 /> Edit</button>
                  <button onClick={handleDelete} className="danger">
                    <FiTrash2 /> Delete
                  </button>
                </>
              ) : (
                <button><FiFlag /> Report</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="post-content">
        <p>{localPost.content}</p>
        
        {localPost.tags?.length > 0 && (
          <div className="post-tags">
            {localPost.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="post-stats">
        {localPost.reactionsCount > 0 && (
          <span>{localPost.reactionsCount} reaction{localPost.reactionsCount !== 1 ? 's' : ''}</span>
        )}
        {localPost.commentsCount > 0 && (
          <span>{localPost.commentsCount} comment{localPost.commentsCount !== 1 ? 's' : ''}</span>
        )}
        {localPost.sharesCount > 0 && (
          <span>{localPost.sharesCount} share{localPost.sharesCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Post Actions */}
      <div className="post-actions-bar">
        <button 
          className={`action-btn ${localPost.hasReacted ? 'active' : ''}`}
          onClick={handleReaction}
        >
          <FiHeart className={localPost.hasReacted ? 'filled' : ''} />
          <span>Like</span>
        </button>
        <button 
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <FiMessageCircle />
          <span>Comment</span>
        </button>
        <button className="action-btn">
          <FiShare2 />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="comment-input"
            />
            <button 
              type="submit" 
              className="comment-submit"
              disabled={!commentText.trim() || submitting}
            >
              <FiSend />
            </button>
          </form>

          {localPost.comments?.map(comment => (
            <div key={comment._id} className="comment">
              <Link to={`/profile/${comment.author?._id}`}>
                {comment.author?.avatar ? (
                  <img src={comment.author.avatar} alt="" className="avatar avatar-sm" />
                ) : (
                  <div className="avatar avatar-sm">
                    {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                  </div>
                )}
              </Link>
              <div className="comment-content">
                <div className="comment-bubble">
                  <Link to={`/profile/${comment.author?._id}`} className="comment-author">
                    {comment.author?.firstName} {comment.author?.lastName}
                  </Link>
                  <p>{comment.content}</p>
                </div>
                <span className="comment-time">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCard;
