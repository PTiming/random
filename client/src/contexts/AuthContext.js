import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');
          setUser(response.data.data.user);
        } catch (err) {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', userData);
      const { token, user: newUser } = response.data.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(newUser);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const loginWithMoodle = async (moodleToken, moodleUrl) => {
    try {
      setError(null);
      const response = await api.post('/auth/moodle', { moodleToken, moodleUrl });
      const { token, user: userData } = response.data.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Moodle authentication failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    loginWithMoodle,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
