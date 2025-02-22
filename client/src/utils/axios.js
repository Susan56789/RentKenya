import axios from 'axios';
import { useAuth } from '@/composables/useAuth';

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://rentkenya.onrender.com'
  : 'http://localhost:5000';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.withCredentials = true;
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  response => {
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      const auth = useAuth();
      auth.setToken(newToken);
    }
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      const auth = useAuth();
      auth.setToken(null);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;