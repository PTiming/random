import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/api';
import './Post.css';

const Post = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);

  const isLiked = user && likes.some(like => 
    (typeof like === 'string' ? like : like._id || like) === (user.id || user._id)
  );
  const isAuthor = user && (post.author._id || post.author) === (user.id || user._id);

  const handleLike = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (isLiked) {
        await postService.unlikePost(post._id);
        setLikes(likes.filter(like => 
          (typeof like === 'string' ? like : like._id || like) !== (user.id || user._id)
        ));
      } else {
        await postService.likePost(post._id);
        setLikes([...likes, user.id || user._id]);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
    setLoading(false);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    setLoading(true);
    try {
      const response = await postService.addComment(post._id, commentText);
      setComments([...comments, response.data]);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setLoading(false);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postService.deleteComment(post._id, commentId);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(post._id);
        if (onDelete) onDelete(post._id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="post">
      <div className="post-header">
        <Link to={`/profile/${post.author._id || post.author}`} className="post-author">
          <div className="author-avatar">
            {post.author.profilePicture ? (
              <img src={post.author.profilePicture} alt={post.author.username} />
            ) : (
              <span>{post.author.username?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="author-info">
            <span className="author-name">{post.author.username}</span>
            <span className="post-date">{formatDate(post.createdAt)}</span>
          </div>
        </Link>
        {isAuthor && (
          <button className="delete-btn" onClick={handleDeletePost}>
            Delete
          </button>
        )}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.image && <img src={post.image} alt="Post" className="post-image" />}
      </div>

      <div className="post-actions">
        <button 
          className={`action-btn ${isLiked ? 'liked' : ''}`} 
          onClick={handleLike}
          disabled={loading || !user}
        >
          ❤️ {likes.length}
        </button>
        <button 
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {comments.length}
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {user && (
            <form onSubmit={handleComment} className="comment-form">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                maxLength={300}
              />
              <button type="submit" disabled={loading || !commentText.trim()}>
                Post
              </button>
            </form>
          )}
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="comment">
                <Link to={`/profile/${comment.user._id || comment.user}`} className="comment-author">
                  {comment.user.username || 'User'}
                </Link>
                <p className="comment-text">{comment.text}</p>
                {user && (comment.user._id === (user.id || user._id) || isAuthor) && (
                  <button 
                    className="comment-delete"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
