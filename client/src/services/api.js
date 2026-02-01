import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  moodleLogin: (moodleToken, moodleUrl) => api.post('/auth/moodle', { moodleToken, moodleUrl }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh')
};

export const usersAPI = {
  search: (params) => api.get('/users', { params }),
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  connect: (userId) => api.post(`/users/${userId}/connect`),
  acceptConnection: (userId) => api.post(`/users/${userId}/accept`),
  removeConnection: (userId) => api.delete(`/users/${userId}/connect`),
  follow: (userId) => api.post(`/users/${userId}/follow`),
  unfollow: (userId) => api.delete(`/users/${userId}/follow`),
  getConnections: (userId) => api.get(`/users/${userId}/connections`)
};

export const postsAPI = {
  getFeed: (params) => api.get('/posts', { params }),
  getPost: (postId) => api.get(`/posts/${postId}`),
  create: (data) => api.post('/posts', data),
  update: (postId, data) => api.put(`/posts/${postId}`, data),
  delete: (postId) => api.delete(`/posts/${postId}`),
  react: (postId, type) => api.post(`/posts/${postId}/react`, { type }),
  unreact: (postId) => api.delete(`/posts/${postId}/react`),
  addComment: (postId, content) => api.post(`/posts/${postId}/comments`, { content }),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
  share: (postId, content) => api.post(`/posts/${postId}/share`, { content })
};

export const messagesAPI = {
  getConversations: (params) => api.get('/messages/conversations', { params }),
  getConversation: (conversationId, params) => api.get(`/messages/conversations/${conversationId}`, { params }),
  createConversation: (data) => api.post('/messages/conversations', data),
  startDirect: (userId) => api.post(`/messages/direct/${userId}`),
  sendMessage: (conversationId, data) => api.post(`/messages/conversations/${conversationId}/messages`, data),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  reactToMessage: (messageId, emoji) => api.post(`/messages/${messageId}/react`, { emoji })
};

export const groupsAPI = {
  getGroups: (params) => api.get('/groups', { params }),
  getGroup: (groupId) => api.get(`/groups/${groupId}`),
  create: (data) => api.post('/groups', data),
  update: (groupId, data) => api.put(`/groups/${groupId}`, data),
  join: (groupId, message) => api.post(`/groups/${groupId}/join`, { message }),
  leave: (groupId) => api.post(`/groups/${groupId}/leave`),
  invite: (groupId, userId) => api.post(`/groups/${groupId}/invite`, { userId }),
  approveMember: (groupId, userId) => api.post(`/groups/${groupId}/members/${userId}/approve`),
  getPosts: (groupId, params) => api.get(`/groups/${groupId}/posts`, { params })
};

export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
  registerPushToken: (token, device, platform) => api.post('/notifications/push-token', { token, device, platform }),
  removePushToken: (token) => api.delete('/notifications/push-token', { data: { token } })
};

export const moodleAPI = {
  getCourses: () => api.get('/moodle/courses'),
  getCourseDetails: (courseId) => api.get(`/moodle/courses/${courseId}`),
  getAssignments: () => api.get('/moodle/assignments'),
  getGrades: () => api.get('/moodle/grades'),
  getCalendar: () => api.get('/moodle/calendar'),
  sync: () => api.post('/moodle/sync'),
  submitAssignment: (assignmentId, data) => api.post('/moodle/submit-assignment', { assignmentId, ...data }),
  getResources: (courseId) => api.get(`/moodle/resources/${courseId}`),
  getNotifications: () => api.get('/moodle/notifications')
};
