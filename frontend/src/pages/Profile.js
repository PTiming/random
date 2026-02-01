import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI, postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/Post/PostCard';
import { FiMapPin, FiLink, FiCalendar, FiEdit2, FiUserPlus, FiUserCheck, FiMessageSquare, FiBook } from 'react-icons/fi';
import { format } from 'date-fns';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFriend, setIsFriend] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [profileRes, postsRes] = await Promise.all([
          usersAPI.getProfile(userId),
          usersAPI.getUserPosts(userId, { limit: 10 })
        ]);

        setProfile(profileRes.data);
        setPosts(postsRes.data.posts);

        // Check if current user is friend/following
        if (currentUser) {
          setIsFriend(profileRes.data.friends?.some(f => f._id === currentUser.id));
          setIsFollowing(currentUser.following?.includes(userId));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId, currentUser]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await usersAPI.unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await usersAPI.followUser(userId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
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
        <p>The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Cover Photo */}
      <div className="profile-cover">
        <div className="cover-gradient"></div>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-container">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.username} className="profile-avatar" />
          ) : (
            <div className="profile-avatar avatar-placeholder">
              {profile.username?.charAt(0).toUpperCase()}
            </div>
          )}
          {profile.moodleConnected && (
            <span className="moodle-badge" title="Moodle Connected">
              <FiBook />
            </span>
          )}
        </div>

        <div className="profile-info">
          <h1 className="profile-name">
            {profile.firstName && profile.lastName
              ? `${profile.firstName} ${profile.lastName}`
              : profile.username}
          </h1>
          <p className="profile-username">@{profile.username}</p>

          {profile.bio && <p className="profile-bio">{profile.bio}</p>}

          <div className="profile-meta">
            {profile.location && (
              <span className="meta-item">
                <FiMapPin /> {profile.location}
              </span>
            )}
            {profile.website && (
              <a href={profile.website} className="meta-item" target="_blank" rel="noopener noreferrer">
                <FiLink /> {profile.website}
              </a>
            )}
            <span className="meta-item">
              <FiCalendar /> Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}
            </span>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{profile.postCount || 0}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.friendsCount || 0}</span>
              <span className="stat-label">Friends</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.followersCount || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.followingCount || 0}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          {isOwnProfile ? (
            <Link to="/settings" className="btn btn-secondary">
              <FiEdit2 /> Edit Profile
            </Link>
          ) : (
            <>
              <button
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleFollow}
              >
                {isFollowing ? (
                  <>
                    <FiUserCheck /> Following
                  </>
                ) : (
                  <>
                    <FiUserPlus /> Follow
                  </>
                )}
              </button>
              <Link to={`/messages/${userId}`} className="btn btn-secondary">
                <FiMessageSquare /> Message
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="profile-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Friends
          </button>
          <button
            className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            Photos
          </button>
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="posts-grid">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))
            ) : (
              <div className="empty-state">
                <h3>No posts yet</h3>
                <p>{isOwnProfile ? 'Share your first post!' : 'This user hasn\'t posted yet.'}</p>
              </div>
            )}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="friends-grid">
            {profile.friends?.length > 0 ? (
              profile.friends.map(friend => (
                <Link key={friend._id} to={`/profile/${friend._id}`} className="friend-card">
                  {friend.avatar ? (
                    <img src={friend.avatar} alt={friend.username} className="friend-avatar" />
                  ) : (
                    <div className="friend-avatar avatar-placeholder">
                      {friend.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="friend-info">
                    <h4>{friend.firstName && friend.lastName ? `${friend.firstName} ${friend.lastName}` : friend.username}</h4>
                    <p>@{friend.username}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <h3>No friends yet</h3>
                <p>Connect with classmates to build your network.</p>
              </div>
            )}
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="empty-state">
            <h3>No photos yet</h3>
            <p>Photos from posts will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
