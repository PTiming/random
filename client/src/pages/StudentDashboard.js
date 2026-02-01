import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);

  const menuItems = [
    { id: 'feed', label: '📰 Social Feed' },
    { id: 'courses', label: '📚 My Courses' },
    { id: 'browse', label: '🔍 Browse Courses' },
    { id: 'moodle', label: '🎓 Moodle Integration' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, postsRes, userRes] = await Promise.all([
        axios.get('/api/courses'),
        axios.get('/api/posts'),
        axios.get(`/api/users/${user.id}`)
      ]);

      setCourses(coursesRes.data);
      setPosts(postsRes.data);
      
      // Filter enrolled courses
      const enrolled = coursesRes.data.filter(c => 
        c.students?.some(s => s._id === user.id)
      );
      setEnrolledCourses(enrolled);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`/api/courses/${courseId}/enroll`);
      fetchData(); // Refresh data
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

  const renderFeed = () => (
    <div className="feed">
      <h2>Social Feed</h2>
      <CreatePost onPostCreated={handlePostCreated} />
      {posts.map(post => (
        <Post key={post._id} post={post} onUpdate={handlePostUpdate} />
      ))}
    </div>
  );

  const renderMyCourses = () => (
    <div>
      <h2>My Courses</h2>
      {enrolledCourses.length === 0 ? (
        <div className="card">
          <p>You are not enrolled in any courses yet. Browse available courses to get started!</p>
        </div>
      ) : (
        <div className="courses-grid">
          {enrolledCourses.map(course => (
            <div key={course._id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span>👨‍🏫 {course.teacher?.name}</span>
                <span>👥 {course.students?.length || 0} students</span>
              </div>
              {course.assignments?.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <strong>Assignments ({course.assignments.length}):</strong>
                  <ul style={{ marginTop: '10px', lineHeight: '1.8' }}>
                    {course.assignments.slice(0, 3).map((assignment, idx) => (
                      <li key={idx} style={{ fontSize: '14px' }}>
                        {assignment.title}
                        {assignment.dueDate && (
                          <span style={{ color: '#65676b', marginLeft: '10px' }}>
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {course.moodleCourseId && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#65676b' }}>
                  Moodle ID: {course.moodleCourseId}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBrowseCourses = () => {
    const availableCourses = courses.filter(c => 
      !c.students?.some(s => s._id === user.id)
    );

    return (
      <div>
        <h2>Browse Courses</h2>
        {availableCourses.length === 0 ? (
          <div className="card">
            <p>No available courses at the moment. You're enrolled in all available courses!</p>
          </div>
        ) : (
          <div className="courses-grid">
            {availableCourses.map(course => (
              <div key={course._id} className="course-card">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span>👨‍🏫 {course.teacher?.name}</span>
                  <span>👥 {course.students?.length || 0} students</span>
                </div>
                {course.moodleCourseId && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#65676b' }}>
                    Moodle ID: {course.moodleCourseId}
                  </div>
                )}
                <button 
                  className="btn btn-secondary" 
                  style={{ marginTop: '15px', width: '100%' }}
                  onClick={() => handleEnroll(course._id)}
                >
                  Enroll
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMoodle = () => (
    <div>
      <h2>Moodle Integration</h2>
      <div className="card">
        <h3>Your Moodle Account</h3>
        <p>Access your Moodle courses and assignments directly from this platform.</p>
        <div style={{ marginTop: '20px' }}>
          <h4>Available Features:</h4>
          <ul style={{ marginTop: '10px', lineHeight: '2' }}>
            <li>✅ View Moodle courses</li>
            <li>✅ Access assignments and deadlines</li>
            <li>✅ Submit assignments</li>
            <li>✅ Check grades and feedback</li>
          </ul>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '20px' }}>
          Connect to Moodle
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
          {activeTab === 'feed' && renderFeed()}
          {activeTab === 'courses' && renderMyCourses()}
          {activeTab === 'browse' && renderBrowseCourses()}
          {activeTab === 'moodle' && renderMoodle()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
