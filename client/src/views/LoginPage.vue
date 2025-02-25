<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="bg-white shadow-md rounded-lg p-8">
        <h2 class="text-center text-2xl font-bold mb-6 text-gray-900">Login to RentKenya</h2>

        <!-- Social Login Buttons -->
        <div class="space-y-3 mb-6">
          <button
            v-if="isGoogleLoginEnabled"
            @click="initializeGoogleLogin"
            class="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" class="mr-2">
              <path fill="#4285F4" d="M213.272 127.535c0-9.482-0.854-18.618-2.432-27.335H128v51.696h72.572a62.169 62.169 0 0 1-26.89 40.905v33.511h43.515c25.457-23.45 40.075-58.007 40.075-97.777Z"/>
              <path fill="#34A853" d="M128 216c36.285 0 66.724-12.005 88.965-32.593l-43.515-33.511c-12.075 8.1-27.561 12.89-45.45 12.89-34.967 0-64.616-23.611-75.201-55.3H8.358v34.601A127.538 127.538 0 0 0 128 216Z"/>
              <path fill="#FBBC05" d="M52.784 97.486c-2.69-8.001-2.69-16.667 0-24.668V38.217H8.358A127.788 127.788 0 0 0 0 128c0 20.579 4.908 40.007 13.358 57.783l43.426-33.511a76.005 76.005 0 0 1-4-54.786Z"/>
              <path fill="#EA4335" d="M128 50.786c19.787 0 37.59 7.075 51.596 20.904l38.7-38.7C194.251 12.901 162.565 0 128 0 78.958 0 34.247 28.684 13.358 70.217l43.426 33.511c10.585-31.689 40.234-55.342 75.216-55.342Z"/>
            </svg>
            Sign in with Google
          </button>

          <button
            v-if="isFacebookLoginEnabled"
            @click="initializeFacebookLogin"
            class="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" class="mr-2">
              <path fill="#1877F2" d="M256 128C256 57.308 198.692 0 128 0S0 57.308 0 128c0 63.888 46.808 116.843 108 126.445V165H75.5v-37H108V99.5c0-32.379 19.284-50.25 48.857-50.25 14.157 0 28.965 2.529 28.965 2.529v31.8h-16.333c-16.005 0-20.989 9.942-20.989 20.125V128h35.764l-5.714 37H148v89.45c61.192-9.602 108-62.557 108-126.45"/>
              <path fill="#FFFFFF" d="M178.25 165l5.714-37H148v-23.875c0-10.183 4.984-20.125 20.989-20.125H185V52.5s-14.808-2.529-28.965-2.529C126.464 50 108 67.871 108 99.5V128H75.5v37H108v89.45a129.35 129.35 0 0 0 40 0V165h30.25"/>
            </svg>
            Sign in with Facebook
          </button>
        </div>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-3 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email Field -->
          <div>
            <label htmlFor="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              v-model.trim="form.email"
              required
              placeholder="Enter your email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Password Field -->
          <div>
            <label htmlFor="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password"
                required
                placeholder="Enter your password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="button"
                @click="togglePassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeOffIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          <!-- Forgot Password -->
          <div class="flex justify-end">
            <router-link
              to="/forgot-password"
              class="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </router-link>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition duration-300 disabled:opacity-50"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <router-link 
              to="/register" 
              class="font-medium text-blue-600 hover:text-blue-500"
            >
              Register
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Eye as EyeIcon, EyeOff as EyeOffIcon } from 'lucide-vue-next';
import axios from 'axios';
import { useAuth } from '@/composables/useAuth';

export default {
  name: 'LoginForm',
  
  components: {
    EyeIcon,
    EyeOffIcon
  },

  setup() {
    const router = useRouter();
    const auth = useAuth();
    const error = ref('');
    const isLoading = ref(false);
    const showPassword = ref(false);

    const form = reactive({
      email: '',
      password: '',
      rememberMe: false
    });

    // Safely get Social Login Client IDs
    const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || '';
    const facebookClientId = import.meta.env?.VITE_FACEBOOK_CLIENT_ID || '';

    // Compute if Social Logins are enabled
    const isGoogleLoginEnabled = computed(() => !!googleClientId);
    const isFacebookLoginEnabled = computed(() => !!facebookClientId);

    const initializeGoogleLogin = () => {
      // Check if Google auth is available and client ID exists
      if (!window.google || !googleClientId) {
        error.value = 'Google authentication is not available';
        return;
      }

      try {
        const googleAuth = window.google.accounts.id;
        googleAuth.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse
        });

        googleAuth.prompt();
      } catch (err) {
        console.error('Google Auth Initialization Error:', err);
        error.value = 'Failed to initialize Google authentication';
      }
    };

    const initializeFacebookLogin = () => {
      // Placeholder for Facebook login logic
      error.value = 'Facebook login is not yet implemented';
    };

    const handleGoogleResponse = async (response) => {
      try {
        isLoading.value = true;
        error.value = '';

        // Send Google token to backend for verification and login
        const backendResponse = await axios.post('https://rentkenya.onrender.com/api/users/google-login', {
          token: response.credential
        });

        const { token } = backendResponse.data;
        
        if (!token) {
          throw new Error('No token received from server');
        }

        // Create token string with Bearer prefix
        const tokenString = `Bearer ${token}`;
        
        // Use auth.setToken which will handle both localStorage and axios headers
        auth.setToken(tokenString);

        // Always remember Google logins
        localStorage.setItem('rememberMe', 'true');

        // Navigate to home
        router.push('/');
      } catch (err) {
        console.error('Google Login Error:', err);
        error.value = err.response?.data?.message || 'Google login failed';
      } finally {
        isLoading.value = false;
      }
    };

    const validateForm = () => {
      if (!form.email || !form.password) {
        error.value = 'Please fill in all fields';
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        error.value = 'Please enter a valid email address';
        return false;
      }

      return true;
    };

    const handleLogin = async () => {
      error.value = '';
      
      if (!validateForm()) {
        return;
      }

      isLoading.value = true;

      try {
        const response = await axios.post('https://rentkenya.onrender.com/api/users/login', {
          email: form.email,
          password: form.password
        });

        const { token } = response.data;
        
        if (!token) {
          throw new Error('No token received from server');
        }

        // Create token string with Bearer prefix
        const tokenString = `Bearer ${token}`;
        
        // Use auth.setToken which will handle both localStorage and axios headers
        auth.setToken(tokenString);

        // Handle remember me preference
        if (form.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        // Navigate to home
        router.push('/');
      } catch (err) {
        console.error('Login Error:', err);
        error.value = err.response?.data?.message || 'Invalid email or password';
      } finally {
        isLoading.value = false;
      }
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    // Load Google Auth script
    onMounted(() => {
      // Only load script if Google login is enabled
      if (isGoogleLoginEnabled.value) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    });

    return {
      form,
      error,
      isLoading,
      showPassword,
      isGoogleLoginEnabled,
      isFacebookLoginEnabled,
      initializeGoogleLogin,
      initializeFacebookLogin,
      handleLogin,
      togglePassword
    };
  }
};
</script>