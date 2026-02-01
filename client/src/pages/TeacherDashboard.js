import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import api from '../utils/api';

function TeacherDashboard() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    moodleCourseId: ''
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && user.role === 'teacher') {
      fetchPosts();
      fetchCourses();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      const myCourses = response.data.filter(c => c.instructor._id === user._id);
      setCourses(myCourses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', newCourse);
      setNewCourse({ title: '', description: '', moodleCourseId: '' });
      setShowCreateCourse(false);
      fetchCourses();
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      
      <div className="container">
        <h1 style={{ marginTop: '30px', marginBottom: '30px' }}>Teacher Dashboard</h1>
        
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-value">{courses.length}</div>
            <div className="stat-label">My Courses</div>
          </div>
          <div className="stat-card green">
            <div className="stat-value">
              {courses.reduce((acc, c) => acc + (c.students?.length || 0), 0)}
            </div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-value">
              {courses.reduce((acc, c) => acc + (c.materials?.length || 0), 0)}
            </div>
            <div className="stat-label">Course Materials</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-value">
              {courses.reduce((acc, c) => acc + (c.announcements?.length || 0), 0)}
            </div>
            <div className="stat-label">Announcements</div>
          </div>
        </div>
        
        <div className="dashboard-grid">
          <div className="sidebar">
            <div 
              className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              📚 My Courses
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              📝 Social Feed
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'moodle' ? 'active' : ''}`}
              onClick={() => setActiveTab('moodle')}
            >
              🎓 Moodle Sync
            </div>
          </div>
          
          <div className="main-content">
            {activeTab === 'overview' && (
              <div className="card">
                <h2>Welcome, {user?.name}!</h2>
                <p style={{ marginTop: '15px' }}>
                  You have access to {courses.length} courses with a total of{' '}
                  {courses.reduce((acc, c) => acc + (c.students?.length || 0), 0)} students.
                </p>
                <ul style={{ marginTop: '20px', lineHeight: '1.8' }}>
                  <li>Create and manage courses</li>
                  <li>Upload course materials and resources</li>
                  <li>Post announcements to your students</li>
                  <li>Sync with Moodle courses</li>
                  <li>Interact with students through social feed</li>
                </ul>
              </div>
            )}
            
            {activeTab === 'courses' && (
              <>
                <button 
                  className="btn btn-primary" 
                  style={{ marginBottom: '20px' }}
                  onClick={() => setShowCreateCourse(!showCreateCourse)}
                >
                  {showCreateCourse ? 'Cancel' : '+ Create New Course'}
                </button>
                
                {showCreateCourse && (
                  <div className="card">
                    <h3>Create New Course</h3>
                    <form onSubmit={handleCreateCourse}>
                      <div className="form-group">
                        <label className="form-label">Course Title</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newCourse.title}
                          onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-input"
                          rows="4"
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Moodle Course ID (Optional)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newCourse.moodleCourseId}
                          onChange={(e) => setNewCourse({...newCourse, moodleCourseId: e.target.value})}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary">Create Course</button>
                    </form>
                  </div>
                )}
                
                {courses.length === 0 ? (
                  <div className="empty-state">
                    <h3>No courses yet</h3>
                    <p>Create your first course to get started</p>
                  </div>
                ) : (
                  courses.map(course => (
                    <div key={course._id} className="card">
                      <h3>{course.title}</h3>
                      <p style={{ marginTop: '10px', color: '#65676b' }}>{course.description}</p>
                      <div style={{ marginTop: '15px', display: 'flex', gap: '20px' }}>
                        <div>
                          <strong>Students:</strong> {course.students?.length || 0}
                        </div>
                        <div>
                          <strong>Materials:</strong> {course.materials?.length || 0}
                        </div>
                        <div>
                          <strong>Announcements:</strong> {course.announcements?.length || 0}
                        </div>
                      </div>
                      {course.moodleCourseId && (
                        <div style={{ marginTop: '10px' }}>
                          <span className="badge badge-teacher">Synced with Moodle</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
            
            {activeTab === 'posts' && (
              <>
                <CreatePost onPostCreated={(post) => setPosts([post, ...posts])} />
                
                {posts.length === 0 ? (
                  <div className="empty-state">
                    <h3>No posts yet</h3>
                    <p>Create your first post to share with students</p>
                  </div>
                ) : (
                  posts.map(post => (
                    <Post key={post._id} post={post} onUpdate={handlePostUpdate} />
                  ))
                )}
              </>
            )}
            
            {activeTab === 'moodle' && (
              <div className="card">
                <h2>Moodle Integration</h2>
                <p>Sync your courses with Moodle to import students, materials, and grades.</p>
                
                <div style={{ marginTop: '20px' }}>
                  <h3>Available Moodle Courses</h3>
                  <p style={{ color: '#65676b', marginTop: '10px' }}>
                    Configure Moodle settings in the environment to see available courses.
                  </p>
                  
                  <button className="btn btn-primary" style={{ marginTop: '20px' }}>
                    Sync with Moodle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
