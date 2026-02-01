import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
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

// Handle response errors
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

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  verifyToken: () => api.get('/auth/verify')
};

// Users API
export const usersAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  searchUsers: (query) => api.get('/users/search', { params: { query } }),
  getSuggestedUsers: () => api.get('/users/suggested'),
  getUserPosts: (userId, params) => api.get(`/users/${userId}/posts`, { params }),
  getUserFriends: (userId) => api.get(`/users/${userId}/friends`),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`)
};

// Posts API
export const postsAPI = {
  getFeed: (params) => api.get('/posts/feed', { params }),
  getPost: (postId) => api.get(`/posts/${postId}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (postId, data) => api.put(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  addComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
  sharePost: (postId, data) => api.post(`/posts/${postId}/share`, data),
  getPostsByTag: (tag, params) => api.get(`/posts/tag/${tag}`, { params }),
  getMoodlePosts: (params) => api.get('/posts/moodle', { params })
};

// Friends API
export const friendsAPI = {
  getFriends: () => api.get('/friends'),
  getPendingRequests: () => api.get('/friends/requests'),
  getSentRequests: () => api.get('/friends/requests/sent'),
  getMutualFriends: (userId) => api.get(`/friends/mutual/${userId}`),
  sendRequest: (userId) => api.post(`/friends/request/${userId}`),
  acceptRequest: (userId) => api.post(`/friends/accept/${userId}`),
  rejectRequest: (userId) => api.post(`/friends/reject/${userId}`),
  cancelRequest: (userId) => api.delete(`/friends/request/${userId}`),
  removeFriend: (userId) => api.delete(`/friends/${userId}`)
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId, params) => api.get(`/messages/conversation/${userId}`, { params }),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  getUnreadCount: () => api.get('/messages/unread')
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read/all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  deleteAll: () => api.delete('/notifications')
};

// Search API
export const searchAPI = {
  globalSearch: (query, type = 'all', params = {}) => 
    api.get('/search', { params: { query, type, ...params } }),
  getSuggestions: (query) => api.get('/search/suggestions', { params: { query } }),
  searchByHashtag: (tag, params) => api.get(`/search/hashtag/${tag}`, { params }),
  getTrending: (params) => api.get('/search/trending', { params })
};

// Moodle API
export const moodleAPI = {
  // Connection
  getStatus: () => api.get('/moodle/status'),
  connect: (data) => api.post('/moodle/connect', data),
  disconnect: () => api.delete('/moodle/disconnect'),
  
  // Read operations (from Moodle)
  getCourses: () => api.get('/moodle/courses'),
  getCourseContent: (courseId) => api.get(`/moodle/courses/${courseId}`),
  getCourseParticipants: (courseId) => api.get(`/moodle/courses/${courseId}/participants`),
  getCourseCompletion: (courseId) => api.get(`/moodle/courses/${courseId}/completion`),
  searchCourses: (query) => api.get('/moodle/search', { params: { query } }),
  getGrades: (courseId) => api.get('/moodle/grades', { params: { courseId } }),
  getAssignments: (courseIds) => api.get('/moodle/assignments', { params: { courseIds } }),
  getAssignmentStatus: (assignmentId) => api.get(`/moodle/assignments/${assignmentId}/status`),
  getCalendarEvents: () => api.get('/moodle/calendar'),
  getMoodleNotifications: () => api.get('/moodle/notifications'),
  getForumDiscussions: (forumId, params) => api.get(`/moodle/forums/${forumId}/discussions`, { params }),
  
  // Write operations (to Moodle - two-way sync)
  submitAssignment: (assignmentId, data) => api.post(`/moodle/assignments/${assignmentId}/submit`, data),
  createForumDiscussion: (forumId, data) => api.post(`/moodle/forums/${forumId}/discussion`, data),
  replyToForumPost: (postId, data) => api.post(`/moodle/forums/posts/${postId}/reply`, data),
  sendMoodleMessage: (data) => api.post('/moodle/messages', data),
  markMoodleMessagesRead: (conversationId) => api.put('/moodle/messages/read', { conversationId }),
  createCalendarEvent: (data) => api.post('/moodle/calendar/events', data),
  deleteCalendarEvent: (eventId) => api.delete(`/moodle/calendar/events/${eventId}`),
  markMoodleNotificationsRead: (data) => api.put('/moodle/notifications/read', data),
  selfEnroll: (courseId, password) => api.post(`/moodle/courses/${courseId}/enroll`, { password }),
  completeActivity: (cmid, completed = true) => api.post(`/moodle/activities/${cmid}/complete`, { completed }),
  
  // Sharing to platform
  shareCoursePost: (data) => api.post('/moodle/share', data),
  shareAchievement: (data) => api.post('/moodle/achievement', data)
};
