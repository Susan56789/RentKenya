<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="bg-white shadow-md rounded-lg p-8">
        <h2 class="text-center text-2xl font-bold mb-6 text-gray-900">Login to RentKenya</h2>

        <!-- Social Login Buttons -->
        <div class="space-y-3 mb-6">
          <button
            @click="handleGoogleLogin"
            class="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            :disabled="isGoogleLoading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" class="mr-2">
              <path fill="#4285F4" d="M213.272 127.535c0-9.482-0.854-18.618-2.432-27.335H128v51.696h72.572a62.169 62.169 0 0 1-26.89 40.905v33.511h43.515c25.457-23.45 40.075-58.007 40.075-97.777Z"/>
              <path fill="#34A853" d="M128 216c36.285 0 66.724-12.005 88.965-32.593l-43.515-33.511c-12.075 8.1-27.561 12.89-45.45 12.89-34.967 0-64.616-23.611-75.201-55.3H8.358v34.601A127.538 127.538 0 0 0 128 216Z"/>
              <path fill="#FBBC05" d="M52.784 97.486c-2.69-8.001-2.69-16.667 0-24.668V38.217H8.358A127.788 127.788 0 0 0 0 128c0 20.579 4.908 40.007 13.358 57.783l43.426-33.511a76.005 76.005 0 0 1-4-54.786Z"/>
              <path fill="#EA4335" d="M128 50.786c19.787 0 37.59 7.075 51.596 20.904l38.7-38.7C194.251 12.901 162.565 0 128 0 78.958 0 34.247 28.684 13.358 70.217l43.426 33.511c10.585-31.689 40.234-55.342 75.216-55.342Z"/>
            </svg>
            {{ isGoogleLoading ? 'Loading...' : 'Sign in with Google' }}
          </button>

          <button
            @click="handleFacebookLogin"
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

          <!-- Remember Me Checkbox -->
          <div class="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              v-model="form.rememberMe"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
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
            class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50"
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
import { ref, reactive, onMounted } from 'vue';
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
    const isGoogleLoading = ref(false);
    const showPassword = ref(false);
    const googleInitialized = ref(false);

    const form = reactive({
      email: '',
      password: '',
      rememberMe: false
    });

    // Get Google Client ID from Vue CLI environment variables
    const googleClientId = process.env.VUE_APP_GOOGLE_CLIENT_ID;
    
    
    
    // Check if client ID is available on component mount
    onMounted(() => {
      if (!googleClientId) {
        console.error('VUE_APP_GOOGLE_CLIENT_ID is missing in environment variables');
        // Don't show error to user immediately, only when they try to use Google login
      } else {
        
        loadGoogleApi();
      }
    });

    // Load Google API script with better error handling
    const loadGoogleApi = () => {
      if (googleInitialized.value) return;
      
      // Check if the script is already loaded
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        googleInitialized.value = true;
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        googleInitialized.value = true;
      };
      
      script.onerror = () => {
        console.error('Failed to load Google API script');
        error.value = 'Failed to load Google authentication service';
      };
      
      document.head.appendChild(script);
    };

    // Handle Google Sign-In button click with improved error messages
    const handleGoogleLogin = () => {
      // Clear any previous errors
      error.value = '';
      
      if (!googleClientId) {
        error.value = 'Google authentication is not properly configured. Please contact support.';
        console.error('Missing Google Client ID. Check your .env file and ensure VUE_APP_GOOGLE_CLIENT_ID is set.');
        return;
      }

      isGoogleLoading.value = true;
      
      // Make sure Google API is initialized
      if (!window.google || !window.google.accounts) {
        if (!googleInitialized.value) {
          // Try loading the script again
          loadGoogleApi();
          
          // Set a timeout to check if Google API loaded
          setTimeout(() => {
            if (!window.google || !window.google.accounts) {
              error.value = 'Google authentication service is currently unavailable. Please try again later.';
              isGoogleLoading.value = false;
            } else {
              // If loaded, proceed with Google login
              initializeGoogleAuth();
            }
          }, 2000);
          return;
        } else {
          error.value = 'Google authentication service is not available. Please try again later.';
          isGoogleLoading.value = false;
          return;
        }
      }

      // If Google API is already loaded, initialize auth directly
      initializeGoogleAuth();
    };

    // Separated Google Auth initialization for better code organization
    const initializeGoogleAuth = () => {
  try {
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleResponse,
      cancel_on_tap_outside: true,
      context: 'signin',
      use_fedcm_for_prompt: true  
    });

    window.google.accounts.id.prompt((notification) => {
      // Use the new FedCM-compatible approach
      if (notification && notification.getMomentType) {
        const momentType = notification.getMomentType();
        console.log('Google prompt moment type:', momentType);
        
        // Check if we need to fall back to button rendering
        if (!momentType || momentType === 'dismissed' || 
            momentType === 'skipped' || momentType === 'notDisplayed') {
          
          renderGoogleButton();
          
          // Log specific reasons for debugging
          if (momentType === 'notDisplayed' && notification.getNotDisplayedReason) {
            console.warn('Google One Tap not displayed:', notification.getNotDisplayedReason());
          } else if (momentType === 'skipped' && notification.getSkippedReason) {
            console.warn('Google One Tap skipped:', notification.getSkippedReason());
          } else if (momentType === 'dismissed') {
            console.warn('Google One Tap dismissed');
          }
        }
      } else {
        // Fallback for older browsers or if notification object doesn't have expected methods
        renderGoogleButton();
      }
    });
  } catch (err) {
    console.error('Google Auth Initialization Error:', err);
    error.value = 'Failed to initialize Google authentication. Please try again later.';
    isGoogleLoading.value = false;
  }
};

// Separate function to render the Google button
const renderGoogleButton = () => {
  // Clean up any existing button first
  const existingButton = document.getElementById('googleLoginButton');
  if (existingButton) {
    existingButton.remove();
  }
  
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'googleLoginButton';
  document.body.appendChild(buttonContainer);
  
  window.google.accounts.id.renderButton(
    buttonContainer,
    { 
      theme: 'outline', 
      size: 'large', 
      width: 320  // Fixed width in pixels instead of percentage
    }
  );
  
  isGoogleLoading.value = false;
};

    // The rest of your component code remains the same
    const handleFacebookLogin = () => {
      error.value = 'Facebook login is not yet implemented';
    };

    const handleGoogleResponse = async (response) => {
      try {
        isLoading.value = true;
        isGoogleLoading.value = false;
        error.value = '';

        const backendResponse = await axios.post('https://rentkenya.onrender.com/api/users/google-login', {
          token: response.credential
        });

        const { token, user } = backendResponse.data;
        
        if (!token) {
          throw new Error('No token received from server');
        }

        const tokenString = `Bearer ${token}`;
        auth.setToken(tokenString);
        
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        localStorage.setItem('rememberMe', 'true');
        router.push('/');
      } catch (err) {
        console.error('Google Login Error:', err);
        error.value = err.response?.data?.message || 'Google login failed. Please try again.';
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

        const { token, user } = response.data;
        
        if (!token) {
          throw new Error('No token received from server');
        }

        const tokenString = `Bearer ${token}`;
        auth.setToken(tokenString);
        
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        if (form.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

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

    return {
      form,
      error,
      isLoading,
      isGoogleLoading,
      showPassword,
      handleGoogleLogin,
      handleFacebookLogin,
      handleLogin,
      togglePassword
    };
  }
};
</script>