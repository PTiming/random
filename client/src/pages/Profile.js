import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usersAPI, postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/feed/PostCard';
import { FiEdit2, FiUserPlus, FiUserCheck, FiUserX, FiClock, FiMapPin, FiBook, FiUsers } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const profileId = userId || currentUser?._id;
  const isOwnProfile = profileId === currentUser?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await usersAPI.getProfile(profileId);
        setProfile(response.data.data.user);
        setConnectionStatus(response.data.data.user.connectionStatus);
        setEditForm({
          firstName: response.data.data.user.firstName,
          lastName: response.data.data.user.lastName,
          bio: response.data.data.user.bio || '',
          institution: response.data.data.user.institution || '',
          skills: response.data.data.user.skills?.join(', ') || ''
        });

        // Fetch user's posts
        const postsResponse = await postsAPI.getFeed({ filter: 'mine' });
        setPosts(postsResponse.data.data.posts.filter(p => p.author._id === profileId));
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const handleConnect = async () => {
    try {
      const response = await usersAPI.connect(profileId);
      setConnectionStatus(response.data.data.status);
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleAcceptConnection = async () => {
    try {
      await usersAPI.acceptConnection(profileId);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Accept connection error:', error);
    }
  };

  const handleRemoveConnection = async () => {
    try {
      await usersAPI.removeConnection(profileId);
      setConnectionStatus(null);
    } catch (error) {
      console.error('Remove connection error:', error);
    }
  };

  const handleEditSave = async () => {
    try {
      const updateData = {
        ...editForm,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean)
      };
      const response = await usersAPI.updateProfile(updateData);
      setProfile(prev => ({ ...prev, ...response.data.data.user }));
      updateUser(response.data.data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const renderConnectionButton = () => {
    if (isOwnProfile) {
      return (
        <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
          <FiEdit2 /> Edit Profile
        </button>
      );
    }

    switch (connectionStatus) {
      case 'connected':
        return (
          <button className="btn btn-secondary" onClick={handleRemoveConnection}>
            <FiUserCheck /> Connected
          </button>
        );
      case 'pending_sent':
        return (
          <button className="btn btn-secondary" disabled>
            <FiClock /> Request Sent
          </button>
        );
      case 'pending_received':
        return (
          <div className="connection-actions">
            <button className="btn btn-primary" onClick={handleAcceptConnection}>
              <FiUserPlus /> Accept
            </button>
            <button className="btn btn-outline" onClick={handleRemoveConnection}>
              <FiUserX /> Decline
            </button>
          </div>
        );
      default:
        return (
          <button className="btn btn-primary" onClick={handleConnect}>
            <FiUserPlus /> Connect
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="empty-state">
        <h3>Profile not found</h3>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header card">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div className="profile-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="avatar avatar-xl" />
            ) : (
              <div className="avatar avatar-xl">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="profile-details">
            <h1>{profile.firstName} {profile.lastName}</h1>
            <p className="profile-username">@{profile.username}</p>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <div className="profile-meta">
              {profile.institution && (
                <span><FiMapPin /> {profile.institution}</span>
              )}
              {profile.role && (
                <span><FiBook /> {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</span>
              )}
            </div>
          </div>
          <div className="profile-actions">
            {renderConnectionButton()}
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">{profile.connectionsCount || 0}</span>
            <span className="stat-label">Connections</span>
          </div>
          <div className="stat">
            <span className="stat-value">{profile.followersCount || 0}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat">
            <span className="stat-value">{posts.length}</span>
            <span className="stat-label">Posts</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          {['posts', 'about', 'connections'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'posts' && (
          <div className="posts-list">
            {posts.length === 0 ? (
              <div className="empty-state">
                <p>No posts yet</p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard key={post._id} post={post} currentUserId={currentUser?._id} />
              ))
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="card about-section">
            <h3>About</h3>
            {profile.bio && <p>{profile.bio}</p>}
            {profile.skills?.length > 0 && (
              <div className="skills-section">
                <h4>Skills</h4>
                <div className="skills-list">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="badge badge-primary">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.interests?.length > 0 && (
              <div className="interests-section">
                <h4>Interests</h4>
                <div className="skills-list">
                  {profile.interests.map((interest, i) => (
                    <span key={i} className="badge badge-primary">{interest}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="connections-section">
            <p className="text-muted">View connections coming soon...</p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <div className="input-group">
              <label>First Name</label>
              <input
                type="text"
                className="input"
                value={editForm.firstName}
                onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input
                type="text"
                className="input"
                value={editForm.lastName}
                onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Bio</label>
              <textarea
                className="input"
                rows="3"
                value={editForm.bio}
                onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Institution</label>
              <input
                type="text"
                className="input"
                value={editForm.institution}
                onChange={e => setEditForm({ ...editForm, institution: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Skills (comma separated)</label>
              <input
                type="text"
                className="input"
                value={editForm.skills}
                onChange={e => setEditForm({ ...editForm, skills: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleEditSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
