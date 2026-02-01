import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalPosts: 0,
    totalStudents: 0,
    totalTeachers: 0
  });

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'users', label: '👥 Users' },
    { id: 'courses', label: '📚 Courses' },
    { id: 'feed', label: '📰 Social Feed' },
    { id: 'moodle', label: '🎓 Moodle Integration' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, coursesRes, postsRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/courses'),
        axios.get('/api/posts')
      ]);

      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setPosts(postsRes.data);

      const students = usersRes.data.filter(u => u.role === 'student').length;
      const teachers = usersRes.data.filter(u => u.role === 'teacher').length;

      setStats({
        totalUsers: usersRes.data.length,
        totalCourses: coursesRes.data.length,
        totalPosts: postsRes.data.length,
        totalStudents: students,
        totalTeachers: teachers
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setStats({ ...stats, totalPosts: stats.totalPosts + 1 });
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const renderDashboard = () => (
    <div>
      <h2>Admin Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="number">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <h3>Total Students</h3>
          <div className="number">{stats.totalStudents}</div>
        </div>
        <div className="stat-card">
          <h3>Total Teachers</h3>
          <div className="number">{stats.totalTeachers}</div>
        </div>
        <div className="stat-card">
          <h3>Total Courses</h3>
          <div className="number">{stats.totalCourses}</div>
        </div>
        <div className="stat-card">
          <h3>Total Posts</h3>
          <div className="number">{stats.totalPosts}</div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <h2>All Users</h2>
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Enrolled Courses</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.enrolledCourses?.length || 0}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div>
      <h2>All Courses</h2>
      <div className="courses-grid">
        {courses.map(course => (
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
          </div>
        ))}
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
        <h3>Moodle Configuration</h3>
        <p>Configure your Moodle integration settings in the .env file:</p>
        <ul style={{ marginTop: '15px', lineHeight: '2' }}>
          <li><strong>MOODLE_URL:</strong> Your Moodle instance URL</li>
          <li><strong>MOODLE_TOKEN:</strong> Your Moodle webservice token</li>
        </ul>
        <div style={{ marginTop: '20px' }}>
          <h4>Features:</h4>
          <ul style={{ marginTop: '10px', lineHeight: '2' }}>
            <li>✅ Sync courses from Moodle</li>
            <li>✅ Import user data from Moodle</li>
            <li>✅ Sync assignments and grades</li>
            <li>✅ Real-time course updates</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} menuItems={menuItems} />
        <div className="main-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'feed' && renderFeed()}
          {activeTab === 'moodle' && renderMoodle()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
