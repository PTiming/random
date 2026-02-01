import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    moodleCourseId: ''
  });
  const { user } = useContext(AuthContext);

  const menuItems = [
    { id: 'courses', label: '📚 My Courses' },
    { id: 'feed', label: '📰 Social Feed' },
    { id: 'moodle', label: '🎓 Moodle Integration' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, postsRes] = await Promise.all([
        axios.get('/api/courses'),
        axios.get('/api/posts')
      ]);

      // Filter courses taught by this teacher
      const myCourses = coursesRes.data.filter(c => c.teacher._id === user.id);
      setCourses(myCourses);
      setPosts(postsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/courses', newCourse);
      setCourses([res.data, ...courses]);
      setNewCourse({ title: '', description: '', moodleCourseId: '' });
      setShowCreateCourse(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const renderCourses = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>My Courses</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowCreateCourse(!showCreateCourse)}
        >
          {showCreateCourse ? 'Cancel' : '+ Create Course'}
        </button>
      </div>

      {showCreateCourse && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Create New Course</h3>
          <form onSubmit={handleCreateCourse}>
            <div className="input-group">
              <label>Course Title</label>
              <input
                type="text"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                rows="3"
                required
              />
            </div>
            <div className="input-group">
              <label>Moodle Course ID (optional)</label>
              <input
                type="text"
                value={newCourse.moodleCourseId}
                onChange={(e) => setNewCourse({ ...newCourse, moodleCourseId: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              Create Course
            </button>
          </form>
        </div>
      )}

      <div className="courses-grid">
        {courses.length === 0 ? (
          <div className="card">
            <p>You haven't created any courses yet. Click "Create Course" to get started!</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course._id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span>👥 {course.students?.length || 0} students</span>
                <span>📝 {course.assignments?.length || 0} assignments</span>
              </div>
              {course.moodleCourseId && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#65676b' }}>
                  Moodle ID: {course.moodleCourseId}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderFeed = () => (
    <div className="feed">
      <h2>Social Feed</h2>
      <CreatePost onPostCreated={handlePostCreated} />
      {posts.map(post => (
        <Post key={post._id} post={post} onUpdate={handlePostUpdate} />
      ))}
    </div>
  );

  const renderMoodle = () => (
    <div>
      <h2>Moodle Integration</h2>
      <div className="card">
        <h3>Sync with Moodle</h3>
        <p>Connect your courses with Moodle to sync assignments, grades, and student data.</p>
        <div style={{ marginTop: '20px' }}>
          <h4>Available Features:</h4>
          <ul style={{ marginTop: '10px', lineHeight: '2' }}>
            <li>✅ Import courses from Moodle</li>
            <li>✅ Sync assignments and deadlines</li>
            <li>✅ View student submissions</li>
            <li>✅ Update grades in Moodle</li>
          </ul>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '20px' }}>
          Sync with Moodle
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} menuItems={menuItems} />
        <div className="main-content">
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'feed' && renderFeed()}
          {activeTab === 'moodle' && renderMoodle()}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
