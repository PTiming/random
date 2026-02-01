import { createSlice } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setUser, logout, setLoading } = authSlice.actions;

export const checkAuth = () => async (dispatch) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await api.get('/auth/me');
      dispatch(setUser({ user: response.data.user, token }));
    } catch (error) {
      dispatch(logout());
    }
  } else {
    dispatch(setLoading(false));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const response = await api.post('/auth/login', credentials);
    dispatch(setUser(response.data));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Login failed' };
  }
};

export const loginWithMoodle = (credentials) => async (dispatch) => {
  try {
    const response = await api.post('/auth/moodle-login', credentials);
    dispatch(setUser(response.data));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Moodle login failed' };
  }
};

export const register = (userData) => async (dispatch) => {
  try {
    const response = await api.post('/auth/register', userData);
    dispatch(setUser(response.data));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Registration failed' };
  }
};

export default authSlice.reducer;
