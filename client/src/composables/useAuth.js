import { ref, onUnmounted } from 'vue';
import axios from 'axios';

const TOKEN_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

export function useAuth() {
  const authToken = ref(localStorage.getItem('token') || null);
  const lastActivityTime = ref(parseInt(localStorage.getItem('lastActivityTime') || '0'));

  // Function to check and clear token if expired
  const checkTokenExpiration = () => {
    const currentTime = Date.now();
    if (currentTime - lastActivityTime.value > TOKEN_EXPIRATION_TIME) {
      // Token has expired, clear it
      setToken(null);
    }
  };

  // Function to update last activity time
  const updateLastActivityTime = () => {
    const currentTime = Date.now();
    lastActivityTime.value = currentTime;
    localStorage.setItem('lastActivityTime', currentTime.toString());
  };

  const setToken = (token) => {
    authToken.value = token;
    if (token) {
      localStorage.setItem('token', token);
      // Set the default authorization header for all future axios requests
      axios.defaults.headers.common['Authorization'] = token;
      // Update last activity time when setting a new token
      updateLastActivityTime();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('lastActivityTime');
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

    // Check token expiration
    checkTokenExpiration();

    return token;
  };

  const isAuthenticated = () => {
    return !!getToken(); // Use getToken to ensure we check both ref and localStorage
  };

  // Set up periodic check for token expiration
  const expirationCheckInterval = setInterval(checkTokenExpiration, 5 * 60 * 1000); // Check every 5 minutes

  // Attach event listeners to track user activity
  const trackActivity = () => {
    updateLastActivityTime();
  };

  // Add event listeners for various user activities
  window.addEventListener('mousemove', trackActivity);
  window.addEventListener('keydown', trackActivity);
  window.addEventListener('click', trackActivity);

  // Cleanup function to remove event listeners and clear interval
  onUnmounted(() => {
    clearInterval(expirationCheckInterval);
    window.removeEventListener('mousemove', trackActivity);
    window.removeEventListener('keydown', trackActivity);
    window.removeEventListener('click', trackActivity);
  });

  return {
    authToken,
    setToken,
    getToken,
    isAuthenticated
  };
}