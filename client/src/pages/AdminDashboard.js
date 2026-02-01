import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';

function AdminDashboard() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalCourses: 0
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      
      const stats = {
        totalUsers: response.data.length,
        totalTeachers: response.data.filter(u => u.role === 'teacher').length,
        totalStudents: response.data.filter(u => u.role === 'student').length,
        totalCourses: 0
      };
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      
      <div className="container">
        <h1 style={{ marginTop: '30px', marginBottom: '30px' }}>Admin Dashboard</h1>
        
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card green">
            <div className="stat-value">{stats.totalTeachers}</div>
            <div className="stat-label">Teachers</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-label">Students</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-value">{stats.totalCourses}</div>
            <div className="stat-label">Courses</div>
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
              className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Manage Users
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'moodle' ? 'active' : ''}`}
              onClick={() => setActiveTab('moodle')}
            >
              🎓 Moodle Integration
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Settings
            </div>
          </div>
          
          <div className="main-content">
            {activeTab === 'overview' && (
              <div className="card">
                <h2>System Overview</h2>
                <p>Welcome to the Admin Dashboard. You have full control over the system.</p>
                <ul style={{ marginTop: '20px', lineHeight: '1.8' }}>
                  <li>Manage all users (Admin, Teachers, Students)</li>
                  <li>Monitor system activity and statistics</li>
                  <li>Configure Moodle integration settings</li>
                  <li>Access all courses and content</li>
                </ul>
              </div>
            )}
            
            {activeTab === 'users' && (
              <div className="card">
                <h2>User Management</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge badge-${user.role}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'moodle' && (
              <div className="card">
                <h2>Moodle Integration</h2>
                <p>Configure and manage Moodle integration settings.</p>
                
                <div style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Moodle URL</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="https://your-moodle-instance.com"
                      defaultValue={process.env.REACT_APP_MOODLE_URL || ''}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Moodle Token</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="Your Moodle webservice token"
                    />
                  </div>
                  
                  <button className="btn btn-primary">
                    Save Settings
                  </button>
                  <button className="btn btn-secondary" style={{ marginLeft: '10px' }}>
                    Test Connection
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="card">
                <h2>System Settings</h2>
                <p>Configure general system settings.</p>
                
                <div style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">
                      <input type="checkbox" /> Allow user registration
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <input type="checkbox" defaultChecked /> Enable email notifications
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <input type="checkbox" defaultChecked /> Require Moodle sync
                    </label>
                  </div>
                  
                  <button className="btn btn-primary">
                    Save Settings
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

export default AdminDashboard;
