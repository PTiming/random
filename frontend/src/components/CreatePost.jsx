import { useState } from 'react';
import { postService } from '../services/api';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await postService.createPost({ content, image });
      setContent('');
      setImage('');
      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    }

    setLoading(false);
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={500}
          rows={3}
        />
        <div className="create-post-footer">
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Image URL (optional)"
          />
          <button type="submit" disabled={loading || !content.trim()}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        <span className="char-count">{content.length}/500</span>
      </form>
    </div>
  );
};

export default CreatePost;
