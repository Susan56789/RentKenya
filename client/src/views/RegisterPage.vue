<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-gray-900">Create an account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </router-link>
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-8">
        <!-- Social Registration Buttons -->
        <div class="space-y-3 mb-6">
          <button
            @click="handleGoogleRegistration"
            class="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            :disabled="isGoogleLoading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" class="mr-2">
              <path fill="#4285F4" d="M213.272 127.535c0-9.482-0.854-18.618-2.432-27.335H128v51.696h72.572a62.169 62.169 0 0 1-26.89 40.905v33.511h43.515c25.457-23.45 40.075-58.007 40.075-97.777Z"/>
              <path fill="#34A853" d="M128 216c36.285 0 66.724-12.005 88.965-32.593l-43.515-33.511c-12.075 8.1-27.561 12.89-45.45 12.89-34.967 0-64.616-23.611-75.201-55.3H8.358v34.601A127.538 127.538 0 0 0 128 216Z"/>
              <path fill="#FBBC05" d="M52.784 97.486c-2.69-8.001-2.69-16.667 0-24.668V38.217H8.358A127.788 127.788 0 0 0 0 128c0 20.579 4.908 40.007 13.358 57.783l43.426-33.511a76.005 76.005 0 0 1-4-54.786Z"/>
              <path fill="#EA4335" d="M128 50.786c19.787 0 37.59 7.075 51.596 20.904l38.7-38.7C194.251 12.901 162.565 0 128 0 78.958 0 34.247 28.684 13.358 70.217l43.426 33.511c10.585-31.689 40.234-55.342 75.216-55.342Z"/>
            </svg>
            {{ isGoogleLoading ? 'Loading...' : 'Sign up with Google' }}
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

        <!-- Manual Registration Form -->
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label htmlFor="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              :disabled="isLoading || isGoogleRegistration"
              placeholder="Choose a unique username"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              :disabled="isLoading || isGoogleRegistration"
              placeholder="Enter your email address"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              id="phone"
              v-model="form.phoneNumber"
              type="tel"
              required
              :disabled="isLoading || isGoogleRegistration"
              placeholder="Enter your phone number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div v-if="!isGoogleRegistration">
            <label htmlFor="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Create a strong password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeOffIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p class="mt-2 text-xs text-gray-500">
              Password must be at least 8 characters long with uppercase, lowercase, numbers, and special characters
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Eye as EyeIcon, EyeOff as EyeOffIcon } from 'lucide-vue-next';
import axios from 'axios';

