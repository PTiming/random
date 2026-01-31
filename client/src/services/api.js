import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Posts API
export const postsAPI = {
  getAll: (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`),
  getOne: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  like: (id) => api.post(`/posts/${id}/like`),
  comment: (id, text) => api.post(`/posts/${id}/comment`, { text }),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comment/${commentId}`),
  pin: (id) => api.put(`/posts/${id}/pin`)
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  createConversation: (participantId) => api.post('/messages/conversations', { participantId }),
  createGroup: (data) => api.post('/messages/conversations/group', data),
  getMessages: (conversationId, page = 1) => 
    api.get(`/messages/${conversationId}?page=${page}`),
  sendMessage: (conversationId, data) => api.post(`/messages/${conversationId}`, data),
  updateMembers: (conversationId, action, userId) => 
    api.put(`/messages/conversations/${conversationId}/members`, { action, userId })
};

// Groups API
export const groupsAPI = {
  getAll: (params = {}) => api.get('/groups', { params }),
  getOne: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  join: (id) => api.post(`/groups/${id}/join`),
  leave: (id) => api.post(`/groups/${id}/leave`)
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  follow: (id) => api.post(`/users/${id}/follow`),
  getFollowers: (id) => api.get(`/users/${id}/followers`),
  getFollowing: (id) => api.get(`/users/${id}/following`)
};

// Search API
export const searchAPI = {
  search: (query, type = 'all') => api.get(`/search?q=${query}&type=${type}`)
};

export default api;
