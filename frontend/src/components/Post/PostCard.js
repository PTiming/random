import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiTrash2, FiEdit2, FiBook } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../services/api';
import './PostCard.css';

const PostCard = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(
    post.likes?.some(like => like.user === user?.id || like.user?._id === user?.id)
  );
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthor = user?.id === post.author?._id || user?.id === post.author?.id;

  const handleLike = async () => {
    try {
      const response = await postsAPI.likePost(post._id);
      setIsLiked(response.data.isLiked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsLoading(true);
    try {
      const response = await postsAPI.addComment(post._id, { content: commentText });
      setComments([...comments, response.data.comment]);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsAPI.deletePost(post._id);
      if (onDelete) onDelete(post._id);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const getMoodleBadge = () => {
    if (!post.moodleCourseName) return null;
    return (
      <span className="moodle-badge">
        <FiBook /> {post.moodleCourseName}
      </span>
    );
  };

  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <Link to={`/profile/${post.author?._id}`} className="post-author">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt={post.author.username} className="author-avatar" />
          ) : (
            <div className="author-avatar avatar-placeholder">
              {post.author?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="author-info">
            <h4 className="author-name">
              {post.author?.firstName && post.author?.lastName
                ? `${post.author.firstName} ${post.author.lastName}`
                : post.author?.username}
            </h4>
            <div className="post-meta">
              <span className="post-time">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              {post.isEdited && <span className="edited-badge">• Edited</span>}
              {getMoodleBadge()}
            </div>
          </div>
        </Link>

        {isAuthor && (
          <div className="post-menu">
            <button
              className="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              <FiMoreHorizontal />
            </button>
            {showMenu && (
              <div className="dropdown-menu show">
                <button className="dropdown-item">
                  <FiEdit2 /> Edit
                </button>
                <button className="dropdown-item danger" onClick={handleDelete}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="post-content">
        <p>{post.content}</p>
        {post.images?.length > 0 && (
          <div className="post-images">
            {post.images.map((image, index) => (
              <img key={index} src={image.url} alt="" className="post-image" />
            ))}
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="post-stats">
        {likesCount > 0 && (
          <span className="stat">{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
        )}
        {comments.length > 0 && (
          <span className="stat">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
        )}
      </div>

      {/* Post Actions */}
      <div className="post-actions">
        <button
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <FiHeart className={isLiked ? 'filled' : ''} />
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
        <div className="post-comments">
          {/* Comment Form */}
          <form className="comment-form" onSubmit={handleComment}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username} className="comment-avatar" />
            ) : (
              <div className="comment-avatar avatar-placeholder">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="comment-input"
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!commentText.trim() || isLoading}
            >
              Post
            </button>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="comment">
                <Link to={`/profile/${comment.author?._id}`}>
                  {comment.author?.avatar ? (
                    <img src={comment.author.avatar} alt={comment.author.username} className="comment-avatar" />
                  ) : (
                    <div className="comment-avatar avatar-placeholder">
                      {comment.author?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="comment-content">
                  <div className="comment-bubble">
                    <Link to={`/profile/${comment.author?._id}`} className="comment-author">
                      {comment.author?.firstName && comment.author?.lastName
                        ? `${comment.author.firstName} ${comment.author.lastName}`
                        : comment.author?.username}
                    </Link>
                    <p>{comment.content}</p>
                  </div>
                  <div className="comment-meta">
                    <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    <button className="comment-action">Like</button>
                    <button className="comment-action">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
