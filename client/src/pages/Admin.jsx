import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [postPage, setPostPage] = useState(1);
  const [postTotalPages, setPostTotalPages] = useState(1);
  
  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modal states
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showEditUser, setShowEditUser] = useState(null);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'admin') {
      navigate('/feed');
      return;
    }
    
    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/activity-log')
      ]);
      
      setStats(statsRes.data.data);
      setActivityLog(activityRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: userPage,
        limit: 10
      });
      if (userSearch) params.append('search', userSearch);
      if (roleFilter) params.append('role', roleFilter);
      
      const res = await api.get(`/api/admin/users?${params}`);
      setUsers(res.data.data);
      setUserTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/api/admin/posts?page=${postPage}&limit=10`);
      setPosts(res.data.data);
      setPostTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, userPage, userSearch, roleFilter]);

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts();
  }, [activeTab, postPage]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/create-admin', newAdmin);
      setShowCreateAdmin(false);
      setNewAdmin({ name: '', email: '', password: '' });
      fetchUsers();
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await api.put(`/api/admin/users/${userId}`, updates);
      setShowEditUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/api/admin/users/${userId}`);
      fetchUsers();
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    
    try {
      await api.delete(`/api/admin/posts/${postId}`);
      fetchPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">🛡️ Admin Dashboard</h1>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                Admin: {user?.name}
              </span>
            </div>
            <button
              onClick={() => navigate('/feed')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              ← Back to App
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-800 p-2 rounded-xl">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
            { id: 'users', label: '👥 Users', icon: '👥' },
            { id: 'posts', label: '📝 Posts', icon: '📝' },
            { id: 'activity', label: '📋 Activity', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Users</p>
                    <p className="text-4xl font-bold mt-2">{stats.users.total}</p>
                  </div>
                  <div className="text-6xl opacity-50">👥</div>
                </div>
                <div className="mt-4 text-sm text-blue-100">
                  +{stats.users.newToday} today | +{stats.users.newThisWeek} this week
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Posts</p>
                    <p className="text-4xl font-bold mt-2">{stats.content.posts}</p>
                  </div>
                  <div className="text-6xl opacity-50">📝</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Messages</p>
                    <p className="text-4xl font-bold mt-2">{stats.content.messages}</p>
                  </div>
                  <div className="text-6xl opacity-50">💬</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Study Groups</p>
                    <p className="text-4xl font-bold mt-2">{stats.content.groups}</p>
                  </div>
                  <div className="text-6xl opacity-50">📚</div>
                </div>
              </div>
            </div>

            {/* User Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">User Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Students</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(stats.users.students / stats.users.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-medium">{stats.users.students}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Teachers</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(stats.users.teachers / stats.users.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-medium">{stats.users.teachers}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Admins</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${(stats.users.admins / stats.users.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-medium">{stats.users.admins}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Activity Chart */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">7-Day Activity</h3>
                <div className="flex items-end justify-between h-40 gap-2">
                  {stats.dailyStats.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col gap-1 items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${Math.max(day.users * 20, 4)}px` }}
                          title={`${day.users} users`}
                        />
                        <div
                          className="w-full bg-green-500"
                          style={{ height: `${Math.max(day.posts * 10, 4)}px` }}
                          title={`${day.posts} posts`}
                        />
                        <div
                          className="w-full bg-purple-500 rounded-b"
                          style={{ height: `${Math.max(day.messages * 5, 4)}px` }}
                          title={`${day.messages} messages`}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" /> Users
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" /> Posts
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded" /> Messages
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowCreateAdmin(true)}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                >
                  ➕ Create Admin
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  👥 Manage Users
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  📝 Moderate Content
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-gray-800 rounded-xl p-4 flex flex-wrap gap-4 items-center">
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 outline-none"
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
              </select>
              <button
                onClick={() => setShowCreateAdmin(true)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                ➕ Create Admin
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium">User</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium">Role</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium">Joined</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                          u.role === 'teacher' ? 'bg-green-500/20 text-green-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowEditUser(u)}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-sm"
                          >
                            Edit
                          </button>
                          {u._id !== user?._id && (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="px-4 py-3 bg-gray-700 flex justify-between items-center">
                <span className="text-gray-400">Page {userPage} of {userTotalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))}
                    disabled={userPage === userTotalPages}
                    className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-400">No posts yet</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post._id} className="bg-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {post.author?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-white font-medium">{post.author?.name || 'Unknown'}</p>
                        <p className="text-gray-500 text-sm">
                          {post.author?.email} • {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-sm"
                    >
                      Delete Post
                    </button>
                  </div>
                  <p className="text-gray-300 mt-4">{post.content}</p>
                  <div className="flex gap-4 mt-4 text-sm text-gray-500">
                    <span>❤️ {post.likes?.length || 0} likes</span>
                    <span>💬 {post.comments?.length || 0} comments</span>
                  </div>
                </div>
              ))
            )}
            
            {/* Pagination */}
            {posts.length > 0 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPostPage(p => Math.max(1, p - 1))}
                  disabled={postPage === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-400">
                  Page {postPage} of {postTotalPages}
                </span>
                <button
                  onClick={() => setPostPage(p => Math.min(postTotalPages, p + 1))}
                  disabled={postPage === postTotalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {activityLog.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    activity.type === 'user_joined' ? 'bg-blue-500/20' :
                    activity.type === 'post_created' ? 'bg-green-500/20' :
                    'bg-purple-500/20'
                  }`}>
                    {activity.type === 'user_joined' ? '👤' :
                     activity.type === 'post_created' ? '📝' : '💬'}
                  </div>
                  <div className="flex-1">
                    <p className="text-white">
                      <span className="font-medium">{activity.user}</span>
                      {activity.type === 'user_joined' && (
                        <span className="text-gray-400"> joined as <span className="text-blue-400">{activity.role}</span></span>
                      )}
                      {activity.type === 'post_created' && (
                        <span className="text-gray-400"> created a post</span>
                      )}
                      {activity.type === 'message_sent' && (
                        <span className="text-gray-400"> sent a message</span>
                      )}
                    </p>
                    {activity.content && (
                      <p className="text-gray-500 text-sm mt-1">{activity.content}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Create New Admin</h3>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Password</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateAdmin(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={showEditUser.name}
                  onChange={(e) => setShowEditUser({ ...showEditUser, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Role</label>
                <select
                  value={showEditUser.role}
                  onChange={(e) => setShowEditUser({ ...showEditUser, role: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 outline-none"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditUser(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateUser(showEditUser._id, { name: showEditUser.name, role: showEditUser.role })}
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
