import React, { useState } from 'react';
import { postsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FiImage, FiLink, FiHash, FiSend, FiX } from 'react-icons/fi';
import './Feed.css';

const CreatePost = ({ onPostCreated, groupId = null }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const postData = {
        content,
        tags,
        visibility: groupId ? 'group' : 'public',
        group: groupId
      };

      const response = await postsAPI.create(postData);
      onPostCreated(response.data.data.post);
      setContent('');
      setTags([]);
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="create-post card">
      <div className="create-post-header">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="avatar" />
        ) : (
          <div className="avatar">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        )}
        <input
          type="text"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className="create-post-input"
        />
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="create-post-expanded">
          <textarea
            placeholder="Share something with your network..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="create-post-textarea"
            rows="4"
            autoFocus
          />

          {tags.length > 0 && (
            <div className="post-tags">
              {tags.map(tag => (
                <span key={tag} className="post-tag">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <FiX />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="create-post-footer">
            <div className="post-actions">
              <button type="button" className="action-btn" title="Add image">
                <FiImage />
              </button>
              <button type="button" className="action-btn" title="Add link">
                <FiLink />
              </button>
              <div className="tag-input-wrapper">
                <FiHash />
                <input
                  type="text"
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTagAdd(e)}
                  className="tag-input"
                />
              </div>
            </div>
            <div className="post-submit">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setIsExpanded(false);
                  setContent('');
                  setTags([]);
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary btn-sm"
                disabled={!content.trim() || loading}
              >
                <FiSend />
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreatePost;
