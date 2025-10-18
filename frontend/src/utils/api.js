import axios from 'axios';

// Get API URL from environment variable or fallback to empty string for same-origin requests
const getApiUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  
  // If envUrl is undefined, null, or empty string, return empty string for same-origin
  if (!envUrl || envUrl === 'undefined' || envUrl === 'null') {
    return '';
  }
  
  // Remove trailing slashes
  return envUrl.replace(/\/+$/, '');
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30-second timeout for better reliability with file uploads
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Add token refresh logic here if needed in the future
      return api(originalRequest);
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;