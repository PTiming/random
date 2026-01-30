import React, { useState } from 'react';
import { createPost } from '../services/api';

function CreatePost({ user, onPostCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createPost({ content });
      setContent('');
      setShowModal(false);
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  return (
    <>
      <div className="create-post">
        <div className="create-post-input">
          <img
            src={user?.avatar || 'https://via.placeholder.com/40'}
            alt="Your avatar"
            className="post-avatar"
          />
          <input
            type="text"
            placeholder={`What's on your mind, ${user?.username}?`}
            onClick={() => setShowModal(true)}
            readOnly
          />
        </div>
        <div className="create-post-divider"></div>
        <div className="create-post-actions">
          <button className="create-post-btn">
            📷 Photo/Video
          </button>
          <button className="create-post-btn">
            😊 Feeling/Activity
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Post</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <img
                  src={user?.avatar || 'https://via.placeholder.com/40'}
                  alt="Your avatar"
                  className="post-avatar"
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{user?.username}</div>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <textarea
                  className="modal-textarea"
                  placeholder={`What's on your mind, ${user?.username}?`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  autoFocus
                />
                <div className="modal-footer">
                  <button type="submit" className="auth-btn" style={{ width: '100%' }}>
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePost;
