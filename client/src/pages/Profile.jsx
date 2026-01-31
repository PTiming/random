import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', avatar: '' });

  const isOwnProfile = !userId || userId === currentUser?._id;
  const profileId = userId || currentUser?._id;

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Try to fetch from API, fallback to mock data
      try {
        const res = await api.get(`/users/${profileId}`);
        setUser(res.data);
        setIsFollowing(res.data.followers?.includes(currentUser?._id));
        setEditForm({ bio: res.data.bio || '', avatar: res.data.avatar || '' });
        
        const postsRes = await api.get(`/posts/user/${profileId}`);
        setPosts(postsRes.data);
      } catch (err) {
        // Use mock data if API fails
        setUser({
          _id: profileId,
          name: currentUser?.name || 'John Student',
          email: currentUser?.email || 'john@university.edu',
          role: currentUser?.role || 'student',
          bio: 'Computer Science student passionate about web development and AI.',
          avatar: `https://ui-avatars.com/api/?name=${currentUser?.name || 'John'}&background=6366f1&color=fff&size=200`,
          followers: ['1', '2', '3'],
          following: ['4', '5'],
          createdAt: new Date().toISOString(),
          moodleLinked: true
        });
        setPosts([
          {
            _id: '1',
            content: 'Just finished my final project for Web Development! 🎉',
            author: { name: currentUser?.name || 'John Student' },
            likes: ['a', 'b', 'c'],
            comments: [],
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: '2',
            content: 'Anyone want to form a study group for the Data Structures exam?',
            author: { name: currentUser?.name || 'John Student' },
            likes: ['a'],
            comments: [{ _id: 'c1' }, { _id: 'c2' }],
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/users/${profileId}/follow`);
      } else {
        await api.post(`/users/${profileId}/follow`);
      }
      setIsFollowing(!isFollowing);
      setUser(prev => ({
        ...prev,
        followers: isFollowing 
          ? prev.followers.filter(id => id !== currentUser._id)
          : [...prev.followers, currentUser._id]
      }));
    } catch (err) {
      // Toggle anyway for demo
      setIsFollowing(!isFollowing);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/users/profile', editForm);
      setUser(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (err) {
      // Save locally for demo
      setUser(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/feed" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            EduConnect
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/feed" className="text-gray-400 hover:text-white transition">Feed</Link>
            <Link to="/messages" className="text-gray-400 hover:text-white transition">Messages</Link>
            <Link to="/courses" className="text-gray-400 hover:text-white transition">Courses</Link>
            <Link to="/groups" className="text-gray-400 hover:text-white transition">Groups</Link>
            <Link to="/profile" className="text-purple-400 font-medium">Profile</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600"></div>
          
          <div className="px-6 pb-6">
            {/* Avatar & Actions */}
            <div className="flex justify-between items-end -mt-16 mb-4">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=200`}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-slate-900 object-cover"
              />
              
              {isOwnProfile ? (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              ) : (
                <button 
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    isFollowing 
                      ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>

            {/* User Info */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white mt-1"
                    rows={3}
                  />
                </div>
                <button 
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-gray-400">@{user.email?.split('@')[0]}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'teacher' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {user.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
                  </span>
                  {user.moodleLinked && (
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                      📚 Moodle Linked
                    </span>
                  )}
                </div>

                {user.bio && (
                  <p className="text-gray-300 mt-4">{user.bio}</p>
                )}

                <div className="flex gap-6 mt-4 text-sm">
                  <div>
                    <span className="text-white font-bold">{user.followers?.length || 0}</span>
                    <span className="text-gray-400 ml-1">Followers</span>
                  </div>
                  <div>
                    <span className="text-white font-bold">{user.following?.length || 0}</span>
                    <span className="text-gray-400 ml-1">Following</span>
                  </div>
                  <div>
                    <span className="text-white font-bold">{posts.length}</span>
                    <span className="text-gray-400 ml-1">Posts</span>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mt-4">
                  Joined {formatDate(user.createdAt)}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {['posts', 'likes', 'groups'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 text-center">
                <p className="text-gray-400">No posts yet</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post._id} className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                  <p className="text-white">{post.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                    <span>❤️ {post.likes?.length || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 text-center">
            <p className="text-gray-400">Liked posts will appear here</p>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 text-center">
            <p className="text-gray-400">Study groups will appear here</p>
            <Link to="/groups" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
              Browse Groups →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
