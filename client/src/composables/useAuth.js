import { ref } from 'vue';
import axios from 'axios';

const authToken = ref(localStorage.getItem('token') || null);

export function useAuth() {
  const setToken = (token) => {
    authToken.value = token;
    if (token) {
      localStorage.setItem('token', token);
      // Set the default authorization header for all future axios requests
      axios.defaults.headers.common['Authorization'] = token;
    } else {
      localStorage.removeItem('token');
      // Remove the authorization header when logging out
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const getToken = () => {
    // First check the ref, then fallback to localStorage in case it was updated in another tab
    const token = authToken.value || localStorage.getItem('token');
    if (!authToken.value && token) {
      // Sync the ref if token exists in localStorage but not in ref
      authToken.value = token;
    }
    return token;
  };

  const isAuthenticated = () => {
    return !!getToken(); // Use getToken to ensure we check both ref and localStorage
  };

  return {
    authToken,
    setToken,
    getToken,
    isAuthenticated
  };
}