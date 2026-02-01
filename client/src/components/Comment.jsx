import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

function Comment({ comment }) {
  return (
    <div className="comment">
      <Link to={`/profile/${comment.author?._id}`} className="comment-author">
        <div className="avatar small">
          {comment.author?.avatar ? (
            <img src={comment.author.avatar} alt={comment.author?.username} />
          ) : (
            <span>{comment.author?.username?.charAt(0).toUpperCase()}</span>
          )}
        </div>
      </Link>
      <div className="comment-body">
        <div className="comment-content">
          <Link to={`/profile/${comment.author?._id}`} className="username">
            {comment.author?.username}
          </Link>
          <p>{comment.content}</p>
        </div>
        <span className="timestamp">
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

export default Comment;
