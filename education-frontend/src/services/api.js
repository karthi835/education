// ============================================================
// services/api.js - Axios API Service
// Centralized HTTP client with JWT interceptor for all API calls
// ============================================================

import axios from 'axios';

// Base API URL - uses Vite proxy in development
const API_BASE_URL = '/api';

// Create Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token to every request
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

// Response interceptor: handle 401 errors (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ==================== STUDENTS API ====================

export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  bulkCreate: (data) => api.post('/students/bulk', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// ==================== UPLOAD API ====================

export const uploadAPI = {
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000, // 10 minutes for large files (1 lakh+ records)
      onUploadProgress,
    });
  },
  previewExcelFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getUploadStatus: (uploadId) => api.get(`/uploads/${uploadId}/status`),
  getHistory: () => api.get('/uploads'),
};

// ==================== DASHBOARD API ====================

export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
  getCourses: () => api.get('/courses'),
  getDepartments: () => api.get('/departments'),
};

// ==================== USERS API ====================

export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ==================== EXPORT API ====================

export const exportAPI = {
  exportExcel: (params) =>
    api.get('/export/excel', { params, responseType: 'blob' }),
  exportCSV: (params) =>
    api.get('/export/csv', { params, responseType: 'blob' }),
};

export default api;

