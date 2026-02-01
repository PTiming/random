import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import Comment from './Comment';
import api from '../utils/api';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';

function Post({ post }) {
  const { user } = useAuthStore();
  const { likePost, deletePost, addComment } = usePostStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [submitting, setSubmitting] = useState(false);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    await likePost(post._id);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(post._id);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/comments/${post._id}`, { content: commentText });
      addComment(post._id, res.data);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setSubmitting(false);
  };

  return (
    <div className="post">
      <div className="post-header">
        <Link to={`/profile/${post.author?._id}`} className="post-author">
          <div className="avatar">
            {post.author?.avatar ? (
              <img src={post.author.avatar} alt={post.author?.username} />
            ) : (
              <span>{post.author?.username?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="author-info">
            <span className="username">{post.author?.username}</span>
            <span className="timestamp">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </Link>
        {user?._id === post.author?._id && (
          <button onClick={handleDelete} className="btn-icon delete-btn">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.image && <img src={post.image} alt="Post" className="post-image" />}
      </div>

      <div className="post-actions">
        <button onClick={handleLike} className={`action-btn ${isLiked ? 'liked' : ''}`}>
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{likesCount}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="action-btn">
          <MessageCircle size={18} />
          <span>{post.comments?.length || 0}</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" disabled={!commentText.trim() || submitting}>
              <Send size={16} />
            </button>
          </form>
          <div className="comments-list">
            {post.comments?.map((comment) => (
              <Comment key={comment._id} comment={comment} postId={post._id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;
