import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

function Register({ setUser }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await register(formData);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-left">
          <div className="auth-logo">social</div>
          <div className="auth-tagline">
            Join Social today to connect with friends and explore courses.
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-box">
            <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>Sign Up</h2>
            {error && <div className="auth-error">{error}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Username"
                className="auth-input"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="auth-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="auth-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength="6"
              />
              <button type="submit" className="auth-btn" style={{ backgroundColor: '#42b72a' }}>
                Sign Up
              </button>
            </form>
            <div className="auth-link">
              <Link to="/login" style={{ color: '#1877f2', textDecoration: 'none' }}>
                Already have an account?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
