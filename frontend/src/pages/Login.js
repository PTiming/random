import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Login() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useChat();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}/api/users/join`, {
        username: username.trim(),
      });
      login(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>💬 Join ChatApp</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>
          Enter a username to start chatting
        </p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              minLength={2}
              autoFocus
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Joining...' : 'Join Chat'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
