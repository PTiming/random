import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, MessageSquare, Bell, User, Search, 
  Heart, MessageCircle, Share2, Image, Send,
  GraduationCap, BookOpen, Users, Calendar, 
  TrendingUp, MoreHorizontal, Bookmark, Zap
} from 'lucide-react';

const Feed = () => {
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState([2]);

  const posts = [
    {
      id: 1,
      author: { name: 'Dr. Sarah Johnson', role: 'Teacher', avatar: '👩‍🏫', department: 'Computer Science' },
      course: 'CS101 - Data Structures',
      content: '📚 Reminder: Assignment #3 on Binary Trees is due this Friday! Please submit through the portal. Feel free to ask questions in our study group.\n\nKey topics covered:\n• Binary Search Trees\n• AVL Trees\n• Tree Traversals',
      time: '2 hours ago',
      likes: 24,
      comments: 8,
      isPinned: true,
    },
    {
      id: 2,
      author: { name: 'Alex Chen', role: 'Student', avatar: '👨‍🎓', department: 'Computer Science' },
      course: null,
      content: 'Just finished the algorithms problem set! Anyone wants to form a study group for the midterm? 📖\n\nLooking for 3-4 people who are serious about acing this exam! 💪',
      time: '4 hours ago',
      likes: 15,
      comments: 12,
      image: null,
    },
    {
      id: 3,
      author: { name: 'Maria Garcia', role: 'Student', avatar: '👩‍🎓', department: 'Mathematics' },
      course: 'MATH201 - Linear Algebra',
      content: 'Great notes from today\'s lecture on eigenvalues! Sharing the summary here 📝\n\nKey points:\n• Eigenvalues represent scaling factors\n• Det(A - λI) = 0 to find them\n• Practice problems on page 145',
      time: '5 hours ago',
      likes: 42,
      comments: 7,
    },
  ];

  const upcomingDeadlines = [
    { course: 'CS101', task: 'Binary Trees Assignment', due: 'Fri, 3 days', urgent: true },
    { course: 'MATH201', task: 'Problem Set #5', due: 'Mon, 6 days', urgent: false },
    { course: 'PHYS101', task: 'Lab Report', due: 'Wed, 8 days', urgent: false },
  ];

  const studyGroups = [
    { name: 'Data Structures Help', emoji: '📊', members: 12, online: 3, color: 'green' },
    { name: 'Linear Algebra Study', emoji: '🧮', members: 8, online: 1, color: 'blue' },
    { name: 'Physics Lab Partners', emoji: '⚗️', members: 5, online: 2, color: 'purple' },
  ];

  const toggleLike = (postId) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                EduConnect
              </span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search posts, courses, people..."
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Nav Icons */}
            <div className="flex items-center gap-1">
              <button className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 relative">
                <Home className="w-6 h-6" />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></span>
              </button>
              <Link to="/messages" className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 relative transition-colors">
                <MessageSquare className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center font-medium badge-bounce">2</span>
              </Link>
              <button className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 relative transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center font-medium">5</span>
              </button>
              <Link to="/profile" className="ml-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-xl ring-2 ring-white shadow-md hover:shadow-lg transition-all">
                  👨‍🎓
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden card-hover">
              <div className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="px-4 pb-4">
                <div className="flex items-center gap-3 -mt-8">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl ring-4 ring-white shadow-lg">
                    👨‍🎓
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="font-bold text-gray-900">John Smith</h3>
                  <p className="text-sm text-gray-500">Computer Science • Year 3</p>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="font-bold text-gray-900">24</p>
                    <p className="text-xs text-gray-500">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">128</p>
                    <p className="text-xs text-gray-500">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">89</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-4 shadow-sm card-hover">
              <h3 className="font-bold text-gray-900 mb-3">Quick Links</h3>
              <div className="space-y-1">
                <Link to="/courses" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 text-gray-700 transition-all group">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                    <BookOpen className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-medium">My Courses</span>
                </Link>
                <Link to="/groups" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 text-gray-700 transition-all group">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-500 transition-colors">
                    <Users className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-medium">Study Groups</span>
                </Link>
                <Link to="/analytics" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-gray-700 transition-all group">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                    <TrendingUp className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-medium">My Progress</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6 space-y-4">
            {/* Create Post */}
            <div className="bg-white rounded-2xl p-5 shadow-sm card-hover">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-2xl ring-2 ring-white shadow">
                  👨‍🎓
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Share something with your classmates... 💭"
                    className="w-full p-4 bg-gray-50 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    rows={3}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-1">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-green-50 text-gray-600 hover:text-green-600 transition-all">
                        <Image className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:inline">Photo</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all">
                        <BookOpen className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:inline">Course</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-purple-50 text-gray-600 hover:text-purple-600 transition-all">
                        <Users className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:inline">Group</span>
                      </button>
                    </div>
                    <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 font-medium btn-glow">
                      <Send className="w-4 h-4" />
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl p-5 shadow-sm card-hover message-bubble">
                {/* Pinned badge */}
                {post.isPinned && (
                  <div className="flex items-center gap-2 text-orange-600 mb-3 pb-3 border-b border-orange-100">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Pinned by instructor</span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ring-2 ring-white shadow ${
                      post.author.role === 'Teacher' 
                        ? 'bg-gradient-to-br from-purple-100 to-pink-100'
                        : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                    }`}>
                      {post.author.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{post.author.name}</h3>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          post.author.role === 'Teacher' 
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' 
                            : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                        }`}>
                          {post.author.role}
                        </span>
                      </div>
                      {post.course && (
                        <Link to={`/course/${post.course}`} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                          {post.course}
                        </Link>
                      )}
                      <p className="text-sm text-gray-500">{post.time}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <p className="mt-4 text-gray-800 whitespace-pre-line leading-relaxed">{post.content}</p>

                <div className="flex items-center justify-between mt-5 pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        likedPosts.includes(post.id) 
                          ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 transition-all ${likedPosts.includes(post.id) ? 'fill-current scale-110' : ''}`} />
                      <span className="text-sm font-medium">{post.likes + (likedPosts.includes(post.id) && post.id !== 2 ? 1 : 0)}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-xl text-gray-500 hover:bg-green-50 hover:text-green-600 transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-xl text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 transition-all">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-2xl p-4 shadow-sm card-hover">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold text-gray-900">Upcoming Deadlines</h3>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] ${
                      deadline.urgent 
                        ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-100' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      deadline.urgent ? 'bg-red-500' : 'bg-gray-200'
                    }`}>
                      <BookOpen className={`w-5 h-5 ${deadline.urgent ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${deadline.urgent ? 'text-red-700' : 'text-gray-900'}`}>
                        {deadline.task}
                      </p>
                      <p className="text-xs text-gray-500">{deadline.course} • {deadline.due}</p>
                    </div>
                    {deadline.urgent && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg font-medium">
                        Soon!
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl text-sm font-medium transition-all">
                View all deadlines →
              </button>
            </div>

            {/* Active Study Groups */}
            <div className="bg-white rounded-2xl p-4 shadow-sm card-hover">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="font-bold text-gray-900">Study Groups</h3>
              </div>
              <div className="space-y-3">
                {studyGroups.map((group, idx) => (
                  <button 
                    key={idx} 
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-${group.color}-100`}>
                      {group.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{group.name}</p>
                      <p className="text-xs text-gray-500">{group.members} members</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full pulse-online"></div>
                      <span className="text-xs text-gray-500">{group.online}</span>
                    </div>
                  </button>
                ))}
              </div>
              <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium transition-all hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-200 btn-glow">
                + Create Study Group
              </button>
            </div>

            {/* Moodle Sync Status */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg shadow-orange-200 card-hover">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <h3 className="font-bold">Moodle Connected</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-orange-100">Last sync: 5 minutes ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span className="text-orange-100">3 courses synced</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span className="text-orange-100">Grades up to date</span>
                </div>
              </div>
              <button className="w-full mt-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all">
                Sync Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
