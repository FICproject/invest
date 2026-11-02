import axios, { AxiosInstance } from 'axios';
import { APP_CONFIG } from '../constants/config';
import storage from '../utils/storage';

const api: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: APP_CONFIG.TIMEOUT_MS,
});

// Dynamically use custom API URL if user configured it
export const setBaseUrl = (newUrl: string) => {
  api.defaults.baseURL = newUrl;
};

// Initialize custom URL from storage on startup
storage.getCustomApiUrl().then((savedUrl) => {
  if (savedUrl) {
    api.defaults.baseURL = savedUrl;
  }
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Standardize errors and unwrap response.data
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.data) {
      const serverMessage = error.response.data.message || error.response.data.error || 'Server error occurred.';
      const customError = new Error(serverMessage) as any;
      customError.statusCode = error.response.status;
      customError.data = error.response.data;
      return Promise.reject(customError);
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please check your backend connection.'));
    }
    return Promise.reject(new Error(error.message || 'Server is temporarily unreachable.'));
  }
);

export default api;
