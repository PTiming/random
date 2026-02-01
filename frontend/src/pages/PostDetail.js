import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import PostCard from '../components/Post/PostCard';
import { FiArrowLeft } from 'react-icons/fi';
import './PostDetail.css';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await postsAPI.getPost(postId);
        setPost(response.data);
      } catch (err) {
        setError('Post not found or has been deleted.');
        console.error('Error fetching post:', err);
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  const handlePostDelete = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-page">
        <div className="empty-state">
          <h3>Post not found</h3>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">
            <FiArrowLeft /> Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <div className="post-detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        <h1>Post</h1>
      </div>

      <div className="post-container">
        <PostCard post={post} onDelete={handlePostDelete} />
      </div>
    </div>
  );
};

export default PostDetail;
