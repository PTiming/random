import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
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
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data)
};

// User API
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  syncWithMoodle: (id, direction) => api.post(`/users/${id}/sync-moodle`, { direction })
};

// Course API
export const courseAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollInCourse: (id, userId) => api.post(`/courses/${id}/enroll`, { userId }),
  unenrollFromCourse: (id, userId) => api.delete(`/courses/${id}/enroll`, { data: { userId } }),
  getCourseStudents: (id, params) => api.get(`/courses/${id}/students`, { params }),
  syncWithMoodle: (id, direction) => api.post(`/courses/${id}/sync-moodle`, { direction })
};

// Grade API
export const gradeAPI = {
  getMyGrades: () => api.get('/grades/my-grades'),
  getCourseGrades: (courseId, userId) => api.get(`/grades/course/${courseId}`, { params: { userId } }),
  getAllCourseGrades: (courseId, params) => api.get(`/grades/course/${courseId}/all`, { params }),
  createGrade: (data) => api.post('/grades', data),
  updateGrade: (id, data) => api.put(`/grades/${id}`, data),
  deleteGrade: (id) => api.delete(`/grades/${id}`),
  syncFromMoodle: (userId, courseId) => api.post('/grades/sync-moodle', { userId, courseId })
};

// Moodle API
export const moodleAPI = {
  testConnection: () => api.get('/moodle/test-connection'),
  getMoodleCourses: () => api.get('/moodle/courses'),
  importCourse: (moodleCourseId) => api.post('/moodle/import-course', { moodleCourseId }),
  getSyncHistory: (params) => api.get('/moodle/sync-history', { params }),
  fullSync: (courseId) => api.post('/moodle/full-sync', { courseId })
};

export default api;
