import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import Post from '../components/Post';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  const isOwnProfile = currentUser && (currentUser.id === id || currentUser._id === id);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile(id);
      setProfile(response.data.user);
      setPosts(response.data.posts);
      setBio(response.data.user.bio || '');
      setProfilePicture(response.data.user.profilePicture || '');
      
      if (currentUser) {
        setIsFollowing(
          response.data.user.followers.some(
            f => (f._id || f) === (currentUser.id || currentUser._id)
          )
        );
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    setLoading(false);
  }, [id, currentUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await userService.unfollowUser(id);
        setProfile(prev => ({
          ...prev,
          followers: prev.followers.filter(
            f => (f._id || f) !== (currentUser.id || currentUser._id)
          )
        }));
      } else {
        await userService.followUser(id);
        setProfile(prev => ({
          ...prev,
          followers: [...prev.followers, { _id: currentUser.id || currentUser._id }]
        }));
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.updateProfile({ bio, profilePicture });
      setProfile(prev => ({ ...prev, ...response.data }));
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error-page">User not found</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt={profile.username} />
          ) : (
            <span>{profile.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="profile-info">
          <h1>{profile.username}</h1>
          <p className="profile-bio">{profile.bio || 'No bio yet'}</p>
          <div className="profile-stats">
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>{profile.followers?.length || 0}</strong> followers</span>
            <span><strong>{profile.following?.length || 0}</strong> following</span>
          </div>
        </div>
        <div className="profile-actions">
          {isOwnProfile ? (
            <button 
              className="edit-btn"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          ) : currentUser ? (
            <button 
              className={`follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          ) : null}
        </div>
      </div>

      {editing && (
        <form className="edit-form" onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Profile Picture URL</label>
            <input
              type="text"
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              placeholder="Tell us about yourself"
              rows={3}
            />
            <span className="char-count">{bio.length}/160</span>
          </div>
          <button type="submit" className="save-btn">Save Changes</button>
        </form>
      )}

      <div className="profile-posts">
        <h2>Posts</h2>
        {posts.length === 0 ? (
          <div className="no-posts">No posts yet</div>
        ) : (
          posts.map((post) => (
            <Post 
              key={post._id} 
              post={post} 
              onDelete={handlePostDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
