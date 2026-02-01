import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../services/api';
import { FiImage, FiVideo, FiMapPin, FiHash, FiBook, FiX } from 'react-icons/fi';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMoodleOptions, setShowMoodleOptions] = useState(false);
  const [moodleCourse, setMoodleCourse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const postData = {
        content: content.trim(),
        visibility: 'public'
      };

      if (moodleCourse) {
        postData.postType = 'moodle_course';
        postData.moodleCourseId = moodleCourse.id;
        postData.moodleCourseName = moodleCourse.name;
      }

      const response = await postsAPI.createPost(postData);
      setContent('');
      setMoodleCourse(null);
      if (onPostCreated) {
        onPostCreated(response.data.post);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    }

    setIsLoading(false);
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <div className="create-post-header">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.username} className="user-avatar" />
          ) : (
            <div className="user-avatar avatar-placeholder">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <textarea
            placeholder={`What's on your mind, ${user?.firstName || user?.username}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="post-textarea"
            rows={3}
          />
        </div>

        {moodleCourse && (
          <div className="selected-course">
            <FiBook />
            <span>{moodleCourse.name}</span>
            <button
              type="button"
              className="remove-course"
              onClick={() => setMoodleCourse(null)}
            >
              <FiX />
            </button>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <div className="create-post-footer">
          <div className="post-options">
            <button type="button" className="option-btn" title="Add Photo">
              <FiImage />
            </button>
            <button type="button" className="option-btn" title="Add Video">
              <FiVideo />
            </button>
            <button type="button" className="option-btn" title="Add Location">
              <FiMapPin />
            </button>
            <button type="button" className="option-btn" title="Add Tags">
              <FiHash />
            </button>
            {user?.moodleConnected && (
              <button
                type="button"
                className={`option-btn ${showMoodleOptions ? 'active' : ''}`}
                title="Link to Moodle Course"
                onClick={() => setShowMoodleOptions(!showMoodleOptions)}
              >
                <FiBook />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!content.trim() || isLoading}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
