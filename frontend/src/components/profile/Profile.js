import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl, formatDate } from '../../utils/helpers';
import api from '../../utils/api';
import PostCard from '../posts/PostCard';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      setUser(res.data.user);
      setIsFollowing(res.data.user.followers?.some(
        f => f._id === currentUser?._id || f === currentUser?._id
      ));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await api.get(`/posts/user/${id}`);
      setPosts(res.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/users/${id}/follow`);
        setIsFollowing(false);
        setUser(prev => ({
          ...prev,
          followers: prev.followers.filter(f => f._id !== currentUser._id)
        }));
      } else {
        await api.post(`/users/${id}/follow`);
        setIsFollowing(true);
        setUser(prev => ({
          ...prev,
          followers: [...prev.followers, currentUser]
        }));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-dark"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-state card">
          <h3>User not found</h3>
          <p>This profile doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header card">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <img
            src={getAvatarUrl(user.avatar, user.name)}
            alt={user.name}
            className="profile-avatar avatar-xl"
          />
          <div className="profile-details">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-bio">{user.bio || 'No bio yet'}</p>
            <div className="profile-meta">
              {user.location && (
                <span className="meta-item">📍 {user.location}</span>
              )}
              {user.website && (
                <a href={user.website} className="meta-item" target="_blank" rel="noopener noreferrer">
                  🔗 Website
                </a>
              )}
              <span className="meta-item">📅 Joined {formatDate(user.createdAt)}</span>
            </div>
            <div className="profile-stats">
              <span><strong>{user.followers?.length || 0}</strong> followers</span>
              <span><strong>{user.following?.length || 0}</strong> following</span>
              <span><strong>{posts.length}</strong> posts</span>
            </div>
          </div>
          <div className="profile-actions">
            {isOwnProfile ? (
              <Link to="/profile/edit" className="btn btn-secondary">
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs tabs">
          <button
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>

        <div className="profile-tab-content">
          {activeTab === 'posts' && (
            <div className="profile-posts">
              {posts.length > 0 ? (
                posts.map(post => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onDelete={handlePostDeleted}
                    onUpdate={handlePostUpdated}
                  />
                ))
              ) : (
                <div className="empty-state card">
                  <div className="empty-state-icon">📝</div>
                  <h3 className="empty-state-title">No posts yet</h3>
                  <p>{isOwnProfile ? 'Share your first post!' : 'This user hasn\'t posted anything yet.'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="profile-about card">
              <h3>About {user.name}</h3>
              <div className="about-section">
                <h4>Bio</h4>
                <p>{user.bio || 'No bio provided'}</p>
              </div>
              {user.location && (
                <div className="about-section">
                  <h4>Location</h4>
                  <p>{user.location}</p>
                </div>
              )}
              {user.website && (
                <div className="about-section">
                  <h4>Website</h4>
                  <a href={user.website} target="_blank" rel="noopener noreferrer">
                    {user.website}
                  </a>
                </div>
              )}
              <div className="about-section">
                <h4>Moodle Connection</h4>
                <p>
                  {user.moodleConnected ? (
                    <span className="badge badge-success">Connected</span>
                  ) : (
                    <span className="badge">Not Connected</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
