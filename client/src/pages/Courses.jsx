import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      try {
        const res = await api.get('/moodle/courses');
        setCourses(res.data);
      } catch (err) {
        // Mock data for demo
        setCourses([
          {
            _id: '1',
            moodleId: 'CS101',
            name: 'Introduction to Computer Science',
            shortName: 'CS101',
            instructor: 'Dr. Smith',
            enrolled: 45,
            progress: 75,
            assignments: [
              { _id: 'a1', title: 'Lab 1: Hello World', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), status: 'submitted', grade: 95 },
              { _id: 'a2', title: 'Lab 2: Variables', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'pending', grade: null },
              { _id: 'a3', title: 'Midterm Project', dueDate: new Date(Date.now() + 86400000 * 14).toISOString(), status: 'pending', grade: null }
            ],
            grades: { current: 92, assignments: 95, quizzes: 88, participation: 100 },
            announcements: [
              { _id: 'n1', title: 'Class cancelled Friday', date: new Date().toISOString() },
              { _id: 'n2', title: 'Office hours moved to 3pm', date: new Date(Date.now() - 86400000).toISOString() }
            ]
          },
          {
            _id: '2',
            moodleId: 'MATH201',
            name: 'Calculus II',
            shortName: 'MATH201',
            instructor: 'Prof. Johnson',
            enrolled: 32,
            progress: 60,
            assignments: [
              { _id: 'b1', title: 'Problem Set 5', dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), status: 'pending', grade: null },
              { _id: 'b2', title: 'Quiz 3', dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), status: 'pending', grade: null }
            ],
            grades: { current: 85, assignments: 88, quizzes: 82, participation: 90 },
            announcements: []
          },
          {
            _id: '3',
            moodleId: 'ENG102',
            name: 'Technical Writing',
            shortName: 'ENG102',
            instructor: 'Dr. Williams',
            enrolled: 28,
            progress: 45,
            assignments: [
              { _id: 'c1', title: 'Essay Draft', dueDate: new Date(Date.now() - 86400000).toISOString(), status: 'late', grade: null }
            ],
            grades: { current: 78, assignments: 75, quizzes: 80, participation: 85 },
            announcements: [
              { _id: 'm1', title: 'Peer review session next week', date: new Date().toISOString() }
            ]
          },
          {
            _id: '4',
            moodleId: 'PHYS101',
            name: 'Physics I',
            shortName: 'PHYS101',
            instructor: 'Prof. Lee',
            enrolled: 50,
            progress: 55,
            assignments: [],
            grades: { current: 88, assignments: 90, quizzes: 85, participation: 95 },
            announcements: []
          }
        ]);
        setLastSync(new Date());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/moodle/sync');
      await fetchCourses();
      setLastSync(new Date());
    } catch (err) {
      // Simulate sync for demo
      await new Promise(r => setTimeout(r, 2000));
      setLastSync(new Date());
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-green-500/20 text-green-400';
      case 'late': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = d - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading courses from Moodle...</p>
        </div>
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
            <Link to="/courses" className="text-purple-400 font-medium">Courses</Link>
            <Link to="/groups" className="text-gray-400 hover:text-white transition">Groups</Link>
            <Link to="/profile" className="text-gray-400 hover:text-white transition">Profile</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Courses</h1>
            <p className="text-gray-400">
              {lastSync ? `Last synced: ${lastSync.toLocaleTimeString()}` : 'Synced with Moodle'}
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 rounded-lg text-white font-medium transition"
          >
            <span className={syncing ? 'animate-spin' : ''}>🔄</span>
            {syncing ? 'Syncing...' : 'Sync with Moodle'}
          </button>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {courses.map(course => (
            <div 
              key={course._id}
              onClick={() => setSelectedCourse(selectedCourse?._id === course._id ? null : course)}
              className={`bg-white/10 backdrop-blur-xl rounded-xl border transition cursor-pointer ${
                selectedCourse?._id === course._id 
                  ? 'border-purple-500 ring-2 ring-purple-500/30' 
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs text-purple-400 font-medium">{course.shortName}</span>
                    <h3 className="text-lg font-semibold text-white">{course.name}</h3>
                    <p className="text-gray-400 text-sm">{course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{course.grades.current}%</div>
                    <div className="text-xs text-gray-400">Current Grade</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Course Progress</span>
                    <span className="text-white">{course.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    📚 {course.assignments.length} assignments
                  </span>
                  <span className="text-gray-400">
                    👥 {course.enrolled} enrolled
                  </span>
                  {course.announcements.length > 0 && (
                    <span className="text-orange-400">
                      📢 {course.announcements.length} new
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded View */}
              {selectedCourse?._id === course._id && (
                <div className="border-t border-white/10 p-6 space-y-6">
                  {/* Grades Breakdown */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Grade Breakdown</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-white">{course.grades.assignments}%</div>
                        <div className="text-xs text-gray-400">Assignments</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-white">{course.grades.quizzes}%</div>
                        <div className="text-xs text-gray-400">Quizzes</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-white">{course.grades.participation}%</div>
                        <div className="text-xs text-gray-400">Participation</div>
                      </div>
                    </div>
                  </div>

                  {/* Assignments */}
                  {course.assignments.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-3">Assignments</h4>
                      <div className="space-y-2">
                        {course.assignments.map(assignment => (
                          <div key={assignment._id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                            <div>
                              <p className="text-white text-sm">{assignment.title}</p>
                              <p className={`text-xs ${new Date(assignment.dueDate) < new Date() ? 'text-red-400' : 'text-gray-400'}`}>
                                {formatDate(assignment.dueDate)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {assignment.grade !== null && (
                                <span className="text-white font-medium">{assignment.grade}%</span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(assignment.status)}`}>
                                {assignment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Announcements */}
                  {course.announcements.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-3">Announcements</h4>
                      <div className="space-y-2">
                        {course.announcements.map(ann => (
                          <div key={ann._id} className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                            <p className="text-white text-sm">{ann.title}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(ann.date).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition">
                      Open in Moodle
                    </button>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition">
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4">📅 Upcoming Deadlines</h2>
          <div className="space-y-3">
            {courses
              .flatMap(c => c.assignments.map(a => ({ ...a, courseName: c.shortName })))
              .filter(a => new Date(a.dueDate) > new Date())
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .slice(0, 5)
              .map((assignment, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      new Date(assignment.dueDate) - new Date() < 86400000 * 2 
                        ? 'bg-red-500' 
                        : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="text-white">{assignment.title}</p>
                      <p className="text-sm text-gray-400">{assignment.courseName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-400">{formatDate(assignment.dueDate)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
