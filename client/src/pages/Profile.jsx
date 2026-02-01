import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Post from '../components/Post';
import { UserPlus, UserMinus, Users, FileText } from 'lucide-react';

function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [userRes, postsRes] = await Promise.all([
          api.get(`/auth/${userId}`),
          api.get(`/posts/user/${userId}`)
        ]);
        setProfile(userRes.data);
        setPosts(postsRes.data);
        setIsFollowing(userRes.data.followers?.some(f => f._id === currentUser?._id));
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId, currentUser?._id]);

  const handleFollow = async () => {
    try {
      const res = await api.post(`/auth/${userId}/follow`);
      setIsFollowing(res.data.following);
      setProfile(prev => ({
        ...prev,
        followers: res.data.following
          ? [...prev.followers, currentUser]
          : prev.followers.filter(f => f._id !== currentUser._id)
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Navbar />
        <main className="main-content">
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="app">
        <Navbar />
        <main className="main-content">
          <div className="error-state">User not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} />
              ) : (
                <span>{profile.username?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="profile-info">
              <h1>{profile.username}</h1>
              {profile.bio && <p className="bio">{profile.bio}</p>}
              <div className="profile-stats">
                <div className="stat">
                  <FileText size={18} />
                  <span><strong>{posts.length}</strong> Posts</span>
                </div>
                <div className="stat">
                  <Users size={18} />
                  <span><strong>{profile.followers?.length || 0}</strong> Followers</span>
                </div>
                <div className="stat">
                  <Users size={18} />
                  <span><strong>{profile.following?.length || 0}</strong> Following</span>
                </div>
              </div>
            </div>
            {currentUser?._id !== userId && (
              <button
                onClick={handleFollow}
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              >
                {isFollowing ? (
                  <><UserMinus size={18} /> Unfollow</>
                ) : (
                  <><UserPlus size={18} /> Follow</>
                )}
              </button>
            )}
          </div>

          <div className="profile-posts">
            <h2>Posts</h2>
            {posts.length > 0 ? (
              posts.map(post => <Post key={post._id} post={post} />)
            ) : (
              <div className="empty-state">
                <p>No posts yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
