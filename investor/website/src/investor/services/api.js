import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '/api';
    }
  }
  return 'https://connect-invest-backend.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ci_investor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Standardize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Check if network is offline
    if (!navigator.onLine) {
      return Promise.reject(new Error('You are currently offline. Please check your internet connection.'));
    }

    if (error.response && error.response.data) {
      // Return server-provided error message
      const serverMessage = error.response.data.message || 'An unexpected error occurred.';
      const customError = new Error(serverMessage);
      customError.statusCode = error.response.status;
      customError.data = error.response.data;
      return Promise.reject(customError);
    }

    return Promise.reject(new Error(error.message || 'Server is temporarily unreachable.'));
  }
);

export default api;
