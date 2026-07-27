import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach JWT token if it exists in local storage
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

// Response interceptor: Global error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is expired or invalid (401), we can trigger logout actions
    if (error.response && error.response.status === 401) {
      const message = error.response.data?.message || '';
      // Only clear and redirect if we actually had a token (expired token)
      if (localStorage.getItem('token') && !message.includes('not verified')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
