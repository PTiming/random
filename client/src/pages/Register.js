import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiBook } from 'react-icons/fi';
import './Auth.css';

const Register = () => {
  const { register, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    institution: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    await register(registerData);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-container-wide">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">EduConnect</span>
          </div>
          <h1>Create Account</h1>
          <p>Join your educational community</p>
        </div>

        {(error || validationError) && (
          <div className="auth-error">
            {error || validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="firstName">First Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="lastName">Last Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="input"
                required
              />
            </div>
          </div>

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
            <label htmlFor="institution">Institution (Optional)</label>
            <div className="input-wrapper">
              <FiBook className="input-icon" />
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                placeholder="Your school or university"
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
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
                  placeholder="Create password"
                  className="input"
                  required
                  minLength={6}
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

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
