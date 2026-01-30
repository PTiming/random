import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getCurrentUser = () => api.get('/auth/me');

// Posts
export const getPosts = () => api.get('/posts');
export const createPost = (data) => api.post('/posts', data);
export const likePost = (id) => api.put(`/posts/${id}/like`);
export const addComment = (id, text) => api.post(`/posts/${id}/comment`, { text });
export const deletePost = (id) => api.delete(`/posts/${id}`);

// Users
export const getUser = (id) => api.get(`/users/${id}`);
export const updateProfile = (data) => api.put('/users/profile', data);
export const followUser = (id) => api.put(`/users/${id}/follow`);

// Moodle
export const linkMoodleAccount = (moodleUserId) => api.post('/moodle/link-account', { moodleUserId });
export const getMoodleCourses = () => api.get('/moodle/courses');
export const getMoodleGrades = (courseId) => api.get(`/moodle/grades/${courseId}`);
export const syncMoodleData = (courseId) => api.post(`/moodle/sync/${courseId}`);
export const getMoodleData = () => api.get('/moodle/data');

export default api;