export default {
  name: 'RegisterForm',
  components: {
    EyeIcon,
    EyeOffIcon
  },
  setup() {
    const router = useRouter();
    const error = ref('');
    const isLoading = ref(false);
    const isGoogleLoading = ref(false);
    const showPassword = ref(false);
    const isGoogleRegistration = ref(false);
    const googleInitialized = ref(false);

    const form = reactive({
      username: '',
      email: '',
      password: '',
      phoneNumber: '',
      googleId: null,
      avatarUrl: null,
      name: ''
    });

    // Get Google Client ID from environment variables - make sure it has VITE_ prefix
    const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || '';

    // Load Google API script
    const loadGoogleApi = () => {
      if (googleInitialized.value) return;

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        googleInitialized.value = true;
        console.log('Google API script loaded successfully');
      };
      
      script.onerror = () => {
        console.error('Failed to load Google API script');
        error.value = 'Failed to load Google authentication';
      };
      
      document.head.appendChild(script);
    };

    // Handle Google Sign-In button click
    const handleGoogleRegistration = () => {
      if (!googleClientId) {
        error.value = 'Google authentication is not properly configured';
        console.error('Google Client ID is not defined. Check your environment variables.');
        return;
      }

      isGoogleLoading.value = true;
      
      // Make sure Google API is initialized
      if (!window.google || !window.google.accounts) {
        if (!googleInitialized.value) {
          // Try loading the script again if it wasn't loaded properly
          loadGoogleApi();
          setTimeout(handleGoogleRegistration, 1000); // Retry after a delay
          return;
        } else {
          error.value = 'Google authentication is not available';
          isGoogleLoading.value = false;
          return;
        }
      }

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
          cancel_on_tap_outside: true,
          context: 'signup'
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            isGoogleLoading.value = false;
            
            if (notification.isNotDisplayed()) {
              console.warn('Google One Tap not displayed:', notification.getNotDisplayedReason());
            } else if (notification.isSkippedMoment()) {
              console.warn('Google One Tap skipped:', notification.getSkippedReason());
            }
          }
        });
      } catch (err) {
        console.error('Google Auth Initialization Error:', err);
        error.value = 'Failed to initialize Google authentication';
        isGoogleLoading.value = false;
      }
    };

    // Process the response from Google Sign-In
    const handleGoogleResponse = async (response) => {
      try {
        isLoading.value = true;
        isGoogleLoading.value = false;
        isGoogleRegistration.value = true;
        error.value = '';

        // Decode Google ID token
        const credential = response.credential;
        const googlePayload = parseJwt(credential);

        // Populate form with Google data
        form.email = googlePayload.email;
        form.username = generateUsername(googlePayload);
        form.googleId = googlePayload.sub;
        form.name = googlePayload.name || '';
        form.avatarUrl = googlePayload.picture || null;

        // Send Google token to backend for registration
        const { data } = await axios.post('https://rentkenya.onrender.com/api/users/register', {
          email: form.email,
          username: form.username,
          googleId: form.googleId,
          phoneNumber: form.phoneNumber,
          name: form.name,
          avatarUrl: form.avatarUrl
        });

        console.log('Registration successful:', data);

        // Navigate to login
        router.push('/login?registered=google');
      } catch (err) {
        console.error('Google Registration Error:', err);
        error.value = err.response?.data?.message || 'Google registration failed';
        isGoogleRegistration.value = false;
      } finally {
        isLoading.value = false;
      }
    };

    // Helper function to parse JWT token
    const parseJwt = (token) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join('')
        );

        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error('Error parsing JWT:', error);
        return {};
      }
    };

    // Generate a username from Google profile
    const generateUsername = (googlePayload) => {
      const baseName = googlePayload.name 
        ? googlePayload.name.toLowerCase().replace(/\s+/g, '_') 
        : googlePayload.email.split('@')[0];
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      return `${baseName}_${randomSuffix}`;
    };

    const handleRegister = async () => {
      error.value = '';
      
      if (!validateForm()) {
        return;
      }

      isLoading.value = true;

      try {
        const { data } = await axios.post('https://rentkenya.onrender.com/api/users/register', {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          phoneNumber: form.phoneNumber.trim(),
          googleId: form.googleId,
          name: form.name,
          avatarUrl: form.avatarUrl
        });

        console.log('Registration successful:', data);

        // Navigate to login with success parameter
        router.push('/login?registered=email');
      } catch (err) {
        console.error('Registration Error:', err);
        error.value = err.response?.data?.message || 'Registration failed. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    const validateForm = () => {
      // Skip password validation for Google registration
      if (isGoogleRegistration.value) {
        if (!form.phoneNumber) {
          error.value = 'Phone number is required';
          return false;
        }
        return true;
      }

      if (!form.username || !form.email || !form.password || !form.phoneNumber) {
        error.value = 'Please fill in all fields';
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        error.value = 'Please enter a valid email address';
        return false;
      }

      if (form.password.length < 8) {
        error.value = 'Password must be at least 8 characters long';
        return false;
      }

      // Check for uppercase, lowercase, number, and special character
      const hasUpperCase = /[A-Z]/.test(form.password);
      const hasLowerCase = /[a-z]/.test(form.password);
      const hasNumbers = /\d/.test(form.password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);
      
      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        error.value = 'Password must contain uppercase, lowercase, numbers, and special characters';
        return false;
      }

      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(form.phoneNumber)) {
        error.value = 'Please enter a valid phone number';
        return false;
      }

      return true;
    };

    // Initialize Google API on component mount
    onMounted(() => {
      loadGoogleApi();
    });

    return {
      form,
      error,
      isLoading,
      isGoogleLoading,
      showPassword,
      isGoogleRegistration,
      handleGoogleRegistration,
      handleRegister
    };
  }
};
</script>