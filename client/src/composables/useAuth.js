import { ref } from 'vue';

const authToken = ref(localStorage.getItem('token') || null);

export function useAuth() {
  const setToken = (token) => {
    authToken.value = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  const getToken = () => authToken.value;

  const isAuthenticated = () => !!authToken.value;

  return {
    authToken,
    setToken,
    getToken,
    isAuthenticated
  };
}