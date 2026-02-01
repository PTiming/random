import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/posts', { content });
      onPostCreated(res.data);
      setContent('');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <textarea
            placeholder={`What's on your mind, ${user?.name}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="3"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
