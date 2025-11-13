import axios from 'axios'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', message);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', message);
          break;
        case 429:
          // Rate limited
          console.error('Rate limited:', message);
          break;
        case 500:
          // Server error
          console.error('Server error:', message);
          break;
        default:
          console.error('API error:', message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
};

// Tasks API methods
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  getStats: () => api.get('/tasks/stats/overview'),
  bulkUpdate: (data) => api.patch('/tasks/bulk-update', data),
  search: (query) => api.get('/tasks/search', { params: { q: query } }),
  
  // Task comments
  addComment: (taskId, commentData) => api.post(`/tasks/${taskId}/comments`, commentData),
  updateComment: (taskId, commentId, commentData) => api.put(`/tasks/${taskId}/comments/${commentId}`, commentData),
  deleteComment: (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`),
  
  // Task time logs
  addTimeLog: (taskId, timeLogData) => api.post(`/tasks/${taskId}/time-logs`, timeLogData),
  deleteTimeLog: (taskId, timeLogId) => api.delete(`/tasks/${taskId}/time-logs/${timeLogId}`),
  
  // Task attachments
  addAttachment: (taskId, formData) => api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAttachment: (taskId, attachmentId) => api.delete(`/tasks/${taskId}/attachments/${attachmentId}`),
  
  // Task actions
  archive: (taskId) => api.patch(`/tasks/${taskId}/archive`),
  unarchive: (taskId) => api.patch(`/tasks/${taskId}/unarchive`),
  duplicate: (taskId) => api.post(`/tasks/${taskId}/duplicate`),
};

// Users API methods
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAvatar: () => api.delete('/users/avatar'),
  getStats: () => api.get('/users/stats/personal'),
  getUserTasks: (params) => api.get('/users/tasks', { params }),
  
  // Admin only methods
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, roleData) => api.put(`/users/${id}/role`, roleData),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  activate: (id) => api.patch(`/users/${id}/activate`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health')
};

// Export axios instance for custom requests
export default api;
