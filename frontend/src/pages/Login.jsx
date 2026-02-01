import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { login, loginWithMoodle } from '../store/authSlice';
import './Auth.css';

function Login() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useMoodle, setUseMoodle] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const credentials = useMoodle 
      ? { username: email, password }
      : { email, password };

    const result = useMoodle
      ? await dispatch(loginWithMoodle(credentials))
      : await dispatch(login(credentials));

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>MERN Social Network</h1>
        <p className="auth-subtitle">Connect with your academic community</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={useMoodle ? "Moodle Username" : "Email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary full-width">
            {useMoodle ? 'Login with Moodle' : 'Login'}
          </button>
        </form>

        <div className="auth-toggle">
          <label>
            <input
              type="checkbox"
              checked={useMoodle}
              onChange={(e) => setUseMoodle(e.target.checked)}
            />
            Use Moodle SSO
          </label>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
