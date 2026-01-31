import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, MessageSquare, Bell, User, Search, 
  Heart, MessageCircle, Share2, Image, Send,
  GraduationCap, BookOpen, Users, LogOut, 
  Calendar, TrendingUp
} from 'lucide-react';

const Feed = () => {
  const [newPost, setNewPost] = useState('');

  const posts = [
    {
      id: 1,
      author: { name: 'Dr. Sarah Johnson', role: 'Teacher', avatar: '👩‍🏫' },
      course: 'CS101 - Data Structures',
      content: '📚 Reminder: Assignment #3 on Binary Trees is due this Friday! Please submit through the portal. Feel free to ask questions in our study group.',
      time: '2 hours ago',
      likes: 24,
      comments: 8,
      isLiked: false,
    },
    {
      id: 2,
      author: { name: 'Alex Chen', role: 'Student', avatar: '👨‍🎓' },
      course: null,
      content: 'Just finished the algorithms problem set! Anyone wants to form a study group for the midterm? 📖',
      time: '4 hours ago',
      likes: 15,
      comments: 12,
      isLiked: true,
    },
    {
      id: 3,
      author: { name: 'Maria Garcia', role: 'Student', avatar: '👩‍🎓' },
      course: 'MATH201 - Linear Algebra',
      content: 'Great notes from today\'s lecture on eigenvalues! Sharing the summary here 📝\n\nKey points:\n• Eigenvalues represent scaling factors\n• Det(A - λI) = 0 to find them\n• Practice problems on page 145',
      time: '5 hours ago',
      likes: 42,
      comments: 7,
      isLiked: false,
    },
  ];

  const upcomingDeadlines = [
    { course: 'CS101', task: 'Binary Trees Assignment', due: 'Fri, 3 days' },
    { course: 'MATH201', task: 'Problem Set #5', due: 'Mon, 6 days' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">EduConnect</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, courses, people..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Nav Icons */}
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Home className="w-6 h-6" />
              </button>
              <Link to="/messages" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 relative">
                <MessageSquare className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
              <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </button>
              <Link to="/profile" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
                <User className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                  👨‍🎓
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">John Smith</h3>
                  <p className="text-sm text-gray-500">Computer Science • Year 3</p>
                </div>
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

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/courses" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 text-gray-700">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>My Courses</span>
                </Link>
                <Link to="/groups" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 text-gray-700">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>Study Groups</span>
                </Link>
                <Link to="/analytics" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 text-gray-700">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>My Progress</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-1 space-y-4">
            {/* Create Post */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xl">
                  👨‍🎓
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="What's on your mind? Share notes, ask questions..."
                    className="w-full p-3 bg-gray-100 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
                        <Image className="w-5 h-5 text-green-600" />
                        <span className="text-sm hidden sm:inline">Photo</span>
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span className="text-sm hidden sm:inline">Course</span>
                      </button>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                    {post.author.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        post.author.role === 'Teacher' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {post.author.role}
                      </span>
                    </div>
                    {post.course && (
                      <span className="text-sm text-indigo-600">{post.course}</span>
                    )}
                    <p className="text-sm text-gray-500">{post.time}</p>
                  </div>
                </div>

                <p className="mt-3 text-gray-800 whitespace-pre-line">{post.content}</p>

                <div className="flex items-center gap-6 mt-4 pt-3 border-t">
                  <button className={`flex items-center gap-1.5 ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-gray-500 hover:text-green-600">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block space-y-4">
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-gray-900">Upcoming Deadlines</h3>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-red-50 rounded-xl">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{deadline.task}</p>
                      <p className="text-xs text-gray-500">{deadline.course} • {deadline.due}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl text-sm font-medium">
                View all deadlines →
              </button>
            </div>

            {/* Active Study Groups */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900">Active Study Groups</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">
                    📊
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Data Structures Help</p>
                    <p className="text-xs text-gray-500">12 members • 3 online</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                    🧮
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Linear Algebra Study</p>
                    <p className="text-xs text-gray-500">8 members • 1 online</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Moodle Sync Status */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <h3 className="font-semibold text-orange-800">Moodle Synced</h3>
              </div>
              <p className="text-sm text-orange-700 mt-2">
                ✓ Last sync: 5 minutes ago<br/>
                ✓ 3 courses connected<br/>
                ✓ Grades up to date
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
