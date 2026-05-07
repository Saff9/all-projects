/**
 * API Service Layer
 * Configures axios instance with interceptors for authentication and error handling
 */

import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:3002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      // Handle authentication errors
      if (status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }

      // Handle rate limiting
      if (status === 429) {
        console.warn('Rate limit exceeded. Please slow down.');
      }

      // Handle server errors
      if (status >= 500) {
        console.error('Server error:', data);
      }

      // Return structured error
      return Promise.reject({
        status,
        code: data.code || 'UNKNOWN_ERROR',
        message: data.message || 'An unexpected error occurred',
        data,
      });
    }

    // Handle network errors
    if (error.request) {
      return Promise.reject({
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
      });
    }

    return Promise.reject({
      status: 0,
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
    });
  }
);

export default api;
