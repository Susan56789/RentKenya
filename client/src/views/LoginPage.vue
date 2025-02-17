<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <base-card class="w-full max-w-md">
      <card-header class="space-y-1">
        <card-title class="text-2xl font-bold text-center">Welcome back</card-title>
        <p class="text-center text-gray-600">
          Please sign in to your account
        </p>
      </card-header>
      <card-content>
        <base-alert v-if="error" variant="destructive" class="mb-4">
          <template #icon>
            <alert-circle-icon class="h-4 w-4" />
          </template>
          <alert-description>{{ error }}</alert-description>
        </base-alert>
        
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-1">
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              v-model="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div class="space-y-1">
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              v-model="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                v-model="rememberMe"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <router-link
              to="/forgot-password"
              class="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </router-link>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <router-link 
              to="/register" 
              class="font-medium text-blue-600 hover:text-blue-500"
            >
              Create one now
            </router-link>
          </p>
        </div>
      </card-content>
    </base-card>
  </div>
</template>

<script>
import { BaseCard, CardHeader, CardTitle, CardContent } from '@components/layout';
import { AlertCircle as AlertCircleIcon } from 'lucide-vue-next';
import { BaseAlert, AlertDescription } from '@components/layout';
import axios from 'axios';

export default {
  name: 'LoginForm',
  components: {
    BaseCard,
    CardHeader,
    CardTitle,
    CardContent,
    BaseAlert,
    AlertDescription,
    AlertCircleIcon
  },
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      error: '',
      isLoading: false
    };
  },
  methods: {
    async handleLogin() {
      this.error = '';
      this.isLoading = true;

      try {
        // Configure axios to include credentials
        const response = await axios.post('https://rentkenya.onrender.com/api/users/login', {
          email: this.email,
          password: this.password
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const { token } = response.data;
        
        if (!token) {
          throw new Error('No token received from server');
        }

        // Store token with Bearer prefix
        localStorage.setItem('token', `Bearer ${token}`);
        
        // Configure axios defaults for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        this.$router.push('/');
      } catch (err) {
        console.error('Login Error:', err);
        this.error = err.response?.data?.message || 'Login failed. Please check your credentials.';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
