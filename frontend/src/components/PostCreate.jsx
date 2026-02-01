import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPost } from '../store/postsSlice';
import './PostCreate.css';

function PostCreate() {
  const dispatch = useDispatch();
  const [content, setContent] = useState('');
  const [syncToMoodle, setSyncToMoodle] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    const result = await dispatch(createPost({
      content,
      syncToMoodle,
      visibility: 'public',
      type: 'post'
    }));

    if (result.success) {
      setContent('');
      setSyncToMoodle(false);
    }
  };

  return (
    <div className="post-create card">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
        />
        <div className="post-create-actions">
          <label className="sync-checkbox">
            <input
              type="checkbox"
              checked={syncToMoodle}
              onChange={(e) => setSyncToMoodle(e.target.checked)}
            />
            Sync to Moodle
          </label>
          <button type="submit" className="btn btn-primary">
            Post
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostCreate;
