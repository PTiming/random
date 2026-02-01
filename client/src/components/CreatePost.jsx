import { useState } from 'react';
import { usePostStore } from '../store/postStore';
import { Send, Image } from 'lucide-react';

function CreatePost() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { createPost } = usePostStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const result = await createPost(content);
    setLoading(false);

    if (result.success) {
      setContent('');
    }
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={5000}
        />
        <div className="create-post-actions">
          <button type="button" className="btn-icon" title="Add image">
            <Image size={20} />
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!content.trim() || loading}
          >
            {loading ? 'Posting...' : <><Send size={16} /> Post</>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
