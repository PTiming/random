import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import api from '../utils/api';

function StudentDashboard() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && user.role === 'student') {
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
      const enrolled = response.data.filter(c => 
        c.students?.some(s => s._id === user._id)
      );
      const available = response.data.filter(c => 
        !c.students?.some(s => s._id === user._id)
      );
      setCourses(enrolled);
      setAvailableCourses(available);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      fetchCourses();
    } catch (error) {
      console.error('Failed to enroll:', error);
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
        <h1 style={{ marginTop: '30px', marginBottom: '30px' }}>Student Dashboard</h1>
        
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-value">{courses.length}</div>
            <div className="stat-label">Enrolled Courses</div>
          </div>
          <div className="stat-card green">
            <div className="stat-value">
              {courses.reduce((acc, c) => acc + (c.materials?.length || 0), 0)}
            </div>
            <div className="stat-label">Course Materials</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-value">
              {courses.reduce((acc, c) => acc + (c.announcements?.length || 0), 0)}
            </div>
            <div className="stat-label">Announcements</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-value">{availableCourses.length}</div>
            <div className="stat-label">Available Courses</div>
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
              className={`sidebar-item ${activeTab === 'browse' ? 'active' : ''}`}
              onClick={() => setActiveTab('browse')}
            >
              🔍 Browse Courses
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
                  You are enrolled in {courses.length} courses. 
                  {availableCourses.length > 0 && ` There are ${availableCourses.length} more courses available to join.`}
                </p>
                <ul style={{ marginTop: '20px', lineHeight: '1.8' }}>
                  <li>Browse and enroll in available courses</li>
                  <li>Access course materials and resources</li>
                  <li>View announcements from your teachers</li>
                  <li>Sync with your Moodle courses</li>
                  <li>Connect with classmates through social feed</li>
                </ul>
              </div>
            )}
            
            {activeTab === 'courses' && (
              <>
                {courses.length === 0 ? (
                  <div className="empty-state">
                    <h3>No enrolled courses</h3>
                    <p>Browse available courses to get started</p>
                  </div>
                ) : (
                  courses.map(course => (
                    <div key={course._id} className="card">
                      <h3>{course.title}</h3>
                      <p style={{ marginTop: '10px', color: '#65676b' }}>{course.description}</p>
                      <div style={{ marginTop: '15px' }}>
                        <strong>Instructor:</strong> {course.instructor?.name}
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', gap: '20px' }}>
                        <div>
                          <strong>Students:</strong> {course.students?.length || 0}
                        </div>
                        <div>
                          <strong>Materials:</strong> {course.materials?.length || 0}
                        </div>
                      </div>
                      
                      {course.announcements && course.announcements.length > 0 && (
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e4e6eb' }}>
                          <h4>Recent Announcements</h4>
                          {course.announcements.slice(0, 3).map((announcement, idx) => (
                            <div key={idx} style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f2f5', borderRadius: '5px' }}>
                              <div style={{ fontWeight: '500' }}>{announcement.title}</div>
                              <div style={{ fontSize: '14px', marginTop: '5px' }}>{announcement.content}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {course.materials && course.materials.length > 0 && (
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e4e6eb' }}>
                          <h4>Course Materials</h4>
                          {course.materials.map((material, idx) => (
                            <div key={idx} style={{ marginTop: '10px' }}>
                              📄 {material.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
            
            {activeTab === 'browse' && (
              <>
                {availableCourses.length === 0 ? (
                  <div className="empty-state">
                    <h3>No available courses</h3>
                    <p>You are enrolled in all available courses</p>
                  </div>
                ) : (
                  <>
                    <div className="card">
                      <h2>Available Courses</h2>
                      <p>Enroll in courses that interest you</p>
                    </div>
                    
                    {availableCourses.map(course => (
                      <div key={course._id} className="card">
                        <h3>{course.title}</h3>
                        <p style={{ marginTop: '10px', color: '#65676b' }}>{course.description}</p>
                        <div style={{ marginTop: '15px' }}>
                          <strong>Instructor:</strong> {course.instructor?.name}
                        </div>
                        <div style={{ marginTop: '10px' }}>
                          <strong>Students Enrolled:</strong> {course.students?.length || 0}
                        </div>
                        {course.moodleCourseId && (
                          <div style={{ marginTop: '10px' }}>
                            <span className="badge badge-teacher">Synced with Moodle</span>
                          </div>
                        )}
                        <button 
                          className="btn btn-primary" 
                          style={{ marginTop: '15px' }}
                          onClick={() => handleEnroll(course._id)}
                        >
                          Enroll Now
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
            
            {activeTab === 'posts' && (
              <>
                <CreatePost onPostCreated={(post) => setPosts([post, ...posts])} />
                
                {posts.length === 0 ? (
                  <div className="empty-state">
                    <h3>No posts yet</h3>
                    <p>Be the first to share something!</p>
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
                <p>Connect your account with Moodle to sync your courses and grades.</p>
                
                <div style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Moodle User ID</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Enter your Moodle user ID"
                    />
                  </div>
                  
                  <button className="btn btn-primary">
                    Link Moodle Account
                  </button>
                  <button className="btn btn-secondary" style={{ marginLeft: '10px' }}>
                    Sync Courses
                  </button>
                </div>
                
                <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
                  <strong>ℹ️ Note:</strong> Linking your Moodle account will allow you to:
                  <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
                    <li>Automatically sync enrolled courses</li>
                    <li>Access course materials from Moodle</li>
                    <li>View grades and assignments</li>
                    <li>Participate in Moodle forums</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
