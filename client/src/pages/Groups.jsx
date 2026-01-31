import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    course: '',
    isPrivate: false
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      try {
        const [allRes, myRes] = await Promise.all([
          api.get('/groups'),
          api.get('/groups/my')
        ]);
        setGroups(allRes.data);
        setMyGroups(myRes.data);
      } catch (err) {
        // Mock data for demo
        const mockGroups = [
          {
            _id: '1',
            name: 'CS101 Study Group',
            description: 'Study group for Introduction to Computer Science. We meet weekly to review concepts and work on assignments together.',
            course: 'CS101',
            members: [
              { _id: 'u1', name: 'Alice Johnson', avatar: 'https://ui-avatars.com/api/?name=Alice&background=6366f1&color=fff' },
              { _id: 'u2', name: 'Bob Smith', avatar: 'https://ui-avatars.com/api/?name=Bob&background=ec4899&color=fff' },
              { _id: 'u3', name: 'Carol Davis', avatar: 'https://ui-avatars.com/api/?name=Carol&background=10b981&color=fff' }
            ],
            admin: { _id: 'u1', name: 'Alice Johnson' },
            isPrivate: false,
            tags: ['programming', 'algorithms', 'beginner'],
            meetingSchedule: 'Tuesdays 7pm',
            createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
          },
          {
            _id: '2',
            name: 'Calculus Masters',
            description: 'Advanced study group for Calculus II. Focus on integration techniques and series.',
            course: 'MATH201',
            members: [
              { _id: 'u4', name: 'David Lee', avatar: 'https://ui-avatars.com/api/?name=David&background=f59e0b&color=fff' },
              { _id: 'u5', name: 'Emma Wilson', avatar: 'https://ui-avatars.com/api/?name=Emma&background=8b5cf6&color=fff' }
            ],
            admin: { _id: 'u4', name: 'David Lee' },
            isPrivate: false,
            tags: ['math', 'calculus', 'advanced'],
            meetingSchedule: 'Mondays 6pm',
            createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
          },
          {
            _id: '3',
            name: 'Final Exam Prep',
            description: 'Intensive study sessions for finals week. All subjects welcome!',
            course: null,
            members: [
              { _id: 'u1', name: 'Alice Johnson', avatar: 'https://ui-avatars.com/api/?name=Alice&background=6366f1&color=fff' },
              { _id: 'u6', name: 'Frank Brown', avatar: 'https://ui-avatars.com/api/?name=Frank&background=14b8a6&color=fff' },
              { _id: 'u7', name: 'Grace Chen', avatar: 'https://ui-avatars.com/api/?name=Grace&background=f43f5e&color=fff' },
              { _id: 'u8', name: 'Henry Kim', avatar: 'https://ui-avatars.com/api/?name=Henry&background=6366f1&color=fff' }
            ],
            admin: { _id: 'u6', name: 'Frank Brown' },
            isPrivate: false,
            tags: ['finals', 'study', 'all-subjects'],
            meetingSchedule: 'Daily 8pm during finals',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
          },
          {
            _id: '4',
            name: 'Physics Problem Solvers',
            description: 'Work through physics problems together and understand the concepts.',
            course: 'PHYS101',
            members: [
              { _id: 'u9', name: 'Ivy Martinez', avatar: 'https://ui-avatars.com/api/?name=Ivy&background=ec4899&color=fff' }
            ],
            admin: { _id: 'u9', name: 'Ivy Martinez' },
            isPrivate: true,
            tags: ['physics', 'problem-solving'],
            meetingSchedule: 'Thursdays 5pm',
            createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
          }
        ];
        setGroups(mockGroups);
        setMyGroups([mockGroups[0], mockGroups[2]]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/groups', newGroup);
      setMyGroups([...myGroups, res.data]);
      setGroups([...groups, res.data]);
    } catch (err) {
      // Create locally for demo
      const created = {
        _id: Date.now().toString(),
        ...newGroup,
        members: [{ _id: user?._id, name: user?.name || 'You', avatar: `https://ui-avatars.com/api/?name=${user?.name || 'You'}&background=6366f1&color=fff` }],
        admin: { _id: user?._id, name: user?.name || 'You' },
        tags: [],
        createdAt: new Date().toISOString()
      };
      setMyGroups([...myGroups, created]);
      setGroups([...groups, created]);
    }
    setShowCreateModal(false);
    setNewGroup({ name: '', description: '', course: '', isPrivate: false });
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/join`);
    } catch (err) {
      // Join locally for demo
    }
    const group = groups.find(g => g._id === groupId);
    if (group && !myGroups.find(g => g._id === groupId)) {
      setMyGroups([...myGroups, group]);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await api.delete(`/groups/${groupId}/leave`);
    } catch (err) {
      // Leave locally for demo
    }
    setMyGroups(myGroups.filter(g => g._id !== groupId));
    if (selectedGroup?._id === groupId) {
      setSelectedGroup(null);
    }
  };

  const isMember = (group) => myGroups.some(g => g._id === group._id);

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
            <Link to="/groups" className="text-purple-400 font-medium">Groups</Link>
            <Link to="/profile" className="text-gray-400 hover:text-white transition">Profile</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Study Groups</h1>
            <p className="text-gray-400">Collaborate with classmates and study together</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition"
          >
            <span>➕</span> Create Group
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'discover' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            🔍 Discover ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'my' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            👥 My Groups ({myGroups.length})
          </button>
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {(activeTab === 'discover' ? groups : myGroups).map(group => (
            <div 
              key={group._id}
              className={`bg-white/10 backdrop-blur-xl rounded-xl border transition ${
                selectedGroup?._id === group._id 
                  ? 'border-purple-500' 
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                      {group.isPrivate && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">🔒 Private</span>
                      )}
                    </div>
                    {group.course && (
                      <span className="text-xs text-purple-400 font-medium">{group.course}</span>
                    )}
                  </div>
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 3).map(member => (
                      <img 
                        key={member._id}
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full border-2 border-slate-900"
                      />
                    ))}
                    {group.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-slate-900 flex items-center justify-center text-xs text-white">
                        +{group.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{group.description}</p>

                {/* Tags */}
                {group.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {group.tags.map(tag => (
                      <span key={tag} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>👥 {group.members.length} members</span>
                  {group.meetingSchedule && (
                    <span>📅 {group.meetingSchedule}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {isMember(group) ? (
                    <>
                      <button 
                        onClick={() => setSelectedGroup(group)}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition"
                      >
                        💬 Open Chat
                      </button>
                      <button 
                        onClick={() => handleLeaveGroup(group._id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition"
                      >
                        Leave
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleJoinGroup(group._id)}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition"
                    >
                      ➕ Join Group
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {(activeTab === 'discover' ? groups : myGroups).length === 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">
              {activeTab === 'discover' 
                ? 'No study groups yet. Be the first to create one!'
                : 'You haven\'t joined any groups yet.'}
            </p>
            {activeTab === 'my' && (
              <button
                onClick={() => setActiveTab('discover')}
                className="text-purple-400 hover:text-purple-300"
              >
                Discover groups →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/20 w-full max-w-md">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Create Study Group</h2>
            </div>
            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Group Name *</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white mt-1 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  placeholder="e.g., CS101 Study Group"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white mt-1 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  rows={3}
                  placeholder="What's this group about?"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Related Course (optional)</label>
                <input
                  type="text"
                  value={newGroup.course}
                  onChange={(e) => setNewGroup({ ...newGroup, course: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white mt-1 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  placeholder="e.g., CS101"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newGroup.isPrivate}
                  onChange={(e) => setNewGroup({ ...newGroup, isPrivate: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Make this group private (invite only)</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Chat Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/20 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedGroup.name}</h2>
                <p className="text-sm text-gray-400">{selectedGroup.members.length} members</p>
              </div>
              <button 
                onClick={() => setSelectedGroup(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Sample messages */}
              <div className="flex gap-3">
                <img src={selectedGroup.members[0]?.avatar} alt="" className="w-8 h-8 rounded-full" />
                <div className="bg-white/10 rounded-lg px-4 py-2 max-w-[80%]">
                  <p className="text-xs text-purple-400 mb-1">{selectedGroup.members[0]?.name}</p>
                  <p className="text-white text-sm">Hey everyone! Ready for the study session?</p>
                </div>
              </div>
              <div className="flex gap-3">
                <img src={selectedGroup.members[1]?.avatar || selectedGroup.members[0]?.avatar} alt="" className="w-8 h-8 rounded-full" />
                <div className="bg-white/10 rounded-lg px-4 py-2 max-w-[80%]">
                  <p className="text-xs text-purple-400 mb-1">{selectedGroup.members[1]?.name || 'Member'}</p>
                  <p className="text-white text-sm">Yes! I have questions about chapter 5.</p>
                </div>
              </div>
              <div className="flex justify-center">
                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">Today</span>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-purple-600 rounded-lg px-4 py-2 max-w-[80%]">
                  <p className="text-white text-sm">Let's start! I'll share my notes.</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                />
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
