import axios from 'axios';
import { useAuth } from '@/composables/useAuth';

const baseURL = process.env.NODE_ENV === 'production'
  | 'https://rentkenya.onrender.com';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  response => {
    // Check for token renewal in response headers
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      // Update token
      const { setToken } = useAuth();
      setToken(newToken);
    }
    return response;
  },
  error => {
    if (error.response) {
      const { status } = error.response;
      const { setToken } = useAuth(); 
      
      switch (status) {
        case 401:
          // Clear token and redirect
          setToken(null);
          window.location.href = '/login';
          break;
          
        case 403:
          console.error('Access denied');
          break;
          
        case 429:
          console.error('Rate limit exceeded');
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default api;