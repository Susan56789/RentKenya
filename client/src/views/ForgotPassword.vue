<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <base-card class="w-full max-w-md">
        <card-header class="space-y-1">
          <card-title class="text-2xl font-bold text-center">Forgot Password</card-title>
          <p class="text-center text-gray-600">
            Enter your email to reset your password
          </p>
        </card-header>
        <card-content>
          <base-alert v-if="error" variant="destructive" class="mb-4">
            <template #icon>
              <alert-circle-icon class="h-4 w-4" />
            </template>
            <alert-description>{{ error }}</alert-description>
          </base-alert>
          <base-alert v-if="success" variant="success" class="mb-4">
            <alert-description>{{ success }}</alert-description>
          </base-alert>
  
          <form @submit.prevent="handleForgotPassword" class="space-y-4">
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
  
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </form>
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
    name: 'ForgotPassword',
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
        error: '',
        success: '',
        isLoading: false
      };
    },
    methods: {
      async handleForgotPassword() {
        this.error = '';
        this.success = '';
        this.isLoading = true;
  
        if (!this.validateForm()) {
          this.isLoading = false;
          return;
        }
  
        try {
          await axios.post('https://rentkenya.onrender.com/api/users/forgot-password', {
            email: this.email.trim()
          });
          this.success = 'A password reset link has been sent to your email';
        } catch (err) {
          console.error('Forgot Password Error:', err);
          this.error = err.response?.data?.message || 'Failed to send reset link';
        } finally {
          this.isLoading = false;
        }
      },
      validateForm() {
        if (!this.email) {
          this.error = 'Please enter your email';
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
          this.error = 'Please enter a valid email address';
          return false;
        }
        return true;
      }
    }
  };
  </script>
  