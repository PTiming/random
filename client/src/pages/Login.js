import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiBook } from 'react-icons/fi';
import './Auth.css';

const Login = () => {
  const { login, loginWithMoodle, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMoodleLogin, setShowMoodleLogin] = useState(false);
  const [moodleData, setMoodleData] = useState({
    moodleUrl: '',
    moodleToken: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMoodleChange = (e) => {
    setMoodleData({ ...moodleData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(formData.email, formData.password);
    setLoading(false);
  };

  const handleMoodleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await loginWithMoodle(moodleData.moodleToken, moodleData.moodleUrl);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">EduConnect</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to your account</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {!showMoodleLogin ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-lg w-full moodle-btn"
              onClick={() => setShowMoodleLogin(true)}
            >
              <FiBook />
              Sign in with Moodle
            </button>
          </form>
        ) : (
          <form onSubmit={handleMoodleLogin} className="auth-form">
            <div className="input-group">
              <label htmlFor="moodleUrl">Moodle URL</label>
              <div className="input-wrapper">
                <FiBook className="input-icon" />
                <input
                  type="url"
                  id="moodleUrl"
                  name="moodleUrl"
                  value={moodleData.moodleUrl}
                  onChange={handleMoodleChange}
                  placeholder="https://your-moodle-site.com"
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="moodleToken">Moodle Token</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type="text"
                  id="moodleToken"
                  name="moodleToken"
                  value={moodleData.moodleToken}
                  onChange={handleMoodleChange}
                  placeholder="Enter your Moodle token"
                  className="input"
                  required
                />
              </div>
              <p className="input-hint">
                You can find your token in Moodle under Site administration → Plugins → Web services → Manage tokens
              </p>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign in with Moodle'}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-lg w-full"
              onClick={() => setShowMoodleLogin(false)}
            >
              Back to Email Login
            </button>
          </form>
        )}

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
