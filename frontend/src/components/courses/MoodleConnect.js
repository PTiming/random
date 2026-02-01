import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './Courses.css';

const MoodleConnect = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    moodleUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkMoodleStatus();
  }, []);

  const checkMoodleStatus = async () => {
    try {
      const res = await api.get('/moodle/status');
      setStatus(res.data);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/moodle/connect', formData);
      setSuccess('Successfully connected to Moodle!');
      updateUser({ moodleConnected: true });
      setStatus({ connected: true, moodleUser: res.data.moodleUser });
      setFormData({ username: '', password: '', moodleUrl: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to Moodle');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect from Moodle?')) return;

    setLoading(true);
    try {
      await api.delete('/moodle/disconnect');
      updateUser({ moodleConnected: false });
      setStatus({ connected: false });
      setSuccess('Disconnected from Moodle');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="moodle-connect">
        <h1 className="page-title">Moodle Connection</h1>
        <p className="page-subtitle">
          Connect your Moodle account to sync your courses, grades, and assignments.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {status?.connected ? (
          <div className="connected-card card">
            <div className="connected-header">
              <span className="connected-icon">✅</span>
              <div>
                <h3>Connected to Moodle</h3>
                <p>Your account is linked to Moodle</p>
              </div>
            </div>

            {status.moodleUser && (
              <div className="moodle-user-info">
                <div className="info-item">
                  <span className="info-label">Username</span>
                  <span className="info-value">{status.moodleUser.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{status.moodleUser.fullname}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Site</span>
                  <span className="info-value">{status.moodleUser.sitename}</span>
                </div>
              </div>
            )}

            <div className="connected-actions">
              <Link to="/courses" className="btn btn-primary">
                View My Courses
              </Link>
              <button
                onClick={handleDisconnect}
                className="btn btn-danger"
                disabled={loading}
              >
                {loading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        ) : (
          <div className="connect-card card">
            <h2>Connect Your Moodle Account</h2>
            <p>Enter your Moodle credentials to link your account.</p>

            <form onSubmit={handleConnect} className="connect-form">
              <div className="form-group">
                <label className="form-label">Moodle URL (Optional)</label>
                <input
                  type="url"
                  name="moodleUrl"
                  value={formData.moodleUrl}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="https://moodle.yourschool.edu"
                />
                <small className="form-help">
                  Leave blank to use the default Moodle instance
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Moodle Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your Moodle username"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Moodle Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your Moodle password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? <span className="spinner"></span> : 'Connect to Moodle'}
              </button>
            </form>

            <div className="connect-info">
              <h4>What happens when you connect?</h4>
              <ul>
                <li>📚 Your enrolled courses will be synced</li>
                <li>📊 You can view your grades and progress</li>
                <li>📝 Access your assignments and deadlines</li>
                <li>💬 Discuss course content with classmates</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodleConnect;
