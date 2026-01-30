import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';

function Login({ setUser }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(formData);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-left">
          <div className="auth-logo">social</div>
          <div className="auth-tagline">
            Connect with friends and the world around you on Social.
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-box">
            {error && <div className="auth-error">{error}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
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
              />
              <button type="submit" className="auth-btn">
                Log In
              </button>
            </form>
            <div className="auth-divider"></div>
            <Link to="/register">
              <button className="auth-create-btn">Create New Account</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
