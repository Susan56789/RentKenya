<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <!-- Card Header -->
      <div class="space-y-1">
        <h2 class="text-2xl font-bold text-center">Welcome back</h2>
        <p class="text-center text-gray-600">
          Please sign in to your account
        </p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <AlertCircleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>
      
      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="mt-4 space-y-4">
        <!-- Email Field -->
        <div class="space-y-1">
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            v-model.trim="form.email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
            :disabled="isLoading"
          />
        </div>

        <!-- Password Field -->
        <div class="space-y-1">
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              :disabled="isLoading"
            />
            <button 
              type="button"
              @click="togglePassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              :disabled="isLoading"
            >
              <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
              <EyeOffIcon v-else class="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              v-model="form.rememberMe"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              :disabled="isLoading"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <router-link
            to="/forgot-password"
            class="text-sm font-medium text-blue-600 hover:text-blue-500"
            :class="{ 'pointer-events-none opacity-50': isLoading }"
          >
            Forgot password?
          </router-link>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <template v-if="isLoading">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </template>
          <span v-else>Sign in</span>
        </button>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <router-link 
              to="/register" 
              class="font-medium text-blue-600 hover:text-blue-500"
              :class="{ 'pointer-events-none opacity-50': isLoading }"
            >
              Create one now
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { AlertCircle as AlertCircleIcon, Eye as EyeIcon, EyeOff as EyeOffIcon } from 'lucide-vue-next';
import axios from 'axios';
import { useAuth } from '@/composables/useAuth';

export default {
  name: 'LoginForm',
  
  components: {
    AlertCircleIcon,
    EyeIcon,
    EyeOffIcon
  },

  setup() {
    const router = useRouter();
    const { setToken } = useAuth();
    const error = ref('');
    const isLoading = ref(false);
    const showPassword = ref(false);

    const form = reactive({
      email: '',
      password: '',
      rememberMe: false
    });

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
        
        // Update shared auth state
        setToken(tokenString);
        
        // Update axios defaults
        axios.defaults.headers.common['Authorization'] = tokenString;

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

    // Check for remembered login
    const checkRememberedLogin = () => {
      if (localStorage.getItem('rememberMe') === 'true') {
        form.rememberMe = true;
      }
    };

    // Call on component mount
    checkRememberedLogin();

    return {
      form,
      error,
      isLoading,
      showPassword,
      handleLogin,
      togglePassword
    };
  }
};
</script>