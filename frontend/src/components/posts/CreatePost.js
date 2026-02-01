import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/helpers';
import api from '../../utils/api';
import './Posts.css';

const CreatePost = ({ onPostCreated, courseId = null }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please write something');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const postData = { content };
      if (courseId) {
        postData.course = courseId;
        postData.postType = 'course';
      }

      const res = await api.post('/posts', postData);
      
      if (res.data.success) {
        setContent('');
        if (onPostCreated) {
          onPostCreated(res.data.post);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post card">
      <form onSubmit={handleSubmit}>
        <div className="create-post-header">
          <img
            src={getAvatarUrl(user?.avatar, user?.name)}
            alt={user?.name}
            className="avatar"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
            className="create-post-input"
            rows={3}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="create-post-actions">
          <div className="post-options">
            <button type="button" className="option-btn" title="Add Photo">
              📷 Photo
            </button>
            <button type="button" className="option-btn" title="Add Video">
              🎥 Video
            </button>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !content.trim()}
          >
            {loading ? <span className="spinner"></span> : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
